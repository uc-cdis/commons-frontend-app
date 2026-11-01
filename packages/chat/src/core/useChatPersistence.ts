// Owns chat identity and write policy.
import { useCallback, useEffect, useState } from "react";
import type { AbstractAgent, Message } from "@copilotkit/react-core/v2";
import { saveChat, loadChat } from "./db";
import { reportError } from "./errors";
import { saveOrDropTurn } from "./runEndings";
import { extractText, shortenTitle } from "./utils";

export interface UseChatPersistence {
  /** Id of the chat that's currently loaded or running */
  chatId: string;
  /** Write point 1. Call from sendMessage, right after agent.addMessage. */
  onUserMessage: () => void;
  /** New chat. Clears the agent buffer. No-op mid-run. */
  newChat: () => void;
  /** Load an existing chat into the agent. False when the id is unknown or mid-run. */
  openChat: (id: string) => Promise<boolean>;
}

/** First user message, cut to 80 chars at a whole word. Re-applied on every save until the user renames. */
function deriveTitle(messages: Message[]): string {
  const first = messages.find((m) => m.role === "user");
  return shortenTitle(extractText(first?.content)) || "New Chat";
}

function newId(): string {
  return crypto.randomUUID();
}

/**
 * Persists the agent's buffer to IndexedDB, one record per chat. Writes on send
 * and on a successful run; rolls back to the last user message when a run fails or
 * is stopped, so the buffer never holds half an answer the next save would keep.
 */
export function useChatPersistence(
  agent: AbstractAgent,
  refresh: () => Promise<void>,
): UseChatPersistence {
  const [chatId, setChatId] = useState(() => (agent.threadId ??= newId()));

  const setChat = useCallback(
    (id: string) => {
      // We own agent.threadId - CopilotKit's ThreadsProvider never writes it.
      // oxlint-disable-next-line react/immutability
      agent.threadId = id;
      setChatId(id);
    },
    [agent],
  );

  const write = useCallback(
    (messages: Message[]) => {
      void saveChat({
        id: chatId,
        title: deriveTitle(messages),
        messages,
      })
        .then(refresh)
        .catch((err) => reportError("persist", err));
    },
    [chatId, refresh],
  );

  // Write point 2: a successful finish is saved, any other ending is dropped.
  useEffect(() => {
    const sub = agent.subscribe(saveOrDropTurn(() => write(agent.messages.slice())));
    return () => sub.unsubscribe();
  }, [agent, write]);

  // Save the prompt before the run, so a crash or reload can't lose it.
  const onUserMessage = useCallback(() => {
    write(agent.messages.slice());
  }, [agent, write]);

  // No write here, so an empty chat never shows up in the sidebar.
  const newChat = useCallback(() => {
    if (agent.isRunning) return;
    setChat(newId());
    agent.setMessages([]);
  }, [agent, setChat]);

  /** Swap the buffer for a stored transcript. False if the id is unknown. */
  const openChat = useCallback(
    async (id: string) => {
      if (agent.isRunning) return false;

      const loaded = await loadChat(id);
      if (!loaded) return false;
      agent.setMessages(loaded.messages);
      setChat(loaded.chat.id);
      return true;
    },
    [agent, setChat],
  );

  return { chatId, onUserMessage, newChat, openChat };
}
