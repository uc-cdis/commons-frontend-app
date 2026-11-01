"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import type { ChatMessage, Timings } from "./types";
import { toChatMessage, lastUserIndex } from "./utils";
import { CHAT_MODELS, DEFAULT_CHAT_MODEL } from "./models";
import { useChatTimings } from "./useChatTimings";
import { useChatPersistence } from "./useChatPersistence";
import { useChatList } from "./useChatList";
import { clearStopNoteOnSuccess } from "./runEndings";
import type { ChatRecord } from "./db";
import { reportError, subscribeToChatErrors, type ChatError } from "./errors";

export interface UseChatApi {
  messages: ChatMessage[];
  isRunning: boolean;
  sendMessage: (text: string) => void;
  stopRun: () => void;
  clearMessages: () => void;
  error: ChatError | null;
  clearError: () => void;
  /** True once the user stops a run, until the next run or chat switch. */
  stopped: boolean;
  timings: Timings;
  /** model aliases the agent accepts - /ui reads them here, not from models.ts */
  models: readonly string[];
  /** Sent as forwardedProps.model on every run. */
  model: string;
  setModel: (model: string) => void;
  /** The prompt Retry and Edit act on, or null when neither is allowed. */
  editableMessageId: string | null;
  retry: () => void;
  editAndRerun: (text: string) => void;
  chatId: string;
  chats: ChatRecord[];
  chatsLoading: boolean;
  selectChat: (id: string) => Promise<void>;
  renameChat: (id: string, title: string) => Promise<void>;
  deleteChat: (id: string) => Promise<void>;
  deleteAllChats: () => Promise<void>;
}

// headless facade for the chat UI - /ui imports this and ChatMessage, nothing else
export function useChat({ agentId = "default" }: { agentId?: string }): UseChatApi {
  // unthrottled, every streamed token re-renders the chat and re-parses the whole answer
  const { agent } = useAgent({ agentId, throttleMs: 50 });
  const { copilotkit } = useCopilotKit();

  const [error, setError] = useState<ChatError | null>(null);
  const [stopped, setStopped] = useState(false);
  // re-runs the messages memo after our own addMessage, which only pushes
  const [bufferRevision, setBufferRevision] = useState(0);
  // not persisted on purpose - not worth it while CHAT_MODELS is hardcoded
  const [model, setModel] = useState(DEFAULT_CHAT_MODEL);

  // registered before the hooks below so it cannot miss what they report on mount
  useEffect(() => subscribeToChatErrors(setError), []);

  const clearError = useCallback(() => setError(null), []);

  const { timings, startTurn, reset: resetTimings } = useChatTimings(agent);
  const { chats, loading: chatsLoading, refresh, rename, remove, clear } = useChatList();
  const { chatId, onUserMessage, newChat, openChat } = useChatPersistence(agent, refresh);

  useEffect(() => {
    void copilotkit.connectAgent({ agent }).catch((err) => {
      reportError("connect", err);
    });
  }, [agent, copilotkit]);

  useEffect(() => {
    const sub = agent.subscribe({
      ...clearStopNoteOnSuccess(() => setStopped(false)),
      onNewMessage() {
        setBufferRevision((r) => r + 1);
      },
      onRunFailed({ error }) {
        reportError("run", error);
      },
      onRunErrorEvent({ event }) {
        if (event.code === "abort") return; // the user pressed Stop
        reportError("run", event);
      },
    });
    return () => sub.unsubscribe();
  }, [agent]);

  // v2's <CopilotKit> drops onError, so subscribe here for transport and tool failures
  useEffect(() => {
    const sub = copilotkit.subscribe({
      onError({ error }) {
        reportError("run", error);
      },
    });
    return () => sub.unsubscribe();
  }, [copilotkit]);

  // translate the agent buffer into our own shape so /ui never sees an AG-UI type
  const messages = useMemo<ChatMessage[]>(
    () => agent.messages.flatMap(toChatMessage),
    // both deps needed or a freshly sent prompt hides behind "Running..."
    // oxlint-disable-next-line react-hooks/exhaustive-deps
    [agent.messages, bufferRevision],
  );

  // forwardedProps is the only slot that survives the runtime's schema re-validation
  const runCurrent = useCallback(() => {
    void copilotkit
      .runAgent({ agent, forwardedProps: { model } })
      .catch((err) => reportError("run", err));
  }, [agent, copilotkit, model]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || agent.isRunning) return;

      const id = crypto.randomUUID();

      setError(null);
      setStopped(false);

      // order matters: clock before the message, persist before the run
      startTurn(id);
      agent.addMessage({ id, role: "user", content: trimmed });
      onUserMessage();
      runCurrent();
    },
    [agent, onUserMessage, runCurrent, startTurn],
  );

  // no reportError: stopping is the user's doing, not a failure. warn instead
  const stopRun = useCallback(() => {
    if (!agent.isRunning) return;
    setStopped(true);
    try {
      void Promise.resolve(copilotkit.stopAgent({ agent })).catch((err) =>
        console.warn("[chat-core] stopAgent rejected", err),
      );
    } catch (err) {
      console.warn("[chat-core] stopAgent threw", err);
    }
  }, [agent, copilotkit]);

  const last = agent.messages[agent.messages.length - 1];
  const editableMessageId = !agent.isRunning && last?.role === "user" ? last.id : null;

  const retry = useCallback(() => {
    if (agent.isRunning) return;
    const idx = lastUserIndex(agent.messages);
    if (idx < 0) return;
    setError(null);
    setStopped(false);
    startTurn(agent.messages[idx].id);
    runCurrent();
  }, [agent, runCurrent, startTurn]);

  const editAndRerun = useCallback(
    (text: string) => {
      // check before setMessages - it truncates, so a blocked edit would lose the transcript
      if (agent.isRunning || !text.trim()) return;
      const idx = lastUserIndex(agent.messages);
      if (idx < 0) return;
      agent.setMessages(agent.messages.slice(0, idx));
      sendMessage(text);
    },
    [agent, sendMessage],
  );

  // shared by New Chat and by loading an old one
  const resetLocalState = useCallback(() => {
    setError(null);
    setStopped(false);
    resetTimings();
  }, [resetTimings]);

  const clearMessages = useCallback(() => {
    newChat();
    resetLocalState();
  }, [newChat, resetLocalState]);

  const selectChat = useCallback(
    async (id: string) => {
      // reopening it would wipe its timings and the stop note, which live in memory only
      if (id === chatId) return;
      if (!(await openChat(id))) return;
      resetLocalState();
    },
    [chatId, openChat, resetLocalState],
  );

  const deleteChat = useCallback(
    async (id: string) => {
      if (id === chatId && agent.isRunning) return;
      await remove(id);
      if (id === chatId) clearMessages();
    },
    [agent, remove, chatId, clearMessages],
  );

  const deleteAllChats = useCallback(async () => {
    if (agent.isRunning) return;
    await clear();
    clearMessages();
  }, [agent, clear, clearMessages]);

  return {
    messages,
    isRunning: agent.isRunning,
    sendMessage,
    stopRun,
    clearMessages,
    error,
    clearError,
    stopped,
    timings,
    models: CHAT_MODELS,
    model,
    setModel,
    editableMessageId,
    retry,
    editAndRerun,
    chatId,
    chats,
    chatsLoading,
    selectChat,
    renameChat: rename,
    deleteChat,
    deleteAllChats,
  };
}
