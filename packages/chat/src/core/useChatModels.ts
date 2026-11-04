import { createContext, useContext, useEffect, useState } from "react";
import { modelNames } from "./models";

export const ModelsUrlContext = createContext<string | undefined>(undefined);

/** "agent" when the portal couldn't get the list from the agent (502); "list" for any other failure, such as a 401 */
export type ModelsFailure = "agent" | "list";

export interface UseChatModels {
  models: readonly string[];
  failure: ModelsFailure | null;
  loading: boolean;
}

const LOADING: UseChatModels = { models: [], failure: null, loading: true };
const NO_LIST: UseChatModels = { models: [], failure: null, loading: false };
// the agent may be back after a restart; without this the note would stay until a reload
const RETRY_MS = 30_000;

export function useChatModels(): UseChatModels {
  const url = useContext(ModelsUrlContext);
  const [state, setState] = useState(LOADING);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    let status = 0;
    fetch(url, { signal: controller.signal })
      .then((res) => {
        status = res.status;
        return res.ok ? res.json() : Promise.reject(new Error(`${res.status}`));
      })
      .then((body: { models?: unknown } | null) =>
        setState({ models: modelNames(body?.models), failure: null, loading: false }),
      )
      // not reportError: the note under the question box says it, so no banner
      .catch((err) => {
        if (controller.signal.aborted) return;
        console.warn("[chat-core] no model list", err);
        setState({ models: [], failure: status === 502 ? "agent" : "list", loading: false });
      });
    return () => controller.abort();
  }, [url, attempt]);

  useEffect(() => {
    if (!state.failure) return;
    const timer = setTimeout(() => setAttempt((n) => n + 1), RETRY_MS);
    return () => clearTimeout(timer);
  }, [state.failure, attempt]);

  return url ? state : NO_LIST;
}
