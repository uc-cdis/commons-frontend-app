import React, {createContext, useCallback, useContext, useMemo, useState} from "react";
import type { InputFile } from "./types";

function createEmptyZipFile(name = "empty.zip"): File {
    const bytes = new Uint8Array(22);
    // End of central directory signature: PK\x05\x06
    bytes[0] = 0x50;
    bytes[1] = 0x4b;
    bytes[2] = 0x05;
    bytes[3] = 0x06;
    // Remaining 18 bytes stay zero (no disks, no entries, no comment)

    return new File([bytes], name, { type: "application/zip" });
}

interface Dataset {
    metadata: Record<string, any>[];
    zipFile: File;
    zipFileInfo: InputFile;
    metadataFileInfo: InputFile;
}

interface MetadataContextValue extends Dataset{
    /** true until a dataset has been loaded */
    isEmpty: boolean;
    setDataset: (dataset: Dataset) => void;
    resetDataset: () => void;
}

const UNSET_DATE = new Date(0).toUTCString(); // 1970-01-01T00:00:00.000Z

const DefaultFileInfo : InputFile = {
    name: "",
    type: "unset",
    uploadedAt: UNSET_DATE,
}

const EmptyDataset : Dataset = {
    metadata: [],
    zipFile: createEmptyZipFile(),
    zipFileInfo: DefaultFileInfo,
    metadataFileInfo: DefaultFileInfo,
}

const isEmptyDataset = (dataset: Dataset): boolean => dataset === EmptyDataset;

const MetadataContext = createContext<MetadataContextValue | undefined>(undefined);

export const MetadataProvider = ({
    children,
    initialDataset = null,
}: {
    children: React.ReactNode;
    initialDataset?: Dataset | null;
}) => {
    // metadata and zip are always set together, so they live in one state value
    const [dataset, setDataset] = useState<Dataset>(initialDataset ?? EmptyDataset);
    const resetDataset = useCallback(() => setDataset(EmptyDataset), []);
    const value = useMemo<MetadataContextValue>(
        () => ({ ...dataset, isEmpty: isEmptyDataset(dataset), setDataset, resetDataset }),
        [dataset, resetDataset],
    );
    return <MetadataContext.Provider value={value}>{children}</MetadataContext.Provider>;
};

export const useMetadata = (): MetadataContextValue => {
    const context = useContext(MetadataContext);
    if (!context) {
        throw new Error("useMetadata must be used within a MetadataProvider");
    }
    return context;
};

export default MetadataContext;
