
export interface InputFile {
    name: string;
    type: string;
    uploadedAt: string;
}

export interface ProcessContext {
    signal: AbortSignal;
    onProgress: (percent: number, label: string) => void;
    onDone: () => void;
    onFile: (file: File) => void;
}

// Function type to process a zip file
export type ProcessZip = (file: File, ctx: ProcessContext) => Promise<void>;

export enum ProcessingStep {
    IDLE,
    INFERENCE,
    NEIGHBORHOOD,
    EXTRACT_ALL ,
    MAPPING,
    READY,
    UNINITIALIZED,
}

export interface EmbeddingRecord {
    vector: number[];
    input_index: string | null,
    embedding_id: string,
    info: {
        metadata: Record<string, any>,
        self: string,
        authz: string,
        collection_id: string,
    };
}

export interface GroundEmbeddings {
    vectors: Float32Array[];
    metadata: Record<string, any>[];
}

export interface StoredEmbedding {
    vector: number[];
    info: { metadata: Record<string, any> };
}
