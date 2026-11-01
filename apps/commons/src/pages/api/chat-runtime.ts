import { createChatHandler } from "@gen3/chat/server";
import { getAgentBaseUrl } from "@/lib/chat/agent";
import { authenticateChatRequest } from "@/lib/chat/auth";

// v2 builds its Request from the raw stream - a parsed body leaves it drained and hangs
export const config = { api: { bodyParser: false } };

export default createChatHandler({
  verifyToken: authenticateChatRequest,
  endpoint: "/chat-runtime",
  agentBaseUrl: getAgentBaseUrl(),
});
