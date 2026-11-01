import type { ComponentType } from "react";
import type { ToolCall } from "../../core";

export interface ToolRendererProps {
  toolCall: ToolCall;
  /** null until TOOL_CALL_RESULT lands */
  result: string | null;
}

export type ToolRenderer = ComponentType<ToolRendererProps>;

/** memo's check for a result card: redraw only when its result or call changes. */
export const sameToolResult = (a: ToolRendererProps, b: ToolRendererProps) =>
  a.result === b.result && a.toolCall.id === b.toolCall.id;
