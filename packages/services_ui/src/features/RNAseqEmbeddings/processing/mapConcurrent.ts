/**
 * Runs `task` over every item, at most `maxWorkers` at a time, and returns the results in input order
 * (the equivalent of tqdm's thread_map). The first failure rejects the run and aborts the signal
 * passed to the tasks still in flight; so does aborting the outer `signal`.
 */
export const mapConcurrent = async <T, R>(
    items: readonly T[],
    task: (item: T, index: number, signal: AbortSignal) => Promise<R>,
    {
        maxWorkers,
        signal: outerSignal,
        onProgress,
    }: {
        maxWorkers: number;
        signal?: AbortSignal;
        /** called after each item completes, with the number done so far */
        onProgress?: (completed: number, total: number) => void;
    },
): Promise<R[]> => {
    const controller = new AbortController();
    const { signal } = controller;
    const forwardAbort = () => controller.abort(outerSignal?.reason);
    if (outerSignal?.aborted) forwardAbort();
    else outerSignal?.addEventListener('abort', forwardAbort, { once: true });

    try {
        // oxlint-disable-next-line unicorn/no-new-array
        const results = new Array<R>(items.length);
        let next = 0;
        let completed = 0;

        const worker = async () => {
            while (next < items.length) {
                signal.throwIfAborted();
                const index = next++;
                results[index] = await task(items[index], index, signal);
                completed += 1;
                onProgress?.(completed, items.length);
            }
        };

        await Promise.all(Array.from({ length: Math.min(maxWorkers, items.length) }, worker));
        return results;
    } finally {
        controller.abort();
        outerSignal?.removeEventListener('abort', forwardAbort);
    }
};
