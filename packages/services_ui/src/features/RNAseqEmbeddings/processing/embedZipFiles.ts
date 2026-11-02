import JSZip from 'jszip';
import type { HttpMethod } from '@gen3/core';
// import {fetchJSONDataFromURL } from '@gen3/core';
import { EMBEDDING_MAX_WORKERS } from '../../../core/constants';
import { isOsMetadata } from '../isOsMetadata';
import { debugError, debugLog, previewJson } from '../../../utils/debugLog';
import { EMBEDDING_MODEL_PROXY_ENDPOINT } from '../../../core/constants';
import { fetchJSONDataFromURL} from "../../../utils/fetch";

export interface EmbeddingResult {
    fileName: string;
    result: Record<string, any>;
}

interface EmbedContext {
    signal: AbortSignal;
    onProgress: (percent: number, label: string) => void;
}

const embed = async (tsv: string, fileName: string, signal: AbortSignal): Promise<Record<string, any>> => {
   const url = EMBEDDING_MODEL_PROXY_ENDPOINT;
   const resp = await fetchJSONDataFromURL<Record<string, any>>(url, true, 'POST' as HttpMethod, JSON.stringify({ tsv: tsv, sample_id: fileName }), signal);
    if (!resp)
        throw new Error(`null response`);
    return resp;
};

/**
 * Reads every file out of the zip and sends it to the embedding service,
 * up to EMBEDDING_MAX_WORKERS requests at a time. Results are returned in archive order.
 */
export const embedZipFiles = async (
    zipFile: File,
    { signal: outerSignal, onProgress }: EmbedContext,
): Promise<EmbeddingResult[]> => {
    // aborted when the caller cancels or when any worker fails, so in-flight requests stop straight away
    const controller = new AbortController();
    const { signal } = controller;
    const forwardAbort = () => controller.abort(outerSignal.reason);
    if (outerSignal.aborted) forwardAbort();
    else outerSignal.addEventListener('abort', forwardAbort, { once: true });

    try {
        onProgress(2, 'Reading archive');
        debugLog('embedZipFiles', 'reading archive', { name: zipFile.name, bytes: zipFile.size, endpoint: EMBEDDING_MODEL_PROXY_ENDPOINT });
        const zip = await JSZip.loadAsync(zipFile);
        signal.throwIfAborted();

        const entries = Object.values(zip.files).filter((f) => !f.dir && !isOsMetadata(f.name));
        debugLog('embedZipFiles', 'archive read', { entries: entries.length, maxWorkers: EMBEDDING_MAX_WORKERS });
        if (entries.length === 0) throw new Error('The archive contains no files.');

        const results: EmbeddingResult[] = [];
        let next = 0;
        let completed = 0;

        const worker = async () => {
            while (next < entries.length) {
                signal.throwIfAborted();
                const index = next++;
                const entry = entries[index];
                const fileName = entry.name;
                const tsv = await entry.async('string');
                const fileStarted = Date.now();
                debugLog('embedZipFiles', 'embedding file', { index, fileName, tsvChars: tsv.length });
                let result: Record<string, any>;
                try {
                    result = await embed(tsv, fileName, signal);
                } catch (error) {
                    debugError('embedZipFiles', 'embedding failed', error, {
                        index,
                        fileName,
                        ms: Date.now() - fileStarted,
                        // fetchJSONDataFromURL parses the body of an error response as JSON, so a plain-text
                        // error (e.g. "failed csrf check") surfaces as a SyntaxError instead of an HTTP status
                        ...(error instanceof SyntaxError ? { hint: 'response was not JSON; likely a plain-text HTTP error' } : {}),
                    });
                    throw error;
                }
                debugLog('embedZipFiles', 'file embedded', { index, fileName, keys: Object.keys(result ?? {}), ms: Date.now() - fileStarted });
                debugLog('embedZipFiles', `response for ${fileName}:\n${previewJson(result)}`);
                results[index] = { fileName, result };
                completed += 1;
                onProgress(5 + Math.floor((completed / entries.length) * 90), `Embedding (${completed} of ${entries.length})`);
            }
        };

        // the first failure rejects the whole run (with its own error) and the finally block aborts the rest
        await Promise.all(Array.from({ length: Math.min(EMBEDDING_MAX_WORKERS, entries.length) }, worker));
        return results;
    } finally {
        controller.abort();
        outerSignal.removeEventListener('abort', forwardAbort);
    }
};
