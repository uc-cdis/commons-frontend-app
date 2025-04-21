import React from "react";
import dynamic from "next/dynamic";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const NotebookViewer = dynamic(() => import("../components/NotebookViewer"), {
  ssr: false
});

export default function IndexPage() {
  return (
    <NotebookViewer
      filePath="/Example.ipynb" // Or a raw JSON notebook file location online
      notebookInputLanguage="python"
      showInputLineNumbers={true}
      showOutputLineNumbers={false}
      withOnClick={true}
      hideCodeBlocks={false}
      hideMarkdownBlocks={false}
      hideAllOutputs={false}
      hideAllInputs={false}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    />
  );
}
