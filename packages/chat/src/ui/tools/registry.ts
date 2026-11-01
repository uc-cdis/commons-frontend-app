import type { ToolRenderer } from "./types";
import { CARD_DOWNLOADS } from "./downloads";
import { FilterToolResult } from "./filter/FilterToolResult";
import { ManifestToolResult } from "./manifest/ManifestToolResult";
import { SurvivalToolResult } from "./survival/SurvivalToolResult";

export function cardRenderers(cardDownloads: boolean): Record<string, ToolRenderer | undefined> {
  return {
    get_survival_data: SurvivalToolResult,
    ...(cardDownloads && {
      create_filter: FilterToolResult,
      get_file_manifest: ManifestToolResult,
    }),
  };
}

/** Tools whose result gets its own card under the tool call, keyed by tool name. */
export const toolRenderers = cardRenderers(CARD_DOWNLOADS);

export const hasToolCard = (name: string): boolean => toolRenderers[name] !== undefined;
