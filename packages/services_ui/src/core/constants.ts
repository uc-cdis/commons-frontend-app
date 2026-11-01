import { GEN3_API } from '@gen3/core';

// Base URL of the inference service, reached through the Gen3 gateway (the in-cluster service name is not reachable from a browser).
export const GEN3_INFERENCE_SERVICE =
  process.env.NEXT_PUBLIC_GEN3_INFERENCE_SERVICE || `${GEN3_API}/inference`;

export const EMBEDDING_MODEL_ENDPOINT = `${GEN3_INFERENCE_SERVICE}/rna-seq-transformer/v1/models/bulkrnabert:predict`;
export const EMBEDDING_MAX_WORKERS = 8;

export const GEN3_EMBEDDINGS_SERVICE = `${`https://genomicaicommons.org`}/ai/vectorstore/collections`;

// JSZip reads the whole archive into memory, so larger zips risk exhausting the tab
export const MAX_ZIP_BYTES = 1024 ** 3;
