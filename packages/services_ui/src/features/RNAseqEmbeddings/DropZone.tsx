import { useState } from "react";
import { Alert, Group, Text } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { FileArchive, Upload, X } from "lucide-react";
import "@mantine/dropzone/styles.css";
import { useMetadata } from "./core/MetadataContext";
import { MAX_ZIP_BYTES } from "../../core/constants";
import { loadCsv, loadTsv } from "./loadCsv";

// extensions are listed too because browsers often report no MIME type for .tsv or .csv
const FILE_TYPES = {
  [MIME_TYPES.zip]: [".zip"],
  "application/x-zip-compressed": [".zip"],
  "text/tab-separated-values": [".tsv"],
  "text/tsv": [".tsv"],
  "text/csv": [".csv"],
};

const formatGb = (bytes: number) =>
  `${parseFloat((bytes / 1024 ** 3).toFixed(1))} GB`;

// function to see if both a zipfile and .csv or .tsv file in the dropzone
const hasValidFiles = (files: File[]) => {
  const zipFile = files.find((file) =>
    file.name.toLowerCase().endsWith(".zip"),
  );
  const csvOrTsvFile = files.find((file) => {
    if (!file) return false;
    const ext = file.name?.split(".").pop();
    if (!ext) return false;

    return (
      FILE_TYPES["text/csv"].includes(`.${ext}`) ||
      FILE_TYPES["text/tsv"].includes(`.${ext}`)
    );
  });
  return zipFile && csvOrTsvFile;
};

const DropZone = () => {
  const [rejection, setRejection] = useState<string | null>(null);
  const { setDataset } = useMetadata();

  const loadMetadata = async (files: File[]) => {
    const tableFile = files.find((file) => /\.(csv|tsv)$/i.test(file.name));
    const zipFile = files.find((file) =>
      file.name.toLowerCase().endsWith(".zip"),
    );
    if (!tableFile || !zipFile) return;
    try {
      const ts = new Date().toISOString();
      const load = tableFile.name.toLowerCase().endsWith(".tsv")
        ? loadTsv
        : loadCsv;
      setDataset({
        metadata: await load(tableFile),
        zipFile,
        zipFileInfo: { name: zipFile.name, type: zipFile.type, uploadedAt: ts },
        metadataFileInfo: {
          name: tableFile.name,
          type: tableFile.type,
          uploadedAt: ts,
        },
      });
    } catch (error) {
      setRejection(
        error instanceof Error
          ? error.message
          : "Could not read the metadata file.",
      );
    }
  };

  return (
    <div className="m-2 p-2">
      <Dropzone
        onDrop={(files) => {
          const oversizedZip = files.find(
            (file) =>
              file.name.toLowerCase().endsWith(".zip") &&
              file.size > MAX_ZIP_BYTES,
          );
          if (oversizedZip) {
            setRejection(
              `${oversizedZip.name} is ${formatGb(oversizedZip.size)}. Zip archives must be ${formatGb(MAX_ZIP_BYTES)} or smaller.`,
            );
          } else if (hasValidFiles(files)) {
            setRejection(null);
            void loadMetadata(files);
          } else {
            setRejection(
              "That file isn’t supported. Choose a .zip archive, .tsv or .csv file.",
            );
          }
        }}
        onReject={() =>
          setRejection(
            "That file isn’t supported. Choose a .zip archive, .tsv or .csv file.",
          )
        }
        accept={FILE_TYPES}
        multiple={true}
        radius="md"
      >
        <Group
          justify="center"
          gap="md"
          mih={110}
          style={{ pointerEvents: "none" }}
        >
          <Dropzone.Accept>
            <Upload size={32} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <X size={32} />
          </Dropzone.Reject>
          <Dropzone.Idle>
            <FileArchive size={32} />
          </Dropzone.Idle>
          <div>
            <Text fw={500}>
              Drop a .zip, .tsv or .csv file here, or click to browse
            </Text>
            <Text size="sm" c="dimmed">
              One .zip archive and metadata .tsv or .csv file
            </Text>
          </div>
        </Group>
      </Dropzone>
      {rejection && (
        <Alert color="red" mt="sm" role="alert">
          {rejection}
        </Alert>
      )}
    </div>
  );
};

export default DropZone;
