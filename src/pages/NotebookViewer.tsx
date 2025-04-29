import React from "react";
import dynamic from "next/dynamic";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const NotebookViewer = dynamic(() => import("../components/NotebookViewer"), {
  ssr: false
});

const DARK_MODE = true;

export default function IndexPage() {
  return (
    <NotebookViewer
      filePath="/Example.ipynb" // Or a raw JSON notebook file location online
      notebookInputLanguage="python"
      showInputLineNumbers={false}
      showOutputLineNumbers={true}
      className="bg-base-lightest"
      // notebookOutputLanguage="python"
      inputCodeDarkTheme={DARK_MODE}
      outputDarkTheme={DARK_MODE}
      inputMarkdownDarkTheme={DARK_MODE}
      outputTextClassName="text-base-contrast"
      inputTextClassName="text-base-contrast"
      outputBlockClassName="bg-primary-lighter"
      outputImageClassName="output-image"
      outputOuterClassName="output-outer"
      inputOuterClassName="input-outer"
      outputBorderClassName="border-primary"
      inputBorderClassName="input-border"
      outputTableClassName="output-table"
      withOnClick={true}
      inputMarkdownBlockClassName="input-markdown-block"
      inputCodeBlockClassName="input-code-block"
      hideCodeBlocks={false}
      hideMarkdownBlocks={false}
      hideAllOutputs={false}
      hideAllInputs={false}
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    />
  );
}
