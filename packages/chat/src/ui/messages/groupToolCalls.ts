import type { ToolCall } from "../../core";

export interface ToolCallRun {
  name: string;
  calls: ToolCall[];
}

// neighbouring calls to one tool in a step (the agent's parallel calls) share a row; a tool with
// a card stays alone, so its card isn't folded away
export function groupToolCalls(
  toolCalls: ToolCall[],
  hasCard: (name: string) => boolean,
): ToolCallRun[] {
  const groups: ToolCallRun[] = [];
  for (const call of toolCalls) {
    const last = groups.at(-1);
    if (last?.name === call.name && !hasCard(call.name)) last.calls.push(call);
    else groups.push({ name: call.name, calls: [call] });
  }
  return groups;
}
