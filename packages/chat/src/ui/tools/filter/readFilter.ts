import { isRecord, parseJson } from "../json";

export interface FilterSummary {
  scope: string;
  conditions: number;
}

export function readFilter(result: string): FilterSummary | null {
  const parsed = parseJson(result);
  if (!isRecord(parsed) || !Array.isArray(parsed.clauses)) return null;
  return {
    scope: typeof parsed.scope === "string" ? parsed.scope : "",
    conditions: parsed.clauses.length,
  };
}
