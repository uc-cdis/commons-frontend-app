"use client";

import type { ToolCall } from "../../core";
import { toolRenderers } from "./registry";

interface ToolResultCardProps {
  toolCall: ToolCall;
  result: string | null;
  isRunning: boolean;
}

export function ToolResultCard({ toolCall, result, isRunning }: ToolResultCardProps) {
  const Renderer = toolRenderers[toolCall.name];
  if (!Renderer) return null;
  if (!result && !isRunning) return null;

  return <Renderer toolCall={toolCall} result={result} />;
}
