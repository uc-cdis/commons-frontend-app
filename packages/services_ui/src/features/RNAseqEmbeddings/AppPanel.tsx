import React from "react";
import { Group, Stack, Tabs } from "@mantine/core";
import LoadedFiles from "./LoadedFiles";
import DropZone from "./DropZone";
import { PiGraphLight } from "react-icons/pi";
import { VscServerProcess } from "react-icons/vsc";
import { ImTable } from "react-icons/im";
import MetadataPanel from "./MetadataPanel";
import ProcessAllPanel from "./ProcessAllPanel";
import VisPanel from "./VisualizationPanel";

const App = () => {
  return (
    <div className="flex nowrap w-full h-full">
      <div className="flex flex-col w-1/4 min-w-[300px]">
        <LoadedFiles />
        <DropZone />
      </div>
      <div className="flex flex-col w-3/4 h-full">
        <ProcessAllPanel />
        <Tabs>
          <Tabs.List>
            <Tabs.Tab value="metadata" leftSection={<ImTable size={12} />}>
              Metadata
            </Tabs.Tab>
            <Tabs.Tab value="results" leftSection={<PiGraphLight size={12} />}>
              Results
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="metadata">
            <MetadataPanel />
          </Tabs.Panel>
          <Tabs.Panel value="results" className="min-h-0">
            <VisPanel />
          </Tabs.Panel>
        </Tabs>
      </div>
    </div>
  );
};

export default App;
