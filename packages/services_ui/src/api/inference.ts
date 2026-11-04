import type { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { debugError, debugLog, previewJson } from "../utils/debugLog";

const MOCKED_DATA_DIR = './data/inference_response';

// server-only (no NEXT_PUBLIC_ prefix): the in-cluster service name is not reachable from a browser
const GEN3_INFERENCE_SERVICE =
    process.env.GEN3_INFERENCE_SERVICE || 'http://conduit-server.default.svc.cluster.local:8080';

/**
 * The Gen3 session token from the request cookies. `access_token` is httpOnly, so only the server can read it.
 * In development, "credentials login" stores it in `credentials_token` instead.
 */
const getAccessToken = (req: NextApiRequest): string | undefined =>
    req.cookies.access_token ||
    (process.env.NODE_ENV === 'development' ? req.cookies.credentials_token : undefined);

const USE_MOCK = process.env.GEN3_MOCK_INFERENCE_SERVICE || false;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {

    const started = Date.now();
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { tsv, sample_id } = req.body;
    if (!tsv || !sample_id) {
        debugLog('api/inference', 'rejected: missing tsv or sample_id', {
            hasTsv: Boolean(tsv),
            hasSampleId: Boolean(sample_id),
        });
        return res.status(400).json({ message: 'Missing required fields' });
    }
    debugLog('api/inference', 'payload ok', { sample_id, tsvChars: String(tsv).length });


    // mock the API server when in development mode:
    if (USE_MOCK) {
        try {
            // given the sample_id load the corresponding tsv file
            const jsonFilePath = `${MOCKED_DATA_DIR}/${sample_id}`.replace(".tsv", ".json");
            debugLog('api/inference', 'mock: reading file', { jsonFilePath, cwd: process.cwd() });
            const jsonContent = await readFile(jsonFilePath, 'utf8');
            return res.status(200).json(JSON.parse(jsonContent));
        } catch (e: unknown) {
            debugError('api/inference', 'mock failed', e, { sample_id });
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    else {
        // fetch from the inference service
        const inferenceApi =  `${GEN3_INFERENCE_SERVICE}/rna-seq-transformer/v1/models/bulkrnabert:predict`;
        if (!inferenceApi) {
            debugLog('api/inference', 'no inference service URL configured');
            return res.status(500).json({ message: 'Inference service is not configured' });
        }
        const accessToken = getAccessToken(req);
        if (!accessToken) {
            debugLog('api/inference', 'rejected: no access token cookie', { sample_id });
            return res.status(401).json({ message: 'Not logged in' });
        }
        try {
            // the token itself is never logged
            debugLog('api/inference', 'calling inference service', { url: inferenceApi, sample_id, hasAccessToken: true });
            const response = await fetch(inferenceApi, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ tsv, sample_id }),
            });

         //   const response = await postWithRetry(inferenceApi, JSON.stringify({ tsv, sample_id }));
            if (!response) throw new Error('No response from inference service');
            debugLog('api/inference', 'inference service responded', {
                sample_id,
                status: response.status,
                statusText: response.statusText,
                contentType: response.headers.get('content-type'),
                ms: Date.now() - started,
            });
            if (!response.ok) {
                debugLog('api/inference', 'inference service error body', {
                    sample_id,
                    body: (await response.text()).slice(0, 1000),
                });
                return res.status(502).json({ message: `Inference service returned ${response.status}` });
            }
            const body = await response.json();
            debugLog('api/inference', 'returning result', {
                sample_id,
                keys: Object.keys(body ?? {}),
                ms: Date.now() - started,
            });
            debugLog('api/inference', `response for ${sample_id}:\n${previewJson(body)}`);
            return res.status(200).json(body);
        } catch (e: unknown) {
            debugError('api/inference', 'inference request failed', e, {
                sample_id,
                url: inferenceApi,
                ms: Date.now() - started,
            });
            return res.status(502).json({ message: 'Inference service unreachable' });
        }
    }
}
