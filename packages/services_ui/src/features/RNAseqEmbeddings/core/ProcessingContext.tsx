import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMetadata } from "./MetadataContext";
import { useVisualization } from "./VisualizationContext";
import type { EmbeddingResult } from "../processing/embedZipFiles";
import { ProcessingStep } from "./types";
import { debugError, debugLog } from "../../../utils/debugLog";
import type { GroundEmbeddings } from "../core/types";
import { extractAllEmbeddings } from "../processing/extractAllEmbeddings";
import { runEmbeddingsStep, runSearchNeighborsStep, runUmapGroundStep } from "../processing/processSteps";

interface ProcessingValue {
    isProcessing: boolean;
    isProcessingError: boolean;
    /** 0 - 100 */
    progress: number;
    results: EmbeddingResult[];
    /** the input embeddings of the loaded files, null until the inference step has run */
    input: GroundEmbeddings | null;
    /** every stored TCGA embedding with its metadata, null until the extract step has run */
    ground: GroundEmbeddings | null;
    /** the step currently running, READY once every requested step has completed */
    processingState: ProcessingStep;
    /** true when processAll starts by itself as soon as a dataset is loaded */
    autoRun: boolean;
}

interface ProcessingContextValue extends ProcessingValue {
    generateEmbeddings: () => Promise<void>;
    generateUmap: () => Promise<void>;
    /** downloads every stored TCGA embedding into `ground` */
    extractAll: () => Promise<void>;
    /** finds the vector store neighbors of the embeddings from the last generateEmbeddings */
    searchNeighbors: () => Promise<void>;
    /** generateEmbeddings, extractAll, generateUmap, then searchNeighbors, stopping at the first step that fails */
    processAll: () => Promise<void>;
    /** clears results, progress, errors and the plot, returning to IDLE */
    resetProcessing: () => void;
}

const ProcessingContext = createContext<ProcessingContextValue | undefined>(undefined);

/**
 * The input embeddings as a matrix, like np.asarray([r["embedding"] for r in results], dtype=np.float32).
 * Results without an `embedding` array are skipped; `metadata[i]` is the response without the vector, plus the file name.
 */
const toInput = (results: EmbeddingResult[], inputMetadata: Record<string, any>[]): GroundEmbeddings => {
    // the metadata row of each file, found by its file_name column
    const rowByFileName = new Map(inputMetadata.map((row) => [String(row.file_name), row]));
    const embedded = results.filter((r) => Array.isArray(r.result?.embedding));
    return {
        vectors: embedded.map((r) => Float32Array.from(r.result.embedding as number[])),
        metadata: embedded.map(({ fileName, result: { embedding: _vector, ...rest } }) => ({
            fileName,
            ...rest,
            ...rowByFileName.get(fileName),
        })),
    };
};

/**
 * Owns the embedding and UMAP processing so any panel can start a run or show its progress.
 * With `autoRun`, processAll starts whenever a new dataset is loaded.
 * Must be rendered inside MetadataProvider and VisualizationProvider.
 */
