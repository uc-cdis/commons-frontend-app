// The contract between /core and /ui. UI components depend on these shapes only,
// never on AG-UI or CopilotKit types.

export type ChatRole = "user" | "assistant" | "reasoning" | "tool";

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown> | null; // parsed from the wire's JSON string
}

export type ChatMessage =
  | {
      id: string;
      role: "user";
      content: string;
    }
  | {
      id: string;
      role: "assistant";
      content: string;
      toolCalls?: ToolCall[];
    }
  | {
      id: string;
      role: "reasoning";
      content: string;
    }
  | {
      id: string;
      role: "tool";
      toolCallId: string; // ties back to the assistant's ToolCall.id
      content: string;
      failed: boolean;
    };

export type ToolResultMessage = Extract<ChatMessage, { role: "tool" }>;

export interface Timings {
  turns: Record<string, number>; // userMessageId → ms
  tools: Record<string, number>; // toolCallId → ms
  reasoning: Record<string, number>; // reasoningMessageId → ms
}
