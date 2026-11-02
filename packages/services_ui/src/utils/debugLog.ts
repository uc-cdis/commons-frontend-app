// TEMPORARY debugging aid for testing the deployed RNA-seq flow.
// To remove it: delete this file and every `debugLog` / `debugError` call (grep for them).
// Never pass tsv contents, embedding vectors or tokens in `details`; log sizes instead.

const PREFIX = '[rnaseq-debug]';

/** name, message and the underlying network error code (e.g. ECONNRESET, ENOTFOUND) of a thrown value. */
export const describeError = (error: unknown): Record<string, unknown> => {
    if (!(error instanceof Error)) return { error: String(error) };
    const cause = (error as { cause?: { code?: unknown; message?: unknown } }).cause;
    return {
        name: error.name,
        message: error.message,
        ...(cause ? { causeCode: cause.code, causeMessage: cause.message } : {}),
    };
};

export const debugLog = (scope: string, message: string, details?: Record<string, unknown>) =>
    console.log(`${PREFIX} ${new Date().toISOString()} ${scope}: ${message}`, ...(details ? [details] : []));

export const debugError = (scope: string, message: string, error: unknown, details?: Record<string, unknown>) =>
    console.error(`${PREFIX} ${new Date().toISOString()} ${scope}: ${message}`, {
        ...details,
        ...describeError(error),
    });
