"use client";

import type { CSSProperties } from "react";
import { ActionIcon, Box } from "@mantine/core";
import { IconArrowDown } from "@tabler/icons-react";

export interface JumpToLatestProps {
  onClick: () => void;
  style?: CSSProperties;
}

export function JumpToLatest({ onClick, style }: JumpToLatestProps) {
  return (
    <Box
      pos="absolute"
      bottom={12}
      left={0}
      right={0}
      // the transition's transform goes on the row: on the button it would replace the press nudge
      style={{ ...style, display: "flex", justifyContent: "center", pointerEvents: "none" }}
    >
      <ActionIcon
        onClick={onClick}
        aria-label="Scroll to latest"
        variant="default"
        radius="xl"
        size="lg"
        style={{ pointerEvents: "auto", boxShadow: "var(--mantine-shadow-md)" }}
      >
        <IconArrowDown size={18} />
      </ActionIcon>
    </Box>
  );
}
