import React from "react";
import { JupyterNotebookViewer } from "react-jupyter-notebook-viewer";

const NotebookViewer = (props) => {
  const notebook = new JupyterNotebookViewer(props);
  return <>{notebook}</>;
}

export default NotebookViewer;
