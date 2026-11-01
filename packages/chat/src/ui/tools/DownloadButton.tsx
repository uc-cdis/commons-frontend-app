"use client";

import type { ReactNode } from "react";
import { Button } from "@mantine/core";
import { IconDownload } from "@tabler/icons-react";

export function DownloadButton({ href, label }: { href: string; label: ReactNode }) {
  return (
    <Button
      component="a"
      href={href}
      download
      variant="outline"
      color="var(--chat-download)"
      size="compact-sm"
      // the icon draws its tray at the bottom of its box, so it reads low beside the text:
      // the -2px margin lifts its centre 1px
      leftSection={<IconDownload size={16} style={{ marginTop: -2 }} />}
      styles={{ section: { marginInlineEnd: 6 } }}
    >
      {label}
    </Button>
  );
}
