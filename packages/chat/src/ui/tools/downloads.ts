import { isAgentDownloadLink, type DownloadKind } from "../../core/downloadLinks";
import { isRecord, parseJson } from "./json";

// false: the agent's answer links every file under its result, so the cards don't repeat them.
// true brings back the filter and manifest cards and the survival card's buttons
export const CARD_DOWNLOADS = false;

export interface ToolDownload {
  kind: DownloadKind;
  /** /download/<kind>/<handle>, as the agent wrote it */
  url: string;
  /** survival curves also come as CSV */
  csvUrl?: string;
}

// each tool's file sits in one known field of its result (gdc_mcp/tools/*.py)
const LINK_FIELD: Record<DownloadKind, string> = {
  survival: "full_curve", // get_survival_data
  manifest: "manifest", // get_file_manifest
  filter: "filter", // create_filter
};

export function findDownload(result: string | null, kind: DownloadKind): ToolDownload | undefined {
  const parsed = result ? parseJson(result) : undefined;
  const link = isRecord(parsed) ? parsed[LINK_FIELD[kind]] : undefined;
  if (!isRecord(link)) return undefined;

  // only the portal's own links, of the field's own kind, so a result can't point anywhere else
  const url = link.download_url;
  if (typeof url !== "string" || !isAgentDownloadLink(url)) return undefined;
  if (!url.startsWith(`/download/${kind}/`)) return undefined;

  const download: ToolDownload = { kind, url };
  // the portal serves JSON for any format but csv, so only the agent's exact csv link counts
  if (link.download_url_csv === `${url}?format=csv`) download.csvUrl = link.download_url_csv;
  return download;
}
