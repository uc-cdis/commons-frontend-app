import { useCallback, useEffect, useRef, useState } from "react";
import type { Timings } from "./types";
import type { AbstractAgent } from "@copilotkit/react-core/v2";

export interface UseChatTimings {
  timings: Timings;
  startTurn: (turnId: string) => void; // call in sendMessage, before the run
  reset: () => void; // call in clearMessages
}

// timestamp is optional on BaseEvent. Mixing server and client clocks skews a
// duration, but it beats NaN.
const tsOf = (e: { timestamp?: number }) => e.timestamp ?? Date.now();

export function useChatTimings(agent: AbstractAgent): UseChatTimings {
  const [timings, setTimings] = useState<Timings>({
    turns: {},
    tools: {},
    reasoning: {},
  });

  const pendingTurnIdRef = useRef<string | null>(null); // message the next run is for
  const activeTurnRef = useRef<{ id: string; runId?: string; startTs: number } | null>(null); // the run being timed right now

  // Per reasoning block: start time, plus the time of its last token.
  const reasoningRef = useRef<Map<string, { start: number; lastContent: number }>>(new Map());
  const toolEndRef = useRef<Map<string, number>>(new Map()); // tool END time, held until its RESULT

  useEffect(() => {
    const sub = agent.subscribe({
      onRunStartedEvent({ event }) {
        const ts = tsOf(event);
        const id = pendingTurnIdRef.current;
        if (!id) return;
        // Clock starts from the server's timestamp, not ours.
        activeTurnRef.current = { id, runId: event.runId, startTs: ts };
        pendingTurnIdRef.current = null;
      },

      onRunFinishedEvent({ event, outcome }) {
        const ts = tsOf(event);
        const active = activeTurnRef.current;
        const turnMatches =
          active != null && (active.runId == null || active.runId === event.runId);

        // Close out any reasoning block that never got its END.
        const reasoningPatch: Record<string, number> = {};
        for (const [id, rec] of reasoningRef.current) {
          reasoningPatch[id] = rec.lastContent - rec.start;
        }
        reasoningRef.current.clear();

        if (turnMatches) activeTurnRef.current = null;
        // a stop can end as "cancelled": that turn didn't complete
        const completed = turnMatches && outcome === "success";

        if (completed || Object.keys(reasoningPatch).length) {
          setTimings((t) => ({
            turns: completed
              ? { ...t.turns, [active!.id]: ts - active!.startTs } // finish - start
              : t.turns,
            tools: t.tools,
            reasoning: { ...t.reasoning, ...reasoningPatch },
          }));
        }
      },

      onRunErrorEvent() {
        const patch: Record<string, number> = {};
        for (const [id, rec] of reasoningRef.current) {
          patch[id] = rec.lastContent - rec.start;
        }
        reasoningRef.current.clear();
        toolEndRef.current.clear();
        activeTurnRef.current = null;
        pendingTurnIdRef.current = null;

        if (Object.keys(patch).length) {
          setTimings((t) => ({ ...t, reasoning: { ...t.reasoning, ...patch } }));
        }
      },

      onReasoningStartEvent({ event }) {
        if (!event.messageId) return;
        const ts = tsOf(event);
        reasoningRef.current.set(event.messageId, { start: ts, lastContent: ts });
      },

      onReasoningMessageContentEvent({ event }) {
        // Ref, not state - this fires per token and must not re-render.
        const rec = event.messageId ? reasoningRef.current.get(event.messageId) : undefined;
        if (rec) rec.lastContent = tsOf(event);
      },

      onReasoningEndEvent({ event }) {
        const id = event.messageId;
        if (!id) return;
        const rec = reasoningRef.current.get(id);
        if (!rec) return;
        reasoningRef.current.delete(id);
        // Measure to the last token, not to END - END can lag by a lot.
        setTimings((t) => ({
          ...t,
          reasoning: { ...t.reasoning, [id]: rec.lastContent - rec.start },
        }));
      },

      onToolCallEndEvent({ event }) {
        if (event.toolCallId) toolEndRef.current.set(event.toolCallId, tsOf(event));
      },

      onToolCallResultEvent({ event }) {
        const id = event.toolCallId;
        if (!id) return;
        const endTs = toolEndRef.current.get(id);
        if (endTs === undefined) return;
        toolEndRef.current.delete(id);
        setTimings((t) => ({
          ...t,
          tools: { ...t.tools, [id]: tsOf(event) - endTs }, // result - end
        }));
      },
    });

    return () => sub.unsubscribe();
  }, [agent]);

  // Only records the id - the clock starts at RUN_STARTED.
  const startTurn = useCallback((turnId: string) => {
    pendingTurnIdRef.current = turnId;
  }, []);

  const reset = useCallback(() => {
    pendingTurnIdRef.current = null;
    activeTurnRef.current = null;
    reasoningRef.current.clear();
    toolEndRef.current.clear();
    setTimings({ turns: {}, tools: {}, reasoning: {} });
  }, []);

  return { timings, startTurn, reset };
}
