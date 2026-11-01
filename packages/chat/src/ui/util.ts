import type { ChatRecord } from "../core";

export const CHAT_MAX_WIDTH = 1100;
export const INTRO_WIDTH = 680;
export const EXAMPLES_WIDTH = 760;
export const HEADER_HEIGHT = 48;

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

export interface JsonToken {
  kind: "key" | "string" | "number" | "literal" | "punctuation";
  text: string;
}

// strings first, so digits and words inside a string stay part of it
const JSON_TOKEN = /"(?:[^"\\]|\\.)*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g;

export function jsonTokens(raw: string): JsonToken[] | null {
  let pretty: string;
  try {
    pretty = JSON.stringify(JSON.parse(raw), null, 2);
  } catch {
    return null;
  }
  const tokens: JsonToken[] = [];
  const punctuation = (text: string) => {
    if (text) tokens.push({ kind: "punctuation", text });
  };
  let end = 0;
  for (const match of pretty.matchAll(JSON_TOKEN)) {
    const [text] = match;
    punctuation(pretty.slice(end, match.index));
    end = match.index + text.length;
    if (text.startsWith('"')) {
      tokens.push({ kind: pretty[end] === ":" ? "key" : "string", text });
    } else {
      tokens.push({ kind: /^[tfn]/.test(text) ? "literal" : "number", text });
    }
  }
  punctuation(pretty.slice(end));
  return tokens;
}

export function groupChatsByDay(
  chats: ChatRecord[],
  now: number = Date.now(),
): { label: string; chats: ChatRecord[] }[] {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  // the calendar day before, not 24 hours before: a day is 23 or 25 hours when clocks change
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const todayStart = today.getTime();
  const yesterdayStart = yesterday.getTime();

  const groups = [
    { label: "RECENT SESSIONS", chats: [] as ChatRecord[] },
    { label: "YESTERDAY", chats: [] as ChatRecord[] },
    { label: "EARLIER", chats: [] as ChatRecord[] },
  ];

  for (const chat of chats) {
    const bucket = chat.updatedAt >= todayStart ? 0 : chat.updatedAt >= yesterdayStart ? 1 : 2;
    groups[bucket].chats.push(chat);
  }

  return groups.filter((group) => group.chats.length > 0);
}

export function searchChats(
  chats: ChatRecord[],
  query: string,
  activeChatId?: string,
): ChatRecord[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return chats;
  return chats.filter(
    (chat) => chat.id === activeChatId || chat.title.toLowerCase().includes(needle),
  );
}

export interface EnterKeyEvent {
  key: string;
  shiftKey: boolean;
  keyCode: number;
  nativeEvent: { isComposing: boolean };
}

// an Enter that picks an input-method candidate (Chinese, Japanese, Korean) isn't a send.
// 229: Safari ends composing with an Enter whose isComposing is already false
export const isSubmitEnter = (event: EnterKeyEvent): boolean =>
  event.key === "Enter" &&
  !event.shiftKey &&
  !event.nativeEvent.isComposing &&
  event.keyCode !== 229;
