import type { EmbeddingResponse } from './umapEmbeddings';

export const TOP_K = 10;
export const TARGET_PROJECT = 'TCGA-DLBC';

export interface Neighbor {
    metadata: Record<string, any>;
    /** cosine similarity, 1 is identical */
    similarity: number;
}

export interface NeighborRow {
    /** metadata of the input sample */
    input: Record<string, any>;
    /** closest TCGA case */
    nearest: Neighbor;
    /** how many of the TOP_K nearest TCGA cases belong to TARGET_PROJECT */
    nTargetProject: number;
}

/** Builds the summary row for one input sample from its hits, sorted most to least similar. */
export const toNeighborRow = (
    input: Record<string, any>,
    hits: ({ similarity: number } & Record<string, any>)[],
): NeighborRow => {
    const neighbors: Neighbor[] = hits.map(({ similarity, ...metadata }) => ({ metadata, similarity }));
    return {
        input,
        nearest: neighbors[0],
        nTargetProject: neighbors.filter((n) => n.metadata.project_id === TARGET_PROJECT).length,
    };
};

const normalize = (vector: number[]): Float32Array => {
    const out = Float32Array.from(vector);
    let norm = 0;
    for (const v of out) norm += v * v;
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < out.length; i++) out[i] /= norm;
    return out;
};

/**
 * For every input sample, finds its TOP_K most similar TCGA cases by cosine similarity,
 * and reports the nearest one plus how many of the TOP_K are in TARGET_PROJECT.
 */
export const findNearestNeighbors = (
    tcga: EmbeddingResponse,
    input: EmbeddingResponse,
    k: number = TOP_K,
): NeighborRow[] => {
    const tcgaVectors = tcga.embeddings.map((e) => normalize(e.vector));

    return input.embeddings.map((sample) => {
        const query = normalize(sample.vector);

        // top-k kept sorted by descending similarity; k is small so insertion is cheap
        const top: { index: number; similarity: number }[] = [];
        for (let i = 0; i < tcgaVectors.length; i++) {
            const vector = tcgaVectors[i];
            let similarity = 0;
            for (let d = 0; d < query.length; d++) similarity += query[d] * vector[d];

            if (top.length === k && similarity <= top[k - 1].similarity) continue;
            let pos = top.length;
            while (pos > 0 && top[pos - 1].similarity < similarity) pos--;
            top.splice(pos, 0, { index: i, similarity });
            if (top.length > k) top.pop();
        }

        return toNeighborRow(
            sample.info.metadata,
            top.map(({ index, similarity }) => ({ similarity, ...tcga.embeddings[index].info.metadata })),
        );
    });
};
