import type { EmbeddingResult } from './embedZipFiles';
import { embedZipFiles } from './embedZipFiles';
import type { EmbeddingResponse, UmapComparison } from './umapEmbeddings';
import { runUmap } from './umapEmbeddings';
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
