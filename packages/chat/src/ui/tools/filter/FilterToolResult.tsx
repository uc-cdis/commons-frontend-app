"use client";

import { memo, useMemo } from "react";
import { Group, Paper, Text } from "@mantine/core";
import { IconFilter } from "@tabler/icons-react";
import { sameToolResult, type ToolRendererProps } from "../types";
import { DownloadButton } from "../DownloadButton";
import { findDownload } from "../downloads";
import { readFilter } from "./readFilter";

function FilterToolResultImpl({ result }: ToolRendererProps) {
  const link = useMemo(() => findDownload(result, "filter"), [result]);
  const filter = useMemo(() => (result ? readFilter(result) : null), [result]);

  // nothing to save yet (still running), or no link the portal serves; the panel shows the result
  if (!link) return null;

  const conditions = filter?.conditions ?? 0;
  return (
    <Paper className="chat-tool-card" radius="sm" p="sm" bg="var(--chat-tint)">
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Group gap="xs" wrap="nowrap" miw={0}>
          <IconFilter size={18} color="var(--chat-title)" style={{ flexShrink: 0 }} />
          <Text size="sm" fw={700} c="var(--chat-title)">
            GDC {filter?.scope ? `${filter.scope} ` : ""}filter
            {conditions > 0 && ` · ${conditions} ${conditions === 1 ? "condition" : "conditions"}`}
          </Text>
        </Group>
        <DownloadButton href={link.url} label="Download JSON" />
      </Group>
    </Paper>
  );
}

export const FilterToolResult = memo(FilterToolResultImpl, sameToolResult);
