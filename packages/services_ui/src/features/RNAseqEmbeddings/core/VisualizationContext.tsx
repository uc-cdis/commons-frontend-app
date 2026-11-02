import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { UmapComparison} from "../processing/umapEmbeddings";
import type { NeighborRow } from "../processing/nearestNeighbors";
import type { MetadataFilter } from "../processing/filterPlotData";
import { EMPTY_FILTER } from "../processing/filterPlotData";


interface VisualizationValue {
    plotData: UmapComparison | null;
    metadataFilter: MetadataFilter;
    /** nearest TCGA neighbor of each input sample */
    neighbors: NeighborRow[] | null;
}

interface VisualizationContextValue extends VisualizationValue{
    /** new plot data clears the metadata filter, since its fields may differ */
    setPlotData: (plotData: UmapComparison | null) => void;
    setMetadataFilter: (filter: MetadataFilter) => void;
    setNeighbors: (neighbors: NeighborRow[] | null) => void;
}

const VisualizationContext  = createContext<VisualizationContextValue | undefined>(undefined);

export const VisualizationProvider = ({
                                          children,
                                          initialPlotData = null,
                                      }: {
    children: React.ReactNode;
    initialPlotData?: VisualizationValue | null;
}) => {
    const [plotData, setPlotDataState] = useState<UmapComparison | null>(null);
    const [metadataFilter, setMetadataFilter] = useState<MetadataFilter>(EMPTY_FILTER);
    const [neighbors, setNeighbors] = useState<NeighborRow[] | null>(null);
    const setPlotData = useCallback((data: UmapComparison | null) => {
        setPlotDataState(data);
        setMetadataFilter(EMPTY_FILTER);
    }, []);
    const value = useMemo<VisualizationContextValue>(
        () => ({
            plotData,
            metadataFilter,
            neighbors,
            setPlotData,
            setMetadataFilter,
            setNeighbors,
        }),
        [plotData, metadataFilter, neighbors, setPlotData],
    );

    return (
        <VisualizationContext.Provider value={value}>
            {children}
        </VisualizationContext.Provider>
    )
}

export const useVisualization = (): VisualizationContextValue => {
    const context = useContext(VisualizationContext);
    if (!context) {
        throw new Error("useVisualization must be used within a VisualizationProvider");
    }
    return context;
};

export default VisualizationContext;
