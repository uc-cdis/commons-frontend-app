const isPlain = (value: unknown): value is string | number | boolean =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean";

// lists and objects (a filter's clauses) are left to the panel's ARGUMENTS
export const argsSummary = (args: Record<string, unknown> | null): string =>
  Object.entries(args ?? {})
    .filter(([, value]) => isPlain(value))
    .map(([key, value]) => `${key}: ${value}`)
    .join(" · ");
