"use client";

import { memo } from "react";
import { Group, Select, Text } from "@mantine/core";
import { IconAlertTriangle, IconChevronDown } from "@tabler/icons-react";
import type { ModelsFailure } from "../core";

// an xs Select's height; the note and the loading gap take the same
export const MODEL_ROW_HEIGHT = 30;

export interface ModelPickerProps {
  models: readonly string[];
  model: string | undefined;
  onModelChange: (model: string) => void;
}

// memo: the chat re-renders every 50ms while an answer streams, and its props don't change
export const ModelPicker = memo(function ModelPicker({
  models,
  model,
  onModelChange,
}: ModelPickerProps) {
  return (
    <Select
      data={models}
      value={model ?? null}
      // a long name ends in "…"; hovering shows it whole
      title={model}
      allowDeselect={false}
      // not onChange: Mantine skips it when the pick is the model already shown, which then isn't saved
      onOptionSubmit={onModelChange}
      aria-label="Model"
      size="xs"
      // today's longest name fits; a longer one ends in "…"
      w={260}
      maw="100%"
      styles={{ input: { textOverflow: "ellipsis" } }}
      rightSection={<IconChevronDown size={14} color="var(--chat-accent)" />}
    />
  );
});

const NOTE: Record<ModelsFailure, string> = {
  agent: "The agent isn't available right now.",
  list: "The model list couldn't be loaded.",
};

export function ModelsUnavailable({ failure }: { failure: ModelsFailure }) {
  return (
    <Group gap={6} wrap="nowrap" mih={MODEL_ROW_HEIGHT}>
      <IconAlertTriangle size={14} color="var(--chat-error-strong)" style={{ flexShrink: 0 }} />
      <Text size="xs" c="var(--chat-error-strong)">
        {NOTE[failure]}
      </Text>
    </Group>
  );
}
