import { createModelsHandler } from "@gen3/chat/server";
import { getAgentBaseUrl } from "@/lib/chat/agent";
import { authenticateChatRequest } from "@/lib/chat/auth";

// reached through the /chat-models rewrite in next.config.js
export default createModelsHandler({
  verifyToken: authenticateChatRequest,
  agentBaseUrl: getAgentBaseUrl(),
});
