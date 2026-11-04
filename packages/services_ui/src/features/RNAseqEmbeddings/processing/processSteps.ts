import type { EmbeddingResult } from './embedZipFiles';
import { embedZipFiles } from './embedZipFiles';
import type { EmbeddingResponse, UmapComparison } from './umapEmbeddings';
import { runUmap, runUmapGround } from './umapEmbeddings';
import type { GroundEmbeddings } from './extractAllEmbeddings';
import type { NeighborRow } from './nearestNeighbors';
import { findNearestNeighbors, toNeighborRow } from './nearestNeighbors';
import { searchAllEmbeddings } from './searchNeighbors';
// only for mocking
import tcga from '../data/full_tcga_embeddings.json';
import input from '../data/full_input_embeddings.json';

// number of epochs reported by runUmap's progress callback
const UMAP_PROGRESS_STEPS = 500;

/** Embeds every file in the zip. `onProgress` receives 0 - 100. */
export const runEmbeddingsStep = (
    zipFile: File,
    onProgress: (percent: number) => void,
    signal: AbortSignal = new AbortController().signal,
): Promise<EmbeddingResult[]> =>
    embedZipFiles(zipFile, { signal, onProgress: (percent) => onProgress(percent) });

/** Projects the TCGA and input embeddings into 2D. `onProgress` receives 0 - 100. */
export const runUmapStep = (onProgress: (percent: number) => void): Promise<UmapComparison> =>
    runUmap(tcga as unknown as EmbeddingResponse, input, (epoch) =>
        onProgress(Math.trunc((epoch / UMAP_PROGRESS_STEPS) * 100)),
    );

/** Projects the downloaded TCGA (`ground`) and the input embeddings into 2D. `onProgress` receives 0 - 100. */
export const runUmapGroundStep = (
    ground: GroundEmbeddings,
    input: GroundEmbeddings,
    onProgress: (percent: number) => void,
): Promise<UmapComparison> =>
    runUmapGround(ground, input, (epoch) => onProgress(Math.trunc((epoch / UMAP_PROGRESS_STEPS) * 100)));

/** Nearest TCGA neighbors of every input sample. */
export const runNeighborsStep = (): NeighborRow[] =>
    findNearestNeighbors(tcga as unknown as EmbeddingResponse, input as unknown as EmbeddingResponse);

/**
 * Nearest TCGA neighbors of every input sample, found by searching the vector store.
 * `vectors[i]` is the embedding of the sample whose metadata is `inputMetadata[i]`. `onProgress` receives 0 - 100.
 */
export const runSearchNeighborsStep = async (
    vectors: readonly ArrayLike<number>[],
    inputMetadata: readonly Record<string, any>[],
    onProgress: (percent: number) => void,
    signal?: AbortSignal,
): Promise<NeighborRow[]> => {
    const hits = await searchAllEmbeddings(vectors, { signal, onProgress });
    return hits.map((sampleHits, i) => toNeighborRow(inputMetadata[i], sampleHits));
};
