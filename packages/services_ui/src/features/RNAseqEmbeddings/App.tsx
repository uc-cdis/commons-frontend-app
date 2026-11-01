import React from "react";
import AppPanel from "./AppPanel";
import { MetadataProvider } from "./core/MetadataContext";
import { VisualizationProvider } from "./core/VisualizationContext";
import { ProcessingProvider } from "./core/ProcessingContext";

const App = () => {
  return (
    <MetadataProvider>
      <VisualizationProvider>
        <ProcessingProvider>
          <AppPanel />
        </ProcessingProvider>
      </VisualizationProvider>
    </MetadataProvider>
  );
};

export default App;
