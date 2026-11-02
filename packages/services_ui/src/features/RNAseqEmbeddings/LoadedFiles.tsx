import React from "react";
import {ActionIcon, Stack, Text, Tooltip} from "@mantine/core";
import { formatDate } from "../../utils/date";
import type { InputFile } from "./core/types";
import { useMetadata } from "./core/MetadataContext";
import { useProcessing } from "./core/ProcessingContext";
import { Icon } from '@iconify-icon/react';

interface FileCardProps {
  file: InputFile;
}

const FileCard = ({ file }: FileCardProps) => {
  const { name, uploadedAt } = file;
  return (
    <div className="flex flex-col m-1 p-1">
      <div className="flex justify-start">
        {" "}
        <Text size="sm" fw={500}>
          {name}
        </Text>
      </div>
      <Text size="xs" fw={400}>{formatDate(uploadedAt)}</Text>
    </div>
  );
};

const LoadedFiles = () => {
  const { zipFileInfo, metadataFileInfo,  resetDataset } = useMetadata();
  const { isProcessing, resetProcessing } = useProcessing();

  const handleClear = () => {
    resetDataset();
    resetProcessing();
  };

  return (
    <Stack gap="xs" classNames={{root: "m-2 p-2"}}>
        <div className="flex justify-between items-center w-full">
             <Text fw={600} fs="lg" className="ml-2 uppercase tracking-wide">Loaded Files</Text>
            <Tooltip label="Clear files" position="bottom">
            <ActionIcon variant="outline" aria-label="Clear Files" onClick={handleClear} disabled={isProcessing} >
                <Icon icon="gen3:delete" size={16} />
            </ActionIcon>
            </Tooltip>
        </div>
      <div className="flex flex-col border-base-light border-1 rounded-sm gap-y-2">
        {zipFileInfo.type.includes("zip") &&
        metadataFileInfo.type.includes("csv") ||
        metadataFileInfo.type.includes("tsv") ? (
          <div className="flex flex-col border-base-light border-1 m-1">
            <FileCard file={zipFileInfo} />
            <FileCard file={metadataFileInfo} />
          </div>
        ) : (
          <div className="flex flex-col border-base-light border-1 m-1">
            <Text fs="md" fw={500}>
              No files loaded
            </Text>
          </div>
        )}
      </div>
    </Stack>
  );
};

export default LoadedFiles;
