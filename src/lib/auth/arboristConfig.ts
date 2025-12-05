/**
 * Frontend server side api to extract the frontend-protected resources
 */
import { GEN3_COMMONS_NAME } from '@gen3/core/server';
import { AuthorizedRoutesConfig } from '@gen3/frontend/server';

let cachedConfig: AuthorizedRoutesConfig | null = null;

export async function getRouteConfig(): Promise<AuthorizedRoutesConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    const mod = await import(`../../../config/${GEN3_COMMONS_NAME}/authz.json`);
    cachedConfig = mod.default || mod; // Handle ESM default export compatibility
    return cachedConfig as AuthorizedRoutesConfig;
  } catch (e) {
    console.error(
      `Failed to load ../../../config/${GEN3_COMMONS_NAME}/authz.json, falling back to ./config/authz_default.json:`,
      e,
    );
  }

  try {
    const mod = await import(`../../../config/authz_default.json`);
    cachedConfig = mod.default || mod;
    return cachedConfig as AuthorizedRoutesConfig;
  } catch (e) {
    console.error(`Failed to load config/authz_default.json`, e);
  }

  return {
    routes: {},
  };
}
