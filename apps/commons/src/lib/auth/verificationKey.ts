import { importSPKI, type KeyObject } from "jose";
import { fetchJWTKey } from "@gen3/frontend/server";

/**
 * Fence's RS256 public key, cached in-process.
 *
 * fetchJWTKey is a bare /jwt/keys request with no caching of its own, so without this
 * every session check costs a Fence round trip: once per protected navigation, and
 * once per chat turn on the path before a single token streams.
 *
 * Callers must invalidate on a verification failure. A rotated key is the only reason
 * a token that used to verify would stop, so it has to be able to self-heal rather
 * than reject everyone until the TTL runs out.
 */
const JWK_TTL_MS = 15 * 60 * 1000;
// a burst of bad tokens can each ask for a refresh; honour one a minute, so they can't
// turn into a burst of Fence calls
const MIN_REFRESH_MS = 60 * 1000;

let cached: { key: KeyObject | CryptoKey; fetchedAt: number } | null = null;

export const invalidateVerificationKey = () => {
  if (cached && Date.now() - cached.fetchedAt < MIN_REFRESH_MS) return;
  cached = null;
};

export const getVerificationKey = async (): Promise<KeyObject | CryptoKey | null> => {
  if (cached && Date.now() - cached.fetchedAt < JWK_TTL_MS) {
    return cached.key;
  }
  try {
    const pem = await fetchJWTKey(process.env.NODE_ENV === "production");
    if (!pem) return null;
    const key = await importSPKI(pem, "RS256");
    cached = { key, fetchedAt: Date.now() };
    return key;
  } catch (error) {
    console.error(
      "[auth] Failed to fetch Fence JWT key:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};
