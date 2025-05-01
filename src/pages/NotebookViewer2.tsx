import React from "react";
import dynamic from "next/dynamic";

const NotebookViewer = dynamic(() => import("../components/NotebookViewer2"), {
  ssr: false
});

export default function IndexPage() {
  return (
    <NotebookViewer
      filePath="primary_analyses.ipynb"
    />
  );
}
