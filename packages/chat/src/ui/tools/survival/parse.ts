import { isRecord, parseJson } from "../json";

const DAYS_IN_YEAR = 365.25;

export interface SurvivalPoint {
  time: number;
  timeDays: number;
  estimate: number;
  censored: boolean;
  submitterId?: string;
  projectId?: string;
}

export interface SurvivalCurve {
  key: string;
  n: number;
  points: SurvivalPoint[];
  maxTime: number;
}

export interface SurvivalData {
  curves: SurvivalCurve[];
  pValue?: number;
}

export type ParseResult = { ok: true; data: SurvivalData } | { ok: false; reason: string };

const isFiniteNumber = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

// One curve from the API result. Drops any donor missing time, survivalEstimate,
// or censored.
function toCurve(raw: unknown, index: number): SurvivalCurve | null {
  if (!isRecord(raw) || !Array.isArray(raw.donors)) return null;

  const rows: SurvivalPoint[] = [];

  for (const d of raw.donors) {
    if (!isRecord(d)) continue;
    if (!isFiniteNumber(d.time) || !isFiniteNumber(d.survivalEstimate)) continue;
    if (typeof d.censored !== "boolean") continue;

    const point: SurvivalPoint = {
      time: d.time / DAYS_IN_YEAR,
      timeDays: d.time,
      estimate: d.survivalEstimate,
      censored: d.censored,
    };
    if (typeof d.submitter_id === "string") point.submitterId = d.submitter_id;
    if (typeof d.project_id === "string") {
      point.projectId = d.project_id;
    }
    rows.push(point);
  }

  if (rows.length === 0) return null;

  // rows.sort((a, b) => a.time - b.time);

  return {
    key: `curve-${index}`,
    n: Array.isArray(raw.donors) ? raw.donors.length : rows.length,
    points: [{ time: 0, timeDays: 0, estimate: 1, censored: false }, ...rows],
    maxTime: rows[rows.length - 1].time,
  };
}

/** The card's title: which project the donors come from. */
export function projectLabel(curves: SurvivalCurve[]): string | null {
  const projects = new Set(
    curves.flatMap((c) => c.points.map((p) => p.projectId)).filter((id) => id !== undefined),
  );
  if (projects.size > 1) return `${projects.size} projects`;
  return [...projects][0] ?? null;
}

// The result arrives as an untrusted string from a tool call, so assume nothing.
export function parseSurvivalResult(content: string): ParseResult {
  const raw = parseJson(content);
  if (raw === undefined) return { ok: false, reason: "result was not valid JSON" };

  if (!isRecord(raw)) return { ok: false, reason: "unexpected result shape" };
  if (!Array.isArray(raw.results)) return { ok: false, reason: "missing results array" };

  const curves = raw.results.map(toCurve).filter((c): c is SurvivalCurve => c !== null);

  const stats = isRecord(raw.overallStats) ? raw.overallStats : undefined;
  const pValue = stats && isFiniteNumber(stats.pValue) ? stats.pValue : undefined;

  return { ok: true, data: { curves, pValue } };
}
