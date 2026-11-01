
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
    MAPPING,
    READY,
    UNINITIALIZED,
}
