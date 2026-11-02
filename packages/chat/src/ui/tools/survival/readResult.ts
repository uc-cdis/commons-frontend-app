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

const isStringList = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((s) => typeof s === "string");

export interface CohortLabel {
  /** for the title, `TCGA-LUAD · female` */
  short: string;
  /** the whole cohort, only when `short` cut something */
  full?: string;
}

/**
 * The curve's cohort: `cohort_short`, or `cohort` when the two don't line up (as `_headings` in
 * gdc-mcp-demo agent/answer.py does). Null when the agent sent none.
 */
export function readCohortLabel(result: string): CohortLabel | null {
  const parsed = parseJson(result);
  if (!isRecord(parsed)) return null;
  const { cohort, cohort_short: cohortShort } = parsed;
  if (!isStringList(cohort) || cohort.length === 0) return null;
  const full = cohort.join(" · ");
  const linedUp = isStringList(cohortShort) && cohortShort.length === cohort.length;
  const short = linedUp ? cohortShort.join(" · ") : full;
  return short === full ? { short } : { short, full };
}
