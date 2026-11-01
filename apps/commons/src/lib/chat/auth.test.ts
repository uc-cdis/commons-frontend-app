import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SignJWT, exportSPKI, generateKeyPair } from "jose";

// stands in for Fence's /jwt/keys; each test says which public key it serves
const fetchJWTKey = vi.fn<() => Promise<string>>();
vi.mock("@gen3/frontend/server", () => ({ fetchJWTKey }));

type Keys = Awaited<ReturnType<typeof generateKeyPair>>;
const sign = (keys: Keys, expiresIn = "1h") =>
  new SignJWT({ sub: "42" })
    .setProtectedHeader({ alg: "RS256" })
    .setExpirationTime(expiresIn)
    .sign(keys.privateKey);

let oldKeys: Keys;
let newKeys: Keys;
let authenticate: (cookie?: string) => Promise<string | null>;

beforeEach(async () => {
  oldKeys = await generateKeyPair("RS256", { extractable: true });
  newKeys = await generateKeyPair("RS256", { extractable: true });
  fetchJWTKey.mockReset();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
  vi.spyOn(console, "error").mockImplementation(() => {});
  // a fresh module each test, so the cached key starts empty
  vi.resetModules();
  ({ authenticateChatRequest: authenticate } = await import("./auth"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("authenticateChatRequest", () => {
  it("returns the token when Fence signed it", async () => {
    fetchJWTKey.mockResolvedValue(await exportSPKI(oldKeys.publicKey));
    const token = await sign(oldKeys);
    expect(await authenticate(`access_token=${token}`)).toBe(token);
  });

  it("refuses without a cookie, and never asks Fence", async () => {
    expect(await authenticate(undefined)).toBeNull();
    expect(fetchJWTKey).not.toHaveBeenCalled();
  });

  it("recovers when Fence rotates its key, instead of refusing everyone", async () => {
    fetchJWTKey.mockResolvedValue(await exportSPKI(oldKeys.publicKey));
    await authenticate(`access_token=${await sign(oldKeys)}`); // caches the old key

    // Fence rotates; tokens are now signed with the new key
    fetchJWTKey.mockResolvedValue(await exportSPKI(newKeys.publicKey));
    vi.setSystemTime(new Date("2026-10-27T12:05:00Z"));
    const token = await sign(newKeys);

    expect(await authenticate(`access_token=${token}`)).toBe(token);
    expect(fetchJWTKey).toHaveBeenCalledTimes(2);
  });

  it("does not refetch the key for an expired token", async () => {
    fetchJWTKey.mockResolvedValue(await exportSPKI(oldKeys.publicKey));
    await authenticate(`access_token=${await sign(oldKeys)}`); // caches the key
    // past the once-a-minute limit, so only the expiry rule can stop a refetch here
    vi.setSystemTime(new Date("2026-10-27T12:05:00Z"));
    const expired = await sign(oldKeys, "-1m");
    expect(await authenticate(`access_token=${expired}`)).toBeNull();
    expect(fetchJWTKey).toHaveBeenCalledTimes(1);
  });

  it("asks Fence at most once a minute, however many bad tokens arrive", async () => {
    fetchJWTKey.mockResolvedValue(await exportSPKI(oldKeys.publicKey));
    const forged = await sign(newKeys); // a signature Fence's key won't match
    for (let i = 0; i < 5; i++) {
      expect(await authenticate(`access_token=${forged}`)).toBeNull();
    }
    expect(fetchJWTKey).toHaveBeenCalledTimes(1);
  });
});
