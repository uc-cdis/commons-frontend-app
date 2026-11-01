"use client";

import { memo, useMemo } from "react";
import { Group, Paper, Text } from "@mantine/core";
import { IconFileDescription } from "@tabler/icons-react";
import { sameToolResult, type ToolRendererProps } from "../types";
import { DownloadButton } from "../DownloadButton";
import { findDownload } from "../downloads";
import { isRecord, parseJson } from "../json";

// file_count is optional: the card works without it
function fileCountOf(result: string): number | null {
  const parsed = parseJson(result);
  return isRecord(parsed) && typeof parsed.file_count === "number" ? parsed.file_count : null;
}

function ManifestToolResultImpl({ result }: ToolRendererProps) {
  const manifest = useMemo(() => findDownload(result, "manifest"), [result]);
  const fileCount = useMemo(() => (result ? fileCountOf(result) : null), [result]);

  // nothing to save yet (still running), or no link the portal serves; the panel shows the result
  if (!manifest) return null;

  return (
    <Paper className="chat-tool-card" radius="sm" p="sm" bg="var(--chat-tint)">
      <Group justify="space-between" wrap="wrap" gap="xs">
        <Group gap="xs" wrap="nowrap">
          <IconFileDescription size={18} color="var(--chat-title)" />
          <Text size="sm" fw={700} c="var(--chat-title)">
            GDC manifest{fileCount !== null ? ` · ${fileCount.toLocaleString()} files` : ""}
          </Text>
        </Group>
        <DownloadButton href={manifest.url} label="Download TSV" />
      </Group>
    </Paper>
  );
}

export const ManifestToolResult = memo(ManifestToolResultImpl, sameToolResult);
