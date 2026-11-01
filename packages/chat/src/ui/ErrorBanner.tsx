"use client";

import { Alert, Text } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { ChatError } from "../core";

export interface ErrorBannerProps {
  error: ChatError | null;
  onDismiss: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  if (!error) return null;

  return (
    <Alert
      variant="light"
      vars={() => ({
        root: {
          "--alert-bg": "var(--chat-error-tint)",
          "--alert-color": "var(--chat-error-strong)",
        },
      })}
      radius="md"
      p="xs"
      icon={<IconAlertTriangle size={16} />}
      withCloseButton
      closeButtonLabel="Dismiss error"
      onClose={onDismiss}
    >
      <Text size="sm">Something went wrong. Please try again.</Text>
    </Alert>
  );
}
