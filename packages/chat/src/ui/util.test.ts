import { describe, expect, it } from "vitest";
import type { ChatRecord } from "../core";
import { groupChatsByDay, isSubmitEnter, jsonTokens, searchChats } from "./util";

// clocks went forward here on 9 March 2025, so the midnight test means something on CI too
process.env.TZ = "America/New_York";
const HOUR = 3_600_000;
const NOW = new Date(2025, 2, 10, 12, 0).getTime();
const chat = (id: string, title: string, updatedAt: number): ChatRecord => ({
  id,
  title,
  titleAuto: true,
  createdAt: updatedAt,
  updatedAt,
});

describe("groupChatsByDay", () => {
  it("groups chats into recent sessions, yesterday and earlier, keeping their order", () => {
    const chats = [
      chat("a", "KRAS in lung", NOW - 1 * HOUR),
      chat("b", "BRAF survival", NOW - 3 * HOUR),
      chat("c", "TP53 burden", NOW - 20 * HOUR), // yesterday, 4 pm
      chat("d", "BRCA variants", NOW - 5 * 24 * HOUR),
    ];
    expect(groupChatsByDay(chats, NOW)).toEqual([
      { label: "RECENT SESSIONS", chats: [chats[0], chats[1]] },
      { label: "YESTERDAY", chats: [chats[2]] },
      { label: "EARLIER", chats: [chats[3]] },
    ]);
  });

  it("starts yesterday at midnight even when the clocks changed overnight", () => {
    // vitest's thread pool ignores a TZ set at runtime; this fails instead of passing for nothing
    expect(new Date(NOW).getTimezoneOffset()).toBe(240);
    const lateOnThe8th = chat("e", "EGFR in lung", new Date(2025, 2, 8, 23, 30).getTime());
    expect(groupChatsByDay([lateOnThe8th], NOW)).toEqual([
      { label: "EARLIER", chats: [lateOnThe8th] },
    ]);
  });

  it("leaves out groups with no chats", () => {
    const old = chat("d", "BRCA variants", NOW - 5 * 24 * HOUR);
    expect(groupChatsByDay([old], NOW)).toEqual([{ label: "EARLIER", chats: [old] }]);
  });
});

describe("searchChats", () => {
  const chats = [chat("a", "KRAS in lung", NOW), chat("b", "BRAF survival", NOW)];

  it("keeps chats whose title contains the search, ignoring case", () => {
    expect(searchChats(chats, "kras")).toEqual([chats[0]]);
  });

  it("keeps every chat when the search is blank", () => {
    expect(searchChats(chats, "  ")).toEqual(chats);
  });

  it("keeps none when nothing matches", () => {
    expect(searchChats(chats, "EGFR")).toEqual([]);
  });

  it("keeps the open chat, so a new chat doesn't seem to vanish under an old search", () => {
    expect(searchChats(chats, "kras", "b")).toEqual(chats);
  });
});

describe("isSubmitEnter", () => {
  const key = (
    key: string,
    extra: { shiftKey?: boolean; isComposing?: boolean; keyCode?: number } = {},
  ) => ({
    key,
    shiftKey: extra.shiftKey ?? false,
    keyCode: extra.keyCode ?? (key === "Enter" ? 13 : 0),
    nativeEvent: { isComposing: extra.isComposing ?? false },
  });

  it("sends on Enter", () => {
    expect(isSubmitEnter(key("Enter"))).toBe(true);
  });

  it.each([
    ["Shift+Enter, a new line", key("Enter", { shiftKey: true })],
    ["Enter that picks an input-method candidate", key("Enter", { isComposing: true })],
    ["Safari's Enter that ends composing (keyCode 229)", key("Enter", { keyCode: 229 })],
    ["another key", key("a")],
  ])("doesn't send on %s", (_case, event) => {
    expect(isSubmitEnter(event)).toBe(false);
  });
});

describe("jsonTokens", () => {
  const raw = JSON.stringify({
    project: ["TCGA-LUAD"],
    note: 'say "hi": now',
    max_age: 120,
    rate: -1.5e-7,
    ok: true,
    gone: null,
  });
  const tokens = jsonTokens(raw) ?? [];
  const kindOf = (text: string) => tokens.find((t) => t.text === text)?.kind;

  it("gives back the pretty-printed JSON when joined", () => {
    expect(tokens.map((t) => t.text).join("")).toBe(JSON.stringify(JSON.parse(raw), null, 2));
  });

  it("tells keys from string values", () => {
    expect(kindOf('"project"')).toBe("key");
    expect(kindOf('"TCGA-LUAD"')).toBe("string");
  });

  it("keeps escaped quotes and colons inside their string", () => {
    expect(kindOf('"say \\"hi\\": now"')).toBe("string");
  });

  it("reads numbers and literals", () => {
    expect(kindOf("120")).toBe("number");
    expect(kindOf("-1.5e-7")).toBe("number");
    expect(kindOf("true")).toBe("literal");
    expect(kindOf("null")).toBe("literal");
  });

  it("keeps each run of punctuation in one piece", () => {
    expect(jsonTokens('{"a":1}')).toEqual([
      { kind: "punctuation", text: "{\n  " },
      { kind: "key", text: '"a"' },
      { kind: "punctuation", text: ": " },
      { kind: "number", text: "1" },
      { kind: "punctuation", text: "\n}" },
    ]);
  });

  it("returns null for text that isn't JSON", () => {
    expect(jsonTokens("Unknown field 'cases.foo'")).toBeNull();
  });
});
