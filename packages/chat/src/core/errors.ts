// One funnel for everything that goes wrong in /core: log it, then tell whoever is
// listening. Never call reportError during render - notifying runs a setState.

export type ChatErrorSource =
  | "connect" // agent connection
  | "run" // a run: RUN_ERROR event, runAgent / stopAgent rejection
  | "persist" // saving a chat
  | "db" // reading or mutating chat records
  | "parse"; // malformed payload from the agent

export interface ChatError {
  source: ChatErrorSource;
  message: string;
  raw: unknown;
}

/** Pulls a message out of an Error, a RUN_ERROR event, a DOMException, or junk. */
function messageOf(raw: unknown): string {
  if (raw instanceof Error) return raw.message || raw.name;
  if (typeof raw === "string") return raw;

  if (
    typeof raw === "object" &&
    raw !== null &&
    typeof (raw as { message?: unknown }).message === "string"
  ) {
    return (raw as { message: string }).message;
  }

  return "Something went wrong.";
}

type ChatErrorListener = (error: ChatError) => void;

// Module scope rather than context: reporters include plain functions and
// ChatProvider, both outside the hook that renders the alert.
const listeners = new Set<ChatErrorListener>();

/** Returns its own unsubscribe, so an effect can return it directly. */
export function subscribeToChatErrors(listener: ChatErrorListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function reportError(source: ChatErrorSource, raw: unknown): ChatError {
  const error: ChatError = { source, message: messageOf(raw), raw };
  console.error(`[chat-core:${source}] ${error.message}`, raw);
  for (const listener of listeners) listener(error);
  return error;
}
