import type { HttpMethod } from '@gen3/core';
import { fetchJSONDataFromURL } from '@gen3/core';
import { EMBEDDING_MAX_WORKERS, GEN3_EMBEDDINGS_SERVICE } from '../../../core/constants';
import { mapConcurrent } from './mapConcurrent';
import { debugLog } from '../../../utils/debugLog';

const COLLECTION = 'expr';
const PAGE_SIZE = 100;

/** Every stored TCGA embedding: `vectors[i]` belongs to the case described by `metadata[i]`. */
export interface GroundEmbeddings {
    vectors: Float32Array[];
    metadata: Record<string, any>[];
}

interface StoredEmbedding {
    vector: number[];
    info: { metadata: Record<string, any> };
}

const get = async <T>(path: string, params: Record<string, string | number | boolean>, signal?: AbortSignal): Promise<T> => {
    const query = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]));
    const url = `${GEN3_EMBEDDINGS_SERVICE}/${COLLECTION}${path}?${query}`;
    const resp = await fetchJSONDataFromURL<T>(url, true, 'GET' as HttpMethod, undefined, signal);
    if (!resp) throw new Error(`null response from ${url}`);
    return resp;
};

/**
 * Downloads every stored TCGA embedding, a page at a time, up to EMBEDDING_MAX_WORKERS pages at once.
 * `onProgress` receives 0 - 100.
 */
export const extractAllEmbeddings = async (
    onProgress: (percent: number) => void,
    signal?: AbortSignal,
): Promise<GroundEmbeddings> => {
    const { available_embeddings_count: total } = await get<{ available_embeddings_count: number }>(
        '',
        { counts: true },
        signal,
    );
    const pageCount = Math.ceil(total / PAGE_SIZE);
    debugLog('extractAllEmbeddings', 'downloading', { total, pageCount });

    const pages = await mapConcurrent(
        Array.from({ length: pageCount }, (_, i) => i + 1),
        async (page, _index, taskSignal) =>
            (await get<{ embeddings: StoredEmbedding[] }>('/embeddings', { page, page_size: PAGE_SIZE }, taskSignal))
                .embeddings,
        {
            maxWorkers: EMBEDDING_MAX_WORKERS,
            signal,
            onProgress: (completed, count) => onProgress(Math.floor((completed / count) * 100)),
        },
    );

    const all = pages.flat();
    return {
        vectors: all.map((x) => Float32Array.from(x.vector)),
        metadata: all.map((x) => x.info.metadata),
    };
};
