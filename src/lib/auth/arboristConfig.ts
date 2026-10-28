/**
 * Frontend server side api to extract the frontend-protected resources
 */
import { GEN3_COMMONS_NAME } from '@gen3/core/server';
import { ContentSource, type AuthorizedRoutesConfig } from '@gen3/frontend/server';

let cachedConfig: AuthorizedRoutesConfig | null = null;

/**
 * Returns the route protection rules from <commons>/authz.json.
 *
 * The file is read at runtime from the configuration directory
 * (GEN3_FRONTEND_CONFIGURATION_ROOT, default ./config/), the same place the rest of the
 * app loads its configuration from, so a deployment can change the rules by mounting its
 * own config without rebuilding the image.
 *
 * There is deliberately no fallback to a copy bundled at build time: a missing or invalid
 * file fails the request instead of silently enforcing stale rules.
 */
export async function getRouteConfig(): Promise<AuthorizedRoutesConfig> {
  if (cachedConfig) return cachedConfig;

  let config: AuthorizedRoutesConfig;
  try {
    config = await ContentSource.getContentDatabase().get<AuthorizedRoutesConfig>(
      `${GEN3_COMMONS_NAME}/authz.json`,
    );
  } catch (e) {
    console.error(
      `Failed to load ${GEN3_COMMONS_NAME}/authz.json, ensure you have the authz.json file in your commons config directory`,
      e,
    );
    throw Error(`Failed to load ${GEN3_COMMONS_NAME}/authz.json`);
  }

  // cache in production only; in development re-read so edits are picked up
  if (process.env.NODE_ENV === 'production') {
    cachedConfig = config;
  }
  return config;
}
