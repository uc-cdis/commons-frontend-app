"use client";

import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ActionIcon,
  type ActionIconProps,
  Button,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { IconChevronLeft, IconChevronRight, IconPlus, IconSearch } from "@tabler/icons-react";
import type { ChatRecord } from "../core";
import type { SidebarState } from "./ChatShell";
import { ConversationItem } from "./ConversationItem";
import { HeaderStrip } from "./HeaderStrip";
import { groupChatsByDay, searchChats } from "./util";

export interface ChatSidebarProps extends SidebarState {
  chats: ChatRecord[];
  activeChatId: string;
  loading: boolean;
  isRunning: boolean;
  onNewConversation: () => void;
  onSelect: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
}

function SidebarIconButton({
  label,
  children,
  variant = "subtle",
  color = "var(--chat-accent)",
  ...props
}: Pick<ActionIconProps, "variant" | "color" | "disabled"> & {
  label: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Tooltip label={label} position="right" withArrow>
      <ActionIcon variant={variant} color={color} size="lg" aria-label={label} {...props}>
        {children}
      </ActionIcon>
    </Tooltip>
  );
}

// memo: the chat re-renders on every streamed token, and the list has a menu per chat
export const ChatSidebar = memo(function ChatSidebar({
  chats,
  activeChatId,
  loading,
  isRunning,
  onNewConversation,
  onSelect,
  onRename,
  onDelete,
  collapsed,
  onToggleCollapsed,
}: ChatSidebarProps) {
  const [query, setQuery] = useState("");
  const groups = groupChatsByDay(searchChats(chats, query, activeChatId));
  const isDraft = !loading && !chats.some((chat) => chat.id === activeChatId);

  // the search box isn't rendered while collapsed, so it takes the cursor once the list expands
  const searchRef = useRef<HTMLInputElement>(null);
  const focusSearchOnExpand = useRef(false);
  useEffect(() => {
    if (collapsed || !focusSearchOnExpand.current) return;
    focusSearchOnExpand.current = false;
    searchRef.current?.focus();
  }, [collapsed]);

  if (collapsed) {
    return (
      <Stack gap={0} flex={1} mih={0}>
        <HeaderStrip px={0} justify="center">
          <SidebarIconButton label="Expand sidebar" onClick={onToggleCollapsed}>
            <IconChevronRight size={18} />
          </SidebarIconButton>
        </HeaderStrip>
        <Stack gap="sm" pt="md" align="center">
          <SidebarIconButton
            label="New conversation"
            variant="filled"
            color="var(--chat-primary)"
            disabled={isRunning || isDraft}
            onClick={onNewConversation}
          >
            <IconPlus size={18} />
          </SidebarIconButton>
          <SidebarIconButton
            label="Search chats"
            color="var(--chat-action)"
            onClick={() => {
              focusSearchOnExpand.current = true;
              onToggleCollapsed?.();
            }}
          >
            <IconSearch size={18} />
          </SidebarIconButton>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack gap={0} flex={1} mih={0}>
      <HeaderStrip justify="space-between">
        <Text fw={700} size="lg" lh={1.2} c="var(--chat-title)">
          Genomics Explorer
        </Text>
        {onToggleCollapsed && (
          <SidebarIconButton label="Collapse sidebar" onClick={onToggleCollapsed}>
            <IconChevronLeft size={18} />
          </SidebarIconButton>
        )}
      </HeaderStrip>

      <Stack gap="md" p="md" flex={1} mih={0}>
        <Button
          leftSection={<IconPlus size={16} />}
          variant="filled"
          color="var(--chat-primary)"
          fullWidth
          onClick={onNewConversation}
          disabled={isRunning || isDraft}
        >
          New Conversation
        </Button>

        <TextInput
          leftSection={<IconSearch size={16} />}
          ref={searchRef}
          placeholder="Search chats"
          aria-label="Search chats"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />

        <ScrollArea flex={1} mih={0} type="auto" offsetScrollbars>
          {loading ? (
            <Stack gap="xs">
              <Skeleton height={36} radius="sm" />
              <Skeleton height={36} radius="sm" />
              <Skeleton height={36} radius="sm" />
            </Stack>
          ) : groups.length === 0 && chats.length > 0 ? (
            <Text size="sm" c="var(--chat-muted)">
              No chats match
            </Text>
          ) : (
            <Stack gap="md">
              {groups.map((group) => (
                <Stack gap="xs" key={group.label}>
                  <Text size="xs" fw={700} c="var(--chat-muted)" lts="1px">
                    {group.label}
                  </Text>
                  {group.chats.map((chat) => (
                    <ConversationItem
                      key={chat.id}
                      label={chat.title}
                      active={chat.id === activeChatId}
                      deleteDisabled={isRunning && chat.id === activeChatId}
                      selectDisabled={isRunning && chat.id !== activeChatId}
                      onClick={() => onSelect(chat.id)}
                      onRename={(title) => onRename(chat.id, title)}
                      onDelete={() => onDelete(chat.id)}
                    />
                  ))}
                </Stack>
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Stack>
    </Stack>
  );
});
