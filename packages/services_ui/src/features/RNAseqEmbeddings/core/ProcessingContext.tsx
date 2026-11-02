import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useMetadata } from "./MetadataContext";
import { useVisualization } from "./VisualizationContext";
import type { EmbeddingResult } from "../processing/embedZipFiles";
import { ProcessingStep } from "./types";
import { runEmbeddingsStep, runNeighborsStep, runUmapStep } from "../processing/processSteps";

interface ProcessingValue {
    isProcessing: boolean;
    isProcessingError: boolean;
    /** 0 - 100 */
    progress: number;
    results: EmbeddingResult[];
    /** the step currently running, READY once every requested step has completed */
    processingState: ProcessingStep;
    /** true when processAll starts by itself as soon as a dataset is loaded */
    autoRun: boolean;
}

interface ProcessingContextValue extends ProcessingValue {
    generateEmbeddings: () => Promise<void>;
    generateUmap: () => Promise<void>;
    /** generateEmbeddings followed by generateUmap, stopping if the first step fails */
    processAll: () => Promise<void>;
    /** clears results, progress, errors and the plot, returning to IDLE */
    resetProcessing: () => void;
}

const ProcessingContext = createContext<ProcessingContextValue | undefined>(undefined);

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
    const [processingState, setProcessingState] = useState<ProcessingStep>(ProcessingStep.IDLE);

    const { zipFile, isEmpty } = useMetadata();
    const { setPlotData, setNeighbors } = useVisualization();

    // the steps throw on failure; the public actions below own the processing state
    const embeddingsStep = useCallback(async () => {
        setProcessingState(ProcessingStep.INFERENCE);
        setProgress(0);
        setResults(await runEmbeddingsStep(zipFile, setProgress));
        setProgress(100);
    }, [zipFile]);

    const umapStep = useCallback(async () => {
        setProcessingState(ProcessingStep.MAPPING);
        setProgress(0);
        setPlotData(await runUmapStep(setProgress));
        setNeighbors(runNeighborsStep());
        setProgress(100);
    }, [setPlotData, setNeighbors]);

    const runSteps = useCallback(async (steps: (() => Promise<void>)[]) => {
        setIsProcessing(true);
        setIsProcessingError(false);
        try {
            for (const step of steps) await step();
            setProcessingState(ProcessingStep.READY);
        } catch (error) {
            console.error(error);
            setIsProcessingError(true);
            setProcessingState(ProcessingStep.IDLE);
        } finally {
            setIsProcessing(false);
        }
    }, []);

    const generateEmbeddings = useCallback(() => runSteps([embeddingsStep]), [runSteps, embeddingsStep]);
    const generateUmap = useCallback(() => runSteps([umapStep]), [runSteps, umapStep]);
    // a failed embeddings step stops the run, so the UMAP step never starts
    const processAll = useCallback(
        () => runSteps([embeddingsStep, umapStep]),
        [runSteps, embeddingsStep, umapStep],
    );

    // the dataset already auto-processed, so StrictMode's repeated effects and re-renders don't start a second run
    const autoRunFile = useRef<File | null>(null);
    useEffect(() => {
        if (!autoRun || isEmpty || autoRunFile.current === zipFile) return;
        autoRunFile.current = zipFile;
        void processAll();
    }, [autoRun, isEmpty, zipFile, processAll]);

    const resetProcessing = useCallback(() => {
        setResults([]);
        setProgress(0);
        setIsProcessingError(false);
        setProcessingState(ProcessingStep.IDLE);
        setPlotData(null);
        setNeighbors(null);
    }, [setPlotData, setNeighbors]);

    const value = useMemo<ProcessingContextValue>(
        () => ({
            isProcessing,
            isProcessingError,
            progress,
            results,
            processingState,
            autoRun,
            generateEmbeddings,
            generateUmap,
            processAll,
            resetProcessing,
        }),
        [isProcessing, isProcessingError, progress, results, processingState, autoRun, generateEmbeddings, generateUmap, processAll, resetProcessing],
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
