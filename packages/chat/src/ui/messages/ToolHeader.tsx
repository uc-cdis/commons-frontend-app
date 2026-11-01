"use client";

import { Group, Loader, Text, UnstyledButton, VisuallyHidden } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconCircleX,
  IconTool,
} from "@tabler/icons-react";
import { formatDuration } from "../util";
import { STATUS_LABELS, type ToolStatus } from "./toolStatus";

function StatusPill({
  status,
  label,
  compact,
}: {
  status: ToolStatus;
  label?: string;
  compact?: boolean;
}) {
  if (status === "completed" || (compact && status === "running")) {
    return (
      <span title={STATUS_LABELS[status]} style={{ display: "flex" }}>
        {status === "completed" ? (
          <IconCircleCheck size={18} color="var(--chat-success)" />
        ) : (
          <Loader size={10} type="dots" color="var(--chat-primary)" />
        )}
        <VisuallyHidden>{STATUS_LABELS[status]}</VisuallyHidden>
      </span>
    );
  }

  return (
    <span className="chat-status" data-status={status}>
      {status === "error" && <IconCircleX size={14} />}
      {status === "running" && <Loader size={10} type="dots" color="var(--chat-primary)" />}
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

export interface ToolHeaderProps {
  name: string;
  count?: number;
  index?: number;
  durationMs?: number;
  status: ToolStatus;
  statusLabel?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ToolHeader({
  name,
  count,
  index,
  durationMs,
  status,
  statusLabel,
  isExpanded,
  onToggle,
}: ToolHeaderProps) {
  const isChild = index !== undefined;

  return (
    <UnstyledButton onClick={onToggle} aria-expanded={isExpanded} w="100%" display="block">
      {/* tool names wrap on phones; a child row's arguments are cut with "…" instead */}
      <Group
        justify="space-between"
        wrap={isChild ? "nowrap" : "wrap"}
        {...(isChild ? { px: "sm", py: 6 } : { p: "xs" })}
      >
        <Group gap="xs" wrap="nowrap" miw={0}>
          {isChild ? (
            <Text size="xs" fw={600} c="var(--chat-muted)" w={18} style={{ flexShrink: 0 }}>
              {index}
            </Text>
          ) : (
            <IconTool size={16} color="var(--chat-icon)" style={{ flexShrink: 0 }} />
          )}
          <Text
            size="sm"
            ff="monospace"
            fw={500}
            c="var(--chat-tool-name)"
            bg={isChild ? undefined : "var(--chat-tint)"}
            px={isChild ? 0 : 6}
            truncate="end"
            style={{ borderRadius: "var(--mantine-radius-sm)" }}
          >
            {name}
          </Text>
          {count !== undefined && (
            <Text size="sm" fw={600} c="var(--chat-muted)">
              ×{count}
            </Text>
          )}
        </Group>

        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
          {durationMs !== undefined && (
            <Text size="xs" c="var(--chat-muted)">
              {formatDuration(durationMs)}
            </Text>
          )}
          <StatusPill status={status} label={statusLabel} compact={isChild} />
          {isExpanded ? (
            <IconChevronUp size={16} color="var(--chat-accent)" />
          ) : (
            <IconChevronDown size={16} color="var(--chat-accent)" />
          )}
        </Group>
      </Group>
    </UnstyledButton>
  );
}
