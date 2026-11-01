"use client";

import { useChat } from "../core";
import { ChatHeader } from "./ChatHeader";
import { ChatShell } from "./ChatShell";
import { ChatSidebar } from "./ChatSidebar";
import { ChatInput } from "./ChatInput";
import { Box, Stack } from "@mantine/core";
import { EmptyState } from "./EmptyState";
import { ErrorBanner } from "./ErrorBanner";
import { MessageList } from "./messages";
import { CHAT_MAX_WIDTH } from "./util";

export interface ChatProps {
  agentId?: string;
}

export function Chat({ agentId }: ChatProps) {
  const {
    messages,
    isRunning,
    sendMessage,
    stopRun,
    clearMessages,
    timings,
    chatId,
    chats,
    chatsLoading,
    selectChat,
    renameChat,
    deleteChat,
    error,
    clearError,
    stopped,
    retry,
    editableMessageId,
    editAndRerun,
    models,
    model,
    setModel,
  } = useChat({ agentId });

  const isEmpty = messages.length === 0 && !isRunning;
  const activeChat = chats.find((chat) => chat.id === chatId);

  return (
    <ChatShell
      headerContent={
        <ChatHeader
          title={activeChat?.title}
          deleteDisabled={isRunning}
          onRename={(title) => renameChat(chatId, title)}
          onDelete={() => deleteChat(chatId)}
          models={models}
          model={model}
          onModelChange={setModel}
        />
      }
      sidebar={(state) => (
        <ChatSidebar
          chats={chats}
          activeChatId={chatId}
          loading={chatsLoading}
          isRunning={isRunning}
          onNewConversation={clearMessages}
          onSelect={selectChat}
          onRename={renameChat}
          onDelete={deleteChat}
          {...state}
        />
      )}
    >
      <Stack flex={1} mih={0} miw={0} gap={0}>
        {isEmpty ? (
          <Box flex={1} mih={0} style={{ overflowY: "auto", display: "flex" }}>
            <Box m="auto" maw={CHAT_MAX_WIDTH} w="100%" px="lg" py="xl">
              <EmptyState onSelect={sendMessage} disabled={isRunning} />
            </Box>
          </Box>
        ) : (
          <MessageList
            messages={messages}
            isRunning={isRunning}
            timings={timings}
            stopped={stopped}
            chatId={chatId}
            editableMessageId={editableMessageId}
            onRetry={retry}
            onEdit={editAndRerun}
          />
        )}

        <Box style={{ flexShrink: 0, borderTop: "1px solid var(--chat-rule)" }}>
          <Stack gap="sm" px="md" pt="sm" maw={CHAT_MAX_WIDTH} mx="auto" w="100%">
            {error && <ErrorBanner error={error} onDismiss={clearError} />}
            <ChatInput
              isRunning={isRunning}
              onSend={sendMessage}
              onStop={stopRun}
              placeholder="Ask me a question about GDC data ..."
            />
          </Stack>
        </Box>
      </Stack>
    </ChatShell>
  );
}
