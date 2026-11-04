import React from "react";
import { Button, Text, Tabs } from "@mantine/core";
import { Download } from "lucide-react";
import LoadedFiles from "./LoadedFiles";
import DropZone from "./DropZone";
import { PiGraphLight } from "react-icons/pi";
import { ImTable } from "react-icons/im";
import MetadataPanel from "./MetadataPanel";
import ProcessAllPanel from "./ProcessAllPanel";
import VisPanel from "./VisualizationPanel";
import EmbeddingsSummaryPanel from "./EmbeddingsSummaryPanel";
import { Icon } from "@iconify-icon/react";

interface AppPanelProps {
  /** link to a shared folder with demo .zip and .csv files; hidden when unset */
  demoFilesUrl?: string;
}

const App = ({ demoFilesUrl }: AppPanelProps) => {
  return (
    <div className="flex nowrap w-full h-full">
      <div className="flex flex-col w-1/4 min-w-[300px]">
        <LoadedFiles />
        <DropZone />
        {demoFilesUrl && (
          <div className="flex flex-col gap-1 mx-4">
            <Text size="sm" c="dimmed">
              No files to try?
            </Text>
            <Button
              component="a"
              href={demoFilesUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="light"
              size="compact-sm"
              fullWidth
              leftSection={<Download size={14} />}
            >
              Download demo .zip and .csv files
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col w-3/4 h-full">
        <ProcessAllPanel />
        <Tabs defaultValue="results">
          <Tabs.List>
            <Tabs.Tab value="metadata" leftSection={<ImTable size={12} />}>
              Input Metadata
            </Tabs.Tab>
            <Tabs.Tab value="results" leftSection={<PiGraphLight size={12} />}>
              Visualize Results
            </Tabs.Tab>
            <Tabs.Tab value="embeddingsSummary" leftSection={<Icon icon="gen3:metric-outline" size={12} />}>
              Embedding Summary
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="metadata">
            <MetadataPanel />
          </Tabs.Panel>
          <Tabs.Panel value="results" className="min-h-0">
            <VisPanel />
          </Tabs.Panel>
          <Tabs.Panel value="embeddingsSummary" className="min-h-0">
            <EmbeddingsSummaryPanel />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default App;
