"use client";

import type { ReactNode } from "react";
import { Button } from "@mantine/core";

export function TextAction({
  icon,
  label,
  ariaLabel,
  onClick,
  color = "var(--chat-action)",
}: {
  icon: ReactNode;
  label: string;
  /** starts with the visible label, so voice control still finds it */
  ariaLabel?: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <Button
      variant="subtle"
      size="compact-xs"
      color={color}
      leftSection={icon}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
