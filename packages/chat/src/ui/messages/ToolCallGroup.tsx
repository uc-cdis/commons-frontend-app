"use client";

import { useState, type ReactNode } from "react";
import { Collapse, Paper } from "@mantine/core";
import { ToolHeader } from "./ToolHeader";
import type { ToolStatus } from "./toolStatus";

export interface ToolCallGroupProps {
  name: string;
  count: number;
  status: ToolStatus;
  statusLabel?: string;
  children: ReactNode;
}

export function ToolCallGroup({ name, count, status, statusLabel, children }: ToolCallGroupProps) {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <Paper className="chat-tool-panel" radius="sm" bg="var(--mantine-color-default)">
      <ToolHeader
        name={name}
        count={count}
        status={status}
        statusLabel={statusLabel}
        isExpanded={isExpanded}
        onToggle={() => setExpanded((open) => !open)}
      />
      <Collapse expanded={isExpanded}>
        <div className="chat-tool-list">{children}</div>
      </Collapse>
    </Paper>
  );
}
