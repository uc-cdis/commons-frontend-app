import type { Message } from "@copilotkit/react-core/v2";
import type { ChatMessage, ToolCall } from "./types";

// Message -> ChatMessage. Lossy for now; more of the agent's message fields will
// need to come across as the UI grows.
export function toChatMessage(message: Message): ChatMessage[] {
  if (message.role === "user") {
    const text = extractText(message.content);
    if (!text) return [];
    return [{ id: message.id, role: "user", content: text }];
  }

  if (message.role === "assistant") {
    const text = extractText(message.content);
    const toolCalls: ToolCall[] = (message.toolCalls ?? [])
      .filter((tc) => tc.function.name !== ANSWER_TOOL)
      .map((tc) => ({
        id: tc.id,
        name: tc.function.name,
        args: parseArgs(tc.function.arguments),
      }));

    if (!text && toolCalls.length === 0) return [];

    return [{ id: message.id, role: "assistant", content: text, toolCalls }];
  }

  if (message.role === "reasoning") {
    const text = typeof message.content === "string" ? message.content : "";
    if (!text) return [];

    return [{ id: message.id, role: "reasoning", content: text }];
  }

  if (message.role === "tool") {
    // tool content can be parts too; only the text is rendered
    const content = extractText(message.content);
    return [
      {
        id: message.id,
        role: "tool",
        toolCallId: message.toolCallId,
        content,
        failed:
          message.error !== undefined ||
          pydanticOutcome(message.encryptedValue) === "failed" ||
          content.endsWith(RETRY_PROMPT_END),
      },
    ];
  }

  return [];
}

// pydantic-ai's output tool: its arguments are a draft the agent may still reject; the
// checked answer arrives after it as a text message
const ANSWER_TOOL = "final_result";

// TOOL_CALL_RESULT has no outcome, so pydantic-ai sends a failed call's outcome in a
// REASONING_ENCRYPTED_VALUE event under its own key, which @ag-ui/client copies onto the message
function pydanticOutcome(encryptedValue: string | undefined): unknown {
  if (!encryptedValue) return undefined;
  try {
    const parsed: unknown = JSON.parse(encryptedValue);
    const claims = isRecord(parsed) ? parsed.pydantic_ai : undefined;
    return isRecord(claims) ? claims.outcome : undefined;
  } catch {
    return undefined;
  }
}

// bad arguments are retried rather than failed, and carry no outcome: only this ending
const RETRY_PROMPT_END = "\n\nFix the errors and try again.";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Arguments arrive as a growing string, so they only parse once complete. */
function parseArgs(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/** AG-UI content can be a plain string or an array of multimodal parts. */
export function extractText(content: unknown): string {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content
      .filter(
        (part): part is { type: "text"; text: string } =>
          typeof part === "object" &&
          part !== null &&
          (part as { type?: unknown }).type === "text" &&
          typeof (part as { text?: unknown }).text === "string",
      )
      .map((part) => part.text)
      .join("");
  }

  return "";
}

/** Index of the most recent user message, or -1 if there is none. */
export function lastUserIndex(messages: Message[]): number {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return i;
  }
  return -1;
}

const TITLE_MAX = 80;

export function shortenTitle(text: string): string {
  const title = text.trim();
  if (title.length <= TITLE_MAX) return title;
  // a space at index 79 still leaves room for the "…"
  const lastSpace = title.lastIndexOf(" ", TITLE_MAX - 1);
  const kept = lastSpace > 0 ? title.slice(0, lastSpace) : title.slice(0, TITLE_MAX - 1);
  return `${kept.trimEnd()}…`;
}
