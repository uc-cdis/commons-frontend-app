import { agentDownloadKind } from "../../core/downloadLinks";

// the parts of a hast node (what react-markdown hands its components) read here
export interface MarkdownNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: MarkdownNode[];
  position?: { start: { offset?: number } };
}

export type Paragraph =
  | { kind: "download" | "download-link"; href: string; label: string }
  | { kind: "headline" }
  | { kind: "text" };

const textOf = (node: MarkdownNode): string =>
  node.type === "text" ? (node.value ?? "") : (node.children ?? []).map(textOf).join("");

/** The new agent writes each download link as its own paragraph and the answer's first line in bold. */
export function readParagraph(node: MarkdownNode | undefined): Paragraph {
  const [only, ...rest] = (node?.children ?? []).filter(
    (child) => !(child.type === "text" && !child.value?.trim()),
  );
  if (!only || rest.length > 0 || only.type !== "element") return { kind: "text" };

  const href = only.properties?.href;
  if (only.tagName === "a" && typeof href === "string") {
    const file = agentDownloadKind(href);
    const label = textOf(only).trim();
    // one case list per count: links, so the main files' buttons still stand out
    if (file) return { kind: file === "case-set" ? "download-link" : "download", href, label };
  }
  if (only.tagName === "strong" && node?.position?.start.offset === 0) return { kind: "headline" };
  return { kind: "text" };
}
