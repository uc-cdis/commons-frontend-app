import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Message } from "@copilotkit/react-core/v2";

// Sidebar row: metadata only, no messages.
export interface ChatRecord {
  id: string;
  title: string;
  titleAuto: boolean; // false once the user renames it, which freezes the title
  createdAt: number;
  updatedAt: number;
}

// Two stores so the sidebar can list chats without pulling every transcript.
interface ChatDB extends DBSchema {
  chats: {
    key: string;
    value: ChatRecord;
    indexes: { "by-updated": number };
  };
  messages: {
    key: string;
    value: { chatId: string; messages: Message[] };
  };
}

// A new name, not a version bump: old chats hold QAG tool calls that may not replay on
// the gdc agent, so they stay in "QAG-chat", untouched and no longer read. Might delete that later
const DEFAULT_DB_NAME = "gdc-chat";
const DB_VERSION = 1;

const dbName = DEFAULT_DB_NAME;
let dbPromise: Promise<IDBPDatabase<ChatDB>> | null = null;

/** Opens the database, creating both stores on first run. */
export function openChatDb(name: string = DEFAULT_DB_NAME) {
  return openDB<ChatDB>(name, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const chats = db.createObjectStore("chats", { keyPath: "id" });
        chats.createIndex("by-updated", "updatedAt");
        db.createObjectStore("messages", { keyPath: "chatId" });
      }
    },
  });
}

/** One connection per name, opened lazily and shared by every call below. */
function getDb(): Promise<IDBPDatabase<ChatDB>> {
  return (dbPromise ??= openChatDb(dbName));
}

/** Sidebar order: most recently touched first. */
export async function listChats(): Promise<ChatRecord[]> {
  const db = await getDb();
  const rows = await db.getAllFromIndex("chats", "by-updated");
  return rows.reverse();
}

/** Metadata and messages. */
export async function loadChat(
  chatId: string,
): Promise<{ chat: ChatRecord; messages: Message[] } | null> {
  const db = await getDb();
  const tx = db.transaction(["chats", "messages"], "readonly");

  const chatReq = tx.objectStore("chats").get(chatId);
  const messagesReq = tx.objectStore("messages").get(chatId);
  const [chat, row] = await Promise.all([chatReq, messagesReq]);
  await tx.done;

  return chat ? { chat, messages: row?.messages ?? [] } : null;
}

/**
 * Upsert. Replaces the whole transcript rather than appending, which keeps client
 * state simple. The derived title is re-applied every save until the user renames.
 */
export async function saveChat(input: {
  id: string;
  title: string;
  messages: Message[];
}): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["chats", "messages"], "readwrite");
  const chats = tx.objectStore("chats");

  const existingChat = await chats.get(input.id);
  const now = Date.now();

  const record: ChatRecord = existingChat
    ? { ...existingChat, updatedAt: now, ...(existingChat.titleAuto && { title: input.title }) }
    : {
        id: input.id,
        title: input.title,
        titleAuto: true,
        createdAt: now,
        updatedAt: now,
      };

  await Promise.all([
    chats.put(record),
    tx.objectStore("messages").put({ chatId: input.id, messages: input.messages }),
    tx.done,
  ]);
}

/** Renames a chat and stops the derived title from overwriting it. */
export async function renameChat(id: string, title: string): Promise<boolean> {
  const db = await getDb();
  const tx = db.transaction("chats", "readwrite");
  const store = tx.objectStore("chats");

  const existing = await store.get(id);
  if (!existing) {
    await tx.done;
    return false;
  }

  await Promise.all([store.put({ ...existing, title, titleAuto: false }), tx.done]);
  return true;
}

/** Drops both rows. Returns whether there was anything to delete. */
export async function deleteChat(id: string): Promise<boolean> {
  const db = await getDb();
  const tx = db.transaction(["chats", "messages"], "readwrite");
  const chats = tx.objectStore("chats");

  const existed = (await chats.count(id)) > 0;

  await Promise.all([chats.delete(id), tx.objectStore("messages").delete(id), tx.done]);

  return existed;
}

/** Wipes every chat and transcript. */
export async function clearAllChats(): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(["chats", "messages"], "readwrite");

  await Promise.all([tx.objectStore("chats").clear(), tx.objectStore("messages").clear(), tx.done]);
}
