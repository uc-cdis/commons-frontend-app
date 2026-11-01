import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseSurvivalResult, projectLabel } from "./parse";

// a real /download/survival/<handle> body (TCGA-CHOL, 48 donors), captured from the live agent
const realCurve = readFileSync(
  new URL("../__fixtures__/survival-curve.json", import.meta.url),
  "utf8",
);

describe("parseSurvivalResult", () => {
  it("reads the real curve: 48 donors, starting from 100% at time zero, time in years", () => {
    const parsed = parseSurvivalResult(realCurve);
    if (!parsed.ok) throw new Error(parsed.reason);
    const [curve] = parsed.data.curves;
    expect(parsed.data.curves).toHaveLength(1);
    expect(curve.n).toBe(48);
    expect(curve.points[0]).toEqual({ time: 0, timeDays: 0, estimate: 1, censored: false });
    // the first donor in the capture: 10 days, censored, TCGA-W5-AA31
    expect(curve.points[1]).toEqual({
      time: 10 / 365.25,
      timeDays: 10,
      estimate: 1,
      censored: true,
      submitterId: "TCGA-W5-AA31",
      projectId: "TCGA-CHOL",
    });
  });
});

describe("projectLabel", () => {
  it("names the project when every donor is from one", () => {
    const parsed = parseSurvivalResult(realCurve);
    if (!parsed.ok) throw new Error(parsed.reason);
    expect(projectLabel(parsed.data.curves)).toBe("TCGA-CHOL");
  });

  const curveOf = (...projects: (string | undefined)[]) => {
    const donors = projects.map((project_id, i) => ({
      time: i + 1,
      censored: false,
      survivalEstimate: 0.5,
      ...(project_id ? { project_id } : {}),
    }));
    const parsed = parseSurvivalResult(JSON.stringify({ results: [{ donors }] }));
    if (!parsed.ok) throw new Error(parsed.reason);
    return parsed.data.curves;
  };

  it("counts the projects when the donors come from several", () => {
    expect(projectLabel(curveOf("TCGA-LUAD", "TCGA-LUSC", "TCGA-LUAD", "CPTAC-3"))).toBe(
      "3 projects",
    );
  });

  it("has no label when the donors carry no project", () => {
    expect(projectLabel(curveOf(undefined, undefined))).toBeNull();
  });
});
