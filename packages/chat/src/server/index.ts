import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import type { NextApiRequest, NextApiResponse } from "next";
import { CopilotRuntime } from "@copilotkit/runtime/v2";
import { createCopilotNodeListener } from "@copilotkit/runtime/v2/node";
import { HttpAgent } from "@ag-ui/client";
import { fetchDownload, type VerifyToken } from "./download";

export interface ChatHandlerOptions {
  verifyToken: VerifyToken;
  /** the public path, not /api/*. the rewrite does not change req.url */
  endpoint: string;
  /** the agent's root url, e.g. http://gdc-agent */
  agentBaseUrl: string;
}

// so adding a path never gives a double slash: http://gdc-agent/ + /agui/
const withoutTrailingSlash = (url: string): string => url.replace(/\/+$/, "");

// registry of named agents. "default" is the name useChat asks for
const createCopilotRuntime = (agentUrl: string): CopilotRuntime =>
  new CopilotRuntime({
    // this needs to be a function as we need token per caller
    agents: ({ request }) => {
      const authorization = request.headers.get("authorization");
      return {
        default: new HttpAgent({
          url: agentUrl,
          headers: {
            ...(authorization ? { Authorization: authorization } : {}),
            // undici would advertise gzip, and a compressing agent batches the answer
            "Accept-Encoding": "identity",
          },
        }),
      };
    },
  });

export const createChatHandler = ({ verifyToken, endpoint, agentBaseUrl }: ChatHandlerOptions) => {
  // keep the trailing slash: the agent mounts /agui/, so a bare /agui falls through to its ui
  const agentUrl = `${withoutTrailingSlash(agentBaseUrl)}/agui/`;
  let endpointHandler: ReturnType<typeof createCopilotNodeListener> | null = null;

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // keeps Next from gzipping the stream - gzip batches it into one blob
      req.headers["accept-encoding"] = "identity";
      // the revproxy buffers the portal route (unlike /agent), which would hold the stream back
      res.setHeader("X-Accel-Buffering", "no");

      endpointHandler ??= createCopilotNodeListener({
        runtime: createCopilotRuntime(agentUrl),
        basePath: endpoint,
        // client posts {method, params, body}, v2 defaults to multi-route and 404s it
        mode: "single-route",
        hooks: {
          onBeforeHandler: async (ctx) => {
            // info only lists agent names, and 401ing it makes useAgent throw in render
            if (ctx.route.method === "info") return;

            const token = await verifyToken(ctx.request.headers.get("cookie") ?? undefined);
            if (!token) {
              throw new Response(JSON.stringify({ error: "Authentication required." }), {
                status: 401,
                headers: { "content-type": "application/json" },
              });
            }

            // headers are immutable, so clone. the agents factory reads this back
            const headers = new Headers(ctx.request.headers);
            headers.set("authorization", `Bearer ${token}`);
            return new Request(ctx.request, { headers });
          },
        },
      });

      await endpointHandler(req, res);
    } catch (error) {
      console.error("[chat-server] handler threw:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Chat runtime error." });
        return;
      }
      res.end();
    }
  };
};

export interface DownloadHandlerOptions {
  verifyToken: VerifyToken;
  /** the agent's root url, e.g. http://gdc-agent */
  agentBaseUrl: string;
}

const firstValue = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** GET /download/<kind>/<handle>: the agent's download links, after a login check. */
export const createDownloadHandler = ({ verifyToken, agentBaseUrl }: DownloadHandlerOptions) => {
  const deps = { verifyToken, agentBaseUrl: withoutTrailingSlash(agentBaseUrl) };

  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      res.status(405).end();
      return;
    }

    try {
      const response = await fetchDownload(
        {
          kind: firstValue(req.query.kind),
          handle: firstValue(req.query.handle),
          format: firstValue(req.query.format) || undefined,
          cookie: req.headers.cookie,
        },
        deps,
      );

      res.status(response.status);
      response.headers.forEach((value, name) => res.setHeader(name, value));
      if (!response.body) {
        res.end();
        return;
      }
      // streamed, not buffered: a manifest for a large cohort can be many megabytes.
      // pipeline, not pipe: a failed stream or a closed tab tears down both sides
      await pipeline(Readable.fromWeb(response.body as NodeReadableStream), res);
    } catch (error) {
      // the user closed the tab or cancelled mid-download: normal, not an error
      if ((error as NodeJS.ErrnoException).code === "ERR_STREAM_PREMATURE_CLOSE") return;
      console.error("[chat-download] handler threw:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Download failed." });
        return;
      }
      res.end();
    }
  };
};
