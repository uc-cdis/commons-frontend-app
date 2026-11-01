"use client";

import { memo } from "react";
import ReactMarkdown, { type Components, type Options } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Typography } from "@mantine/core";
import { isAgentDownloadLink } from "../../core/downloadLinks";
import { DownloadButton } from "../tools/DownloadButton";
import { readParagraph } from "./markdownParagraph";
import { normalizeMath } from "./normalizeMath";

const components: Components = {
  table: ({ children }) => (
    <div className="chat-table" style={{ overflowX: "auto", maxWidth: "100%" }}>
      <table>{children}</table>
    </div>
  ),
  p: ({ node, children, ...props }) => {
    const paragraph = readParagraph(node);
    if (paragraph.kind === "download")
      return (
        <p {...props} className="chat-download-row">
          <DownloadButton href={paragraph.href} label={paragraph.label} />
        </p>
      );
    return (
      <p {...props} className={paragraph.kind === "headline" ? "chat-headline" : undefined}>
        {children}
      </p>
    );
  },
  a: ({ node: _node, children, ...props }) => {
    // `download` saves in place, so an expired link can't navigate away from the chat
    if (props.href && isAgentDownloadLink(props.href))
      return (
        <a {...props} download>
          {children}
        </a>
      );
    // links within the answer (footnotes) stay put
    if (props.href?.startsWith("#")) return <a {...props}>{children}</a>;
    // anything else opens a new tab, so the chat stays
    return (
      <a {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
};
const remarkPlugins: Options["remarkPlugins"] = [remarkGfm, remarkMath];
const rehypePlugins: Options["rehypePlugins"] = [[rehypeKatex, { output: "mathml" }]];

// memo: skip redraws when the text hasn't changed, so older messages don't
// re-parse their markdown every time a new word streams in
export const MarkdownContent = memo(function MarkdownContent({
  content,
  fz = "md",
}: {
  content: string;
  /** "xs" for agent steps; answers are "md" */
  fz?: "xs" | "md";
}) {
  return (
    <Typography fz={fz} className="chat-markdown">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={components}
      >
        {normalizeMath(content)}
      </ReactMarkdown>
    </Typography>
  );
});
