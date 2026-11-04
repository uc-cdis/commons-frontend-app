import React from "react";
import AppPanel from "./AppPanel";
import { MetadataProvider } from "./core/MetadataContext";
import { VisualizationProvider } from "./core/VisualizationContext";
import { ProcessingProvider } from "./core/ProcessingContext";

interface AppProps {
  /** process the files as soon as they are loaded, hiding the Process All button */
  autoRun?: boolean;
  /** link to a shared folder with demo .zip and .csv files */
  demoFilesUrl?: string;
}

const App = ({ autoRun = true, demoFilesUrl }: AppProps) => {
  return (
    <MetadataProvider>
      <VisualizationProvider>
        <ProcessingProvider autoRun={autoRun}>
          <AppPanel demoFilesUrl={demoFilesUrl} />
        </ProcessingProvider>
      </VisualizationProvider>
    </MetadataProvider>
  );
};

export default App;
