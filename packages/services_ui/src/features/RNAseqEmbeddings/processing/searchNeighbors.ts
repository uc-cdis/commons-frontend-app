import type { HttpMethod } from '@gen3/core';
import { fetchJSONDataFromURL } from '@gen3/core';
import { EMBEDDING_MAX_WORKERS, GEN3_EMBEDDINGS_SERVICE } from '../../../core/constants';
import { mapConcurrent } from './mapConcurrent';
import { TOP_K } from './nearestNeighbors';
import { debugError, debugLog, previewJson } from '../../../utils/debugLog';

const COLLECTION = 'expr';
const SEARCH_ENDPOINT = `${GEN3_EMBEDDINGS_SERVICE}/${COLLECTION}/search`;

/** One vector store hit: its similarity plus the stored metadata of the matching TCGA case. */
export type SearchHit = { similarity: number } & Record<string, any>;

interface SearchResponse {
    embeddings: { value: number; embedding: { info: { metadata: Record<string, any> } } }[];
}

/**
 * Finds the `topK` most similar stored embeddings to one query vector.
 * Hits are sorted from most to least similar. Rejects on a non-2xx response.
 */
export const searchEmbeddings = async (
    queryVector: ArrayLike<number>,
    signal?: AbortSignal,
    topK: number = TOP_K,
): Promise<SearchHit[]> => {
    const started = Date.now();
    try {
        const resp = await fetchJSONDataFromURL<SearchResponse>(
            SEARCH_ENDPOINT,
            true,
            'POST' as HttpMethod,
            JSON.stringify({ input: Array.from(queryVector), top_k: topK, distance_metric: 'cosine_similarity' }),
            signal,
        );
        if (!resp) throw new Error('null response from the embedding search');
        debugLog('searchEmbeddings', 'search done', {
            url: SEARCH_ENDPOINT,
            dims: queryVector.length,
            hits: resp.embeddings?.length,
            topSimilarity: resp.embeddings?.[0]?.value,
            ms: Date.now() - started,
        });
        debugLog('searchEmbeddings', `response:\n${previewJson(resp)}`);
        return resp.embeddings.map((hit) => ({ similarity: hit.value, ...hit.embedding.info.metadata }));
    } catch (error) {
        // HTTPError from @gen3/core carries the status and the response body
        debugError('searchEmbeddings', 'search failed', error, {
            url: SEARCH_ENDPOINT,
            dims: queryVector.length,
            status: (error as { status?: unknown }).status,
            responseBody: (error as { body?: unknown }).body,
            ms: Date.now() - started,
        });
        throw error;
    }
};

/**
 * Searches for the neighbors of every query vector, up to EMBEDDING_MAX_WORKERS requests at a time.
 * Returns one hit list per vector, in the same order as `vectors`.
 */
export const searchAllEmbeddings = (
    vectors: readonly ArrayLike<number>[],
    {
        signal,
        onProgress,
        topK = TOP_K,
    }: {
        signal?: AbortSignal;
        /** 0 - 100 */
        onProgress?: (percent: number) => void;
        topK?: number;
    } = {},
): Promise<SearchHit[][]> =>
    mapConcurrent(vectors, (vector, _index, taskSignal) => searchEmbeddings(vector, taskSignal, topK), {
        maxWorkers: EMBEDDING_MAX_WORKERS,
        signal,
        onProgress: (completed, total) => onProgress?.(Math.floor((completed / total) * 100)),
    });
