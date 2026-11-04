"use client";

import type { ReactNode } from "react";
import { CopilotKit } from "@copilotkit/react-core/v2";
import { ModelsUrlContext } from "./useChatModels";

const NO_HEADERS: Record<string, string> = {};

export interface ChatProviderProps {
  runtimeUrl: string;
  /** returns { models }, the agent's model names; without it there is no model picker */
  modelsUrl?: string;
  headers?: Record<string, string>;
  children: ReactNode;
}

export function ChatProvider({ runtimeUrl, modelsUrl, headers, children }: ChatProviderProps) {
  const inspectorEnabled =
    process.env.NODE_ENV !== "production" &&
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("copilotInspector");

  return (
    <CopilotKit
      runtimeUrl={runtimeUrl}
      headers={headers ?? NO_HEADERS}
      useSingleEndpoint
      enableInspector={inspectorEnabled}
    >
      <ModelsUrlContext value={modelsUrl}>{children}</ModelsUrlContext>
    </CopilotKit>
  );
}
