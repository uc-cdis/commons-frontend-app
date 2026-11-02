import React from "react";
import AppPanel from "./AppPanel";
import { MetadataProvider } from "./core/MetadataContext";
import { VisualizationProvider } from "./core/VisualizationContext";
import { ProcessingProvider } from "./core/ProcessingContext";

interface AppProps {
  /** process the files as soon as they are loaded, hiding the Process All button */
  autoRun?: boolean;
}

const App = ({ autoRun = true }: AppProps) => {
  return (
    <MetadataProvider>
      <VisualizationProvider>
        <ProcessingProvider autoRun={autoRun}>
          <AppPanel />
        </ProcessingProvider>
      </VisualizationProvider>
    </MetadataProvider>
  );
};

export default App;
