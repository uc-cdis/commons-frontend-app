import { getCookie } from 'cookies-next';
import { GEN3_API } from "@gen3/core/server";
import { debugError, debugLog, previewJson } from './debugLog';
// import { Agent } from "undici";
//
// const agent = new Agent({ keepAliveTimeout: 1, pipelining: 0 });
//
// async function postWithRetry(url: string, body: string, tries = 2) {
//     for (let i = 0; i < tries; i++) {
//         try {
//             return await fetch(url, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json", Connection: "close" },
//                 body,
//                 // @ts-expect-error dispatcher is supported by Node's fetch
//                 dispatcher: agent,
//             });
//         } catch (e: any) {
//             const code = e?.cause?.code;
//             if (i === tries - 1 || !["EPIPE", "ECONNRESET", "UND_ERR_SOCKET"].includes(code)) throw e;
//         }
//     }
// }

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}


const DEFAULT_METHOD = HttpMethod.GET;
const CONTENT_TYPE_HEADER = 'Content-Type';
const CONTENT_TYPE_JSON = 'application/json';


export const HTTPErrorMessages: Record<number, string> = {
  // 4xx Client Errors
  400: 'Bad Request',
  401: 'Unauthorized',
  402: 'Payment Required',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  406: 'Not Acceptable',
  407: 'Proxy Authentication Required',
  408: 'Request Timeout',
  409: 'Conflict',
  410: 'Gone',
  411: 'Length Required',
  412: 'Precondition Failed',
  413: 'Payload Too Large',
  414: 'URI Too Long',
  415: 'Unsupported Media Type',
  416: 'Range Not Satisfiable',
  417: 'Expectation Failed',
  418: "I'm a teapot",
  421: 'Misdirected Request',
  422: 'Unprocessable Entity',
  423: 'Locked',
  424: 'Failed Dependency',
  425: 'Too Early',
  426: 'Upgrade Required',
  428: 'Precondition Required',
  429: 'Too Many Requests',
  431: 'Request Header Fields Too Large',
  451: 'Unavailable For Legal Reasons',

  // 5xx Server Errors
  500: 'Internal Server Error',
  501: 'Not Implemented',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
  505: 'HTTP Version Not Supported',
  506: 'Variant Also Negotiates',
  507: 'Insufficient Storage',
  508: 'Loop Detected',
  510: 'Not Extended',
  511: 'Network Authentication Required',
};

/**
 * Represents an error that occurs during an HTTP request.
 * Extends the built-in `Error` class to provide additional information
 * about the HTTP status code and optional response data.
 */
export class HTTPError extends Error {
  constructor(
    public status: number,
    message: string,
    public responseData?: any,
  ) {
    super(message);
    this.name = 'HTTPError';
  }
}

/**
 * Retrieves a CSRF token from the server.
 *
 * This asynchronous function sends a GET request to the server's status endpoint
 * to fetch the CSRF token in the response. The token is expected to be included
 * in the JSON response under the `csrf_token` field.
 *
 * @returns {Promise<string | null>} A promise that resolves to the CSRF token as a string if successfully retrieved,
 * or null if the token is not present in the response.
 * @throws {HTTPError} Throws an HTTPError if the server response is not successful.
 */
const getCSRFToken = async (): Promise<string | null> => {
  const requestHeaders = new Headers({
    [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
  });
  const response = await fetch(`${GEN3_API}/_status`, {
    headers: requestHeaders,
  });

  if (!response.ok) {
    throw new HTTPError(response.status, response.statusText);
  }

  const { csrf: csrfToken } = await response.json();
  return csrfToken || null;
};


/**
 * Fetches JSON data from a specified URL using the Fetch API.
 *
 * @param {string} url - The URL to fetch the JSON data from.
 * @param {boolean} [requiresCSRF=false] - Indicates whether a CSRF token is required for the request.
 *                                         If true, the CSRF token will be added to the request headers.
 * @param {string} [method=DEFAULT_METHOD] - The HTTP method to use for the request (e.g., 'GET', 'POST').
 * @param {unknown} [body=undefined] - The request body to send, applicable when using methods like 'POST'.
 *
 * @param signal - Abort fetch
 * @returns {Promise<T>} A promise that resolves to the parsed JSON data from the response.
 *
 * @throws {HTTPError} Throws an error if the HTTP response status indicates a failure.
 */
export const fetchJSONDataFromURL = async <T = unknown>(
  url: string,
  requiresCSRF: boolean = false,
  method: HttpMethod = DEFAULT_METHOD,
  body: unknown = undefined,
  signal?: AbortSignal,
): Promise<T | null> => {
  const requestHeaders = new Headers({
    [CONTENT_TYPE_HEADER]: CONTENT_TYPE_JSON,
  });
  const startedAt = Date.now();
  let hasCSRFToken = false;
  let hasAuthorization = false;

  if (requiresCSRF) {
    const csrfToken = await getCSRFToken();
    if (csrfToken) {
      requestHeaders.set('X-CSRF-Token', csrfToken);
      hasCSRFToken = true;
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const accessToken = getCookie('credentials_token');
    if (accessToken) {
      requestHeaders.set('Authorization', `Bearer ${accessToken}`);
      hasAuthorization = true;
    }
  }

  // header values are never logged, only whether they were set
  debugLog('fetchJSONDataFromURL', `${method} ${url}`, {
    requiresCSRF,
    hasCSRFToken,
    hasAuthorization,
    bodyChars: typeof body === 'string' ? body.length : undefined,
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())
        ? body
        : undefined,
      ...(signal ? { signal: signal } : {}),
    } as RequestInit);
  } catch (error) {
    debugError('fetchJSONDataFromURL', `${method} ${url} request failed`, error, {
      ms: Date.now() - startedAt,
    });
    throw error;
  }

  debugLog('fetchJSONDataFromURL', `${method} ${url} -> ${response.status} ${response.statusText}`, {
    ms: Date.now() - startedAt,
    contentType: response.headers.get(CONTENT_TYPE_HEADER),
  });

  if (!response.ok) {
    // read as text first: gateways can answer with plain text (e.g. "failed csrf check"), which json() can't parse
    const errorText = await response.text();
    let errorBody: unknown = errorText;
    try {
      errorBody = JSON.parse(errorText);
    } catch {
      // not JSON, keep the raw text
    }
    debugLog('fetchJSONDataFromURL', `${method} ${url} error body`, {
      status: response.status,
      body: typeof errorBody === 'string' ? errorBody.slice(0, 500) : previewJson(errorBody),
    });
    throw new HTTPError(response.status, response.statusText, errorBody);
  }

  if (response.status === 204) {
    // no content so returns null
    return null;
  }
  const data = await response.json();
  debugLog('fetchJSONDataFromURL', `${method} ${url} response body:\n${previewJson(data)}`);
  return data;
};
