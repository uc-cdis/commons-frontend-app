import React, { useMemo, useState } from "react";
import { Group, LoadingOverlay, MultiSelect, Select, Text} from "@mantine/core";
import NeighborsTable from "./NeighborsTable";
import UMAPComparisonPlot from "./charts/UMAPComparisonPlot";
import {useVisualization} from "./core/VisualizationContext";
import {useProcessing} from "./core/ProcessingContext";

import { metadataFieldLabel } from "./utils";
import { filterPlotData, getFilterableFields } from "./processing/filterPlotData";
import { getColorValues, NO_COLORING, TCGA_COLOR_FIELDS } from "./processing/colorTcga";
import type { TcgaColorField, TcgaColoring } from "./processing/colorTcga";

const showFilters = false;

const VisPanel = () => {

  const { plotData, metadataFilter, setMetadataFilter, neighbors } = useVisualization();
  const { isProcessing, isProcessingError } = useProcessing();
  const [tcgaColoring, setTcgaColoring] = useState<TcgaColoring>(NO_COLORING);

  const colorValues = useMemo(
    () => (plotData ? getColorValues(plotData.tcga, tcgaColoring.field) : []),
    [plotData, tcgaColoring.field],
  );

  const fields = useMemo(() => (plotData ? getFilterableFields(plotData) : {}), [plotData]);
  const filteredData = useMemo(
    () => (plotData ? filterPlotData(plotData, metadataFilter) : null),
    [plotData, metadataFilter],
  );
  const total = plotData ? plotData.tcga.length + plotData.input.length : 0;
  const shown = filteredData ? filteredData.tcga.length + filteredData.input.length : 0;

  if (!plotData && !isProcessing) return (<div className="flex flex-col space-y-2 m-10 p-1 h-full w-full">
    <Text fs="xl">No data to visualize.</Text>
  </div>);

  return (
    <div className="flex flex-col space-y-2 m-2 p-1 h-full ">

      {isProcessingError && (
        <Text c="red">Processing failed. See the console for details.</Text>
      )}
      {plotData && showFilters && (
        <Group align="flex-end" className="border-1 border-base-light p-2">
          <Select
            label="Filter by"
            placeholder="Metadata field"
            data={Object.keys(fields).map((field) => ({ value: field, label: metadataFieldLabel(field) }))}
            value={metadataFilter.field}
            onChange={(field) => setMetadataFilter({ field, values: [] })}
            clearable
            searchable
          />
          <MultiSelect
            label="Values"
            placeholder={metadataFilter.field ? "All values" : "Choose a field first"}
            data={metadataFilter.field ? fields[metadataFilter.field] ?? [] : []}
            value={metadataFilter.values}
            onChange={(values) => setMetadataFilter({ ...metadataFilter, values })}
            disabled={!metadataFilter.field}
            clearable
            searchable
            className="flex-1"
          />
          <Text size="sm" className="mb-2">Showing {shown} of {total} points</Text>
        </Group>
      )}
      {plotData && (
        <Group align="flex-end" className="border-1 border-base-light p-2">
          <Select
            label="Color TCGA samples by"
            placeholder="Single color"
            data={Object.entries(TCGA_COLOR_FIELDS).map(([value, label]) => ({ value, label }))}
            value={tcgaColoring.field}
            onChange={(field) => setTcgaColoring({ field: field as TcgaColorField | null, values: [] })}
            clearable
          />
          <MultiSelect
            label="Highlight"
            placeholder={tcgaColoring.field ? (tcgaColoring.values.length ? undefined : "All values; pick some to gray out the rest") : "Choose a field first"}
            data={colorValues}
            value={tcgaColoring.values}
            onChange={(values) => setTcgaColoring({ ...tcgaColoring, values })}
            disabled={!tcgaColoring.field}
            clearable
            searchable
            className="flex-1"
          />
        </Group>
      )}
      {plotData && (
        <div className="relative flex-1 min-h-[1024px] w-full">
          <LoadingOverlay visible={isProcessing}  />
          <UMAPComparisonPlot data={plotData} metadataFilter={metadataFilter} tcgaColoring={tcgaColoring} />
        </div>
      )}
      {neighbors && <NeighborsTable rows={neighbors} />}
    </div>
  );
};

export default VisPanel;
