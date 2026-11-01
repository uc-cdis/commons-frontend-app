export type ToolStatus = "completed" | "error" | "running" | "missing";

export const STATUS_LABELS: Record<ToolStatus, string> = {
  completed: "Completed",
  error: "Error",
  running: "Running",
  missing: "No result",
};

export const callStatus = (
  result: string | null,
  failed: boolean,
  isRunning: boolean,
): ToolStatus => (failed ? "error" : result ? "completed" : isRunning ? "running" : "missing");

/** A group shows its worst call: Running, then its errors, then No result. */
export function groupStatus(statuses: ToolStatus[]): { status: ToolStatus; label?: string } {
  if (statuses.includes("running")) return { status: "running" };
  const errors = statuses.filter((status) => status === "error").length;
  if (errors > 0)
    return { status: "error", label: `${errors} ${errors === 1 ? "error" : "errors"}` };
  if (statuses.includes("missing")) return { status: "missing" };
  return { status: "completed" };
}
