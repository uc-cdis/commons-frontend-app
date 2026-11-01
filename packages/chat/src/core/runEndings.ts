// How each way a run can end is handled. Plain functions, so they can be tested without React.
import type { AgentSubscriber, Message } from "@copilotkit/react-core/v2";

/** Keep the prompt, drop whatever the run produced. */
export function truncateToLastUser(messages: readonly Message[]): Message[] {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messages.slice(0, i + 1);
  }
  return [];
}

/**
 * Save on a successful finish. Any other ending - error, stop, "cancelled", a dropped
 * connection - is half a turn: drop it, as a returned mutation copilotkit can't undo.
 */
export function saveOrDropTurn(save: () => void): AgentSubscriber {
  const dropHalfTurn = ({ messages }: { messages: readonly Message[] }) => ({
    messages: truncateToLastUser(messages),
  });

  return {
    onRunFinishedEvent(params) {
      if (params.outcome !== "success") return dropHalfTurn(params);
      save();
    },
    onRunErrorEvent: dropHalfTurn,
    onRunFailed: dropHalfTurn,
  };
}

/** Only a successful finish clears "You stopped this response."; a stop can end as "cancelled". */
export function clearStopNoteOnSuccess(clear: () => void): AgentSubscriber {
  return {
    onRunFinishedEvent(params) {
      if (params.outcome === "success") clear();
    },
  };
}
