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
      `Failed to load ../../../config/${GEN3_COMMONS_NAME}/authz.json, ensure you have the config/authz.json file in your commons config directory`,
      e,
    );
    throw Error(
      '`Failed to load ../../../config/${GEN3_COMMONS_NAME}/authz.json',
    );
  }
}
