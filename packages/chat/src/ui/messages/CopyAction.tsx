"use client";

import { CopyButton } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { TextAction } from "./TextAction";

export function CopyAction({ value, label }: { value: string; label: string }) {
  return (
    <CopyButton value={value} timeout={2000}>
      {({ copied, copy }) => (
        <TextAction
          icon={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
          label={copied ? "Copied" : "Copy"}
          ariaLabel={copied ? "Copied to clipboard" : label}
          color={copied ? "var(--chat-success)" : undefined}
          onClick={copy}
        />
      )}
    </CopyButton>
  );
}
