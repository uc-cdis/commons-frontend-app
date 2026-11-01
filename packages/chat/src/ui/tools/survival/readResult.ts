import { isRecord, parseJson } from "../json";

export interface SurvivalEstimate {
  years: number;
  /** a fraction, 0.826 for 82.6% */
  value: number;
}

export interface SurvivalSummary {
  donors: number;
  estimates: SurvivalEstimate[];
}

// "1_year_survival" … : the agent picks the years (gdc_mcp/tools/analysis.py), so don't fix them here
const YEAR_KEY = /^(\d+)_year_survival$/;

/** The numbers in a get_survival_data result: its first cohort's donors and yearly estimates. */
export function readSurvivalSummary(result: string): SurvivalSummary | null {
  // a tool result is untrusted text, so assume nothing about its shape
  const parsed = parseJson(result);
  if (!isRecord(parsed) || !Array.isArray(parsed.overall_survival)) return null;
  const first: unknown = parsed.overall_survival[0];
  if (!isRecord(first) || typeof first.donors !== "number") return null;

  const estimates: SurvivalEstimate[] = [];
  for (const [key, value] of Object.entries(first)) {
    const years = key.match(YEAR_KEY)?.[1];
    if (years && typeof value === "number") estimates.push({ years: Number(years), value });
  }
  estimates.sort((a, b) => a.years - b.years);
  return { donors: first.donors, estimates };
}
