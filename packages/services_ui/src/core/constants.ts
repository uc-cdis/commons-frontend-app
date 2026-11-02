import { GEN3_API } from '@gen3/core';

// The browser calls the app's own /api/inference route, which proxies to the inference service (see api/inference.ts).
export const EMBEDDING_MODEL_PROXY_ENDPOINT = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/inference`; // url to use from the client to proxy calls to the inference service
export const EMBEDDING_MAX_WORKERS = 8;

export const GEN3_EMBEDDINGS_SERVICE = `${GEN3_API}/ai/vectorstore/collections`;

// JSZip reads the whole archive into memory, so larger zips risk exhausting the tab
export const MAX_ZIP_BYTES = 1024 ** 3;
