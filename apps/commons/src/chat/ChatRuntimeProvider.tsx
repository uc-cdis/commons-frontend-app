"use client";

import { useMemo, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useGetCSRFQuery } from "@gen3/core";
import Loading from "@/components/Loading";

const ChatProvider = dynamic(() => import("@gen3/chat").then((m) => m.ChatProvider), {
  ssr: false,
  loading: () => <Loading />,
});

// supplies the Gen3 bits @gen3/chat must not know about: its urls, the CSRF header,
// and ssr:false so CopilotKit never reaches the server bundle.
export function ChatRuntimeProvider({ children }: { children: ReactNode }) {
  const { basePath } = useRouter();
  const { data } = useGetCSRFQuery();
  const csrfToken = data?.csrfToken;

  const headers = useMemo(
    () => (csrfToken ? { "X-CSRF-Token": csrfToken } : undefined),
    [csrfToken],
  );

  return (
    <ChatProvider
      runtimeUrl={`${basePath}/chat-runtime`}
      modelsUrl={`${basePath}/chat-models`}
      headers={headers}
    >
      {children}
    </ChatProvider>
  );
}
