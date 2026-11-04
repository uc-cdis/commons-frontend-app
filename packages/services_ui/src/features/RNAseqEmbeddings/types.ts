
export interface RNASeqConfiguration {
    label?: string;
    /** link to a shared folder (e.g. Box) with demo .zip and .csv files; no link is shown when unset */
    demoFilesUrl?: string;
}

export interface PlotPoint {
    umap_x: number;
    umap_y: number;
    group: string;
    metadata: Record<string, any>;
}
