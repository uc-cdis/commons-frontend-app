"use client";

import { Group, type GroupProps } from "@mantine/core";
import { HEADER_HEIGHT } from "./util";

export function HeaderStrip(props: Omit<GroupProps, "style">) {
  return (
    <Group
      h={HEADER_HEIGHT}
      px="md"
      gap="sm"
      wrap="nowrap"
      style={{ flexShrink: 0, borderBottom: "1px solid var(--chat-rule)" }}
      {...props}
    />
  );
}
