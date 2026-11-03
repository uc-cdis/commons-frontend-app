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

const MAX_PREVIEW_LINES = 25;
const MAX_INLINE_ARRAY = 8;

/**
 * Pretty-printed JSON limited to the first 25 lines. Long arrays (embedding vectors) are collapsed to a
 * one-line preview first, so they don't use up the whole budget.
 */
export const previewJson = (value: unknown, maxLines: number = MAX_PREVIEW_LINES): string => {
    const text =
        JSON.stringify(
            value,
            (_key, v) =>
                Array.isArray(v) && v.length > MAX_INLINE_ARRAY
                    ? `[${v.length} items: ${v.slice(0, 3).map((x) => JSON.stringify(x)).join(', ')}, ...]`
                    : v,
            2,
        ) ?? String(value);
    const lines = text.split('\n');
    return lines.length <= maxLines
        ? text
        : [...lines.slice(0, maxLines), `... (${lines.length - maxLines} more lines)`].join('\n');
};

// oxlint-disable-next-line no-unused-vars
export const debugLog = (scope: string, message: string, details?: Record<string, unknown>) => null;
   // console.log(`${PREFIX} ${new Date().toISOString()} ${scope}: ${message}`, ...(details ? [details] : []));

// oxlint-disable-next-line no-unused-vars
export const debugError = (scope: string, message: string, error: unknown, details?: Record<string, unknown>) => null;
    // console.error(`${PREFIX} ${new Date().toISOString()} ${scope}: ${message}`, {
    //     ...details,
    //     ...describeError(error),
    // });