export const ProcessingProvider = ({
    children,
    autoRun = false,
}: {
    children: React.ReactNode;
    autoRun?: boolean;
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProcessingError, setIsProcessingError] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<EmbeddingResult[]>([]);
    const [input, setInput] = useState<GroundEmbeddings | null>(null);
    const [ground, setGround] = useState<GroundEmbeddings | null>(null);
    const [processingState, setProcessingState] = useState<ProcessingStep>(ProcessingStep.IDLE);

    const { zipFile, isEmpty, metadata: fileMetadata } = useMetadata();
    const { setPlotData, setNeighbors } = useVisualization();


    // processAll runs the steps from one closure, so the search step reads the embeddings from here, not from `results`
    const latestEmbeddings = useRef<EmbeddingResult[]>([]);
    // same reason for the UMAP step, which needs both `input` and `ground` from earlier steps
    const latestInput = useRef<GroundEmbeddings | null>(null);
    const latestGround = useRef<GroundEmbeddings | null>(null);

    // the steps throw on failure; the public actions below own the processing state
    const embeddingsStep = useCallback(async () => {
        setProcessingState(ProcessingStep.INFERENCE);
        setProgress(0);
        const started = Date.now();
        debugLog('processing', 'inference step started', { zip: zipFile.name, bytes: zipFile.size });
        const embeddings = await runEmbeddingsStep(zipFile, setProgress);
        debugLog('processing', 'inference step finished', { results: embeddings.length, ms: Date.now() - started });
        latestEmbeddings.current = embeddings;
        setResults(embeddings);
        const inputEmbeddings = toInput(embeddings, fileMetadata);
        latestInput.current = inputEmbeddings;
        setInput(inputEmbeddings);
        setProgress(100);
    }, [zipFile, fileMetadata]);

    const umapStep = useCallback(async () => {
        setProcessingState(ProcessingStep.MAPPING);
        setProgress(0);
        const started = Date.now();
        debugLog('processing', 'mapping step started');
        const tcgaEmbeddings = latestGround.current;
        const inputEmbeddings = latestInput.current;
        if (!tcgaEmbeddings || !inputEmbeddings) {
            throw new Error('the mapping step needs the input and TCGA embeddings; run the inference and extract steps first');
        }
        const plotData = await runUmapGroundStep(tcgaEmbeddings, inputEmbeddings, setProgress);
        debugLog('processing', 'umap finished', { tcga: plotData.tcga.length, input: plotData.input.length, ms: Date.now() - started });
        setPlotData(plotData);
        setProgress(100);
    }, [setPlotData]);

    const extractAllStep = useCallback(async () => {
        setProcessingState(ProcessingStep.EXTRACT_ALL);
        setProgress(0);
        const started = Date.now();
        debugLog('processing', 'extract all step started');
        const extracted = await extractAllEmbeddings(setProgress);
        debugLog('processing', 'extract all step finished', { rows: extracted.vectors.length, ms: Date.now() - started });
        latestGround.current = extracted;
        setGround(extracted);
        setProgress(100);
    }, []);

    const searchInputEmbeddingsStep = useCallback(async () => {
        setProcessingState(ProcessingStep.NEIGHBORHOOD);
        setProgress(0);
        const started = Date.now();
        const { vectors, metadata } = toInput(latestEmbeddings.current, fileMetadata);
        debugLog('processing', 'neighborhood step started', { samples: vectors.length });
        const neighbors = await runSearchNeighborsStep(vectors, metadata, setProgress);
        debugLog('processing', 'neighborhood step finished', { rows: neighbors.length, ms: Date.now() - started });
        setNeighbors(neighbors);
        setProgress(100);
    }, [setNeighbors, fileMetadata]);

    const runSteps = useCallback(async (steps: (() => Promise<void>)[]) => {
        setIsProcessing(true);
        setIsProcessingError(false);
        try {
            for (const step of steps) await step();
            setProcessingState(ProcessingStep.READY);
        } catch (error) {
            debugError('processing', 'run failed', error);
            console.error(error);
            setIsProcessingError(true);
            setProcessingState(ProcessingStep.IDLE);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const generateEmbeddings = useCallback(() => runSteps([embeddingsStep]), [runSteps, embeddingsStep]);
    const generateUmap = useCallback(() => runSteps([umapStep]), [runSteps, umapStep]);
    const extractAll = useCallback(() => runSteps([extractAllStep]), [runSteps, extractAllStep]);
    const searchNeighbors = useCallback(() => runSteps([searchInputEmbeddingsStep]), [runSteps, searchInputEmbeddingsStep]);
    // a failed embeddings step stops the run, so the UMAP step never starts
    const processAll = useCallback(
        () => runSteps([embeddingsStep, searchInputEmbeddingsStep, extractAllStep, umapStep]),
        [runSteps, embeddingsStep, searchInputEmbeddingsStep, extractAllStep, umapStep ],
    );

    // the dataset already auto-processed, so StrictMode's repeated effects and re-renders don't start a second run
    const autoRunFile = useRef<File | null>(null);
    useEffect(() => {
        if (!autoRun || isEmpty || autoRunFile.current === zipFile) return;
        autoRunFile.current = zipFile;
        debugLog('processing', 'auto run starting', { zip: zipFile.name });
        void processAll();
    }, [autoRun, isEmpty, zipFile, processAll, input, ground]);

    const resetProcessing = useCallback(() => {
        latestEmbeddings.current = [];
        setResults([]);
        latestGround.current = null;
        setGround(null);
        setProgress(0);
        setIsProcessingError(false);
        setProcessingState(ProcessingStep.IDLE);
        setPlotData(null);
        setNeighbors(null);
        latestInput.current = null;
        setInput(null);
    }, [setPlotData, setNeighbors]);

    const value = useMemo<ProcessingContextValue>(
        () => ({
            isProcessing,
            isProcessingError,
            progress,
            results,
            input,
            ground,
            processingState,
            autoRun,
            generateEmbeddings,
            generateUmap,
            extractAll,
            searchNeighbors,
            processAll,
            resetProcessing,
        }),
        [isProcessing, isProcessingError, progress, results, ground, input, processingState, autoRun, generateEmbeddings, generateUmap, extractAll, searchNeighbors, processAll, resetProcessing],
    );

    return <ProcessingContext.Provider value={value}>{children}</ProcessingContext.Provider>;
};

export const useProcessing = (): ProcessingContextValue => {
    const context = useContext(ProcessingContext);
    if (!context) {
        throw new Error("useProcessing must be used within a ProcessingProvider");
    }
    return context;
};

export default ProcessingContext;
