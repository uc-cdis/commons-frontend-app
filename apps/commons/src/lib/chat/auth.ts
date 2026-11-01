import { errors, jwtVerify } from "jose";
import { getAccessToken } from "@/lib/auth/getLoginStatus";
import { getVerificationKey, invalidateVerificationKey } from "@/lib/auth/verificationKey";

type Check = "ok" | "bad-signature" | "rejected";

async function check(token: string): Promise<Check> {
  const key = await getVerificationKey();
  if (!key) return "rejected";
  try {
    await jwtVerify(token, key); // rejects an expired token too
    return "ok";
  } catch (error) {
    console.error(
      "[chat-auth] access token verification failed:",
      error instanceof Error ? error.message : error,
    );
    return error instanceof errors.JWSSignatureVerificationFailed ? "bad-signature" : "rejected";
  }
}

/**
 * Verify the caller's Gen3 session from the request cookie. Other proxies hand the token to a Gen3 service that validates it; an
 * unauthenticated request here reaches an agent that spends real inference budget.
 *
 * Returns the token so the caller can forward it upstream, or null to 401.
 */
export const authenticateChatRequest = async (
  cookie: string | undefined,
): Promise<string | null> => {
  const token = getAccessToken(cookie);
  if (!token) return null;

  const first = await check(token);
  if (first !== "bad-signature") return first === "ok" ? token : null;

  // a rotated Fence key is how a good token starts failing its signature: drop the
  // cached key (at most once a minute) and check once more
  invalidateVerificationKey();
  return (await check(token)) === "ok" ? token : null;
};
