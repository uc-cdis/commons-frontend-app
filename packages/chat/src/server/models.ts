// The model picker's list comes from the agent, so it can't drift from its deployed config
import { modelNames } from "../core/models";
import { agentUnavailable, callAgent, type AgentDeps } from "./agent";

// a stalled agent would otherwise hold each chat page's request for minutes
const TIMEOUT_MS = 10_000;

export async function fetchModels(cookie: string | undefined, deps: AgentDeps): Promise<Response> {
  const call = await callAgent(cookie, "/endpoint/health", deps, TIMEOUT_MS);
  if ("refused" in call) return call.refused;
  const { upstream } = call;

  if (!upstream.ok) {
    // unread, the body would hold the agent connection open until garbage collection
    await upstream.body?.cancel().catch(() => {});
    console.error(`[chat-models] the agent answered ${upstream.status}`);
    return agentUnavailable();
  }
  try {
    const { backends } = (await upstream.json()) as { backends?: unknown };
    return Response.json({ models: modelNames(backends) });
  } catch (error) {
    console.error("[chat-models] couldn't read the agent's answer:", error);
    return agentUnavailable();
  }
}
