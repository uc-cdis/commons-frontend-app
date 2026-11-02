import React, { useMemo } from "react";
import { LoadingOverlay, Stack, Table, Text } from "@mantine/core";
import { EmbeddingSummary, summarizeEmbeddings } from "./summarizeEmbeddings";
import {DESCRIBE_STATS, QC_COLUMNS} from "./summarizeEmbeddings";
import {formatNumber} from "./utils";
import { useProcessing } from "./core/ProcessingContext";



const EmbeddingSummaryPanel = () => {

  const { isProcessing, isProcessingError, results } = useProcessing();
  const summary = useMemo(
    () => (results.length > 0 ? summarizeEmbeddings(results) : null),
    [results],
  );
   if (!results || !summary) {
     return (<div className="flex flex-col space-y-2 m-10 p-1 h-full w-full">
       <Text fs="xl">No data to summerize.</Text>
     </div>);
   }


    return (
        <Stack gap="xs" className="border-1 border-base-light p-2 relative">
            <LoadingOverlay visible={isProcessing} />
            <Text>
                embeddings: ({summary.shape.join(', ')}), encoder: {summary.encoders.join(', ')}
            </Text>
            <Table withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th />
                        {QC_COLUMNS.map((c) => <Table.Th key={c}>{c}</Table.Th>)}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {DESCRIBE_STATS.map((stat) => (
                        <Table.Tr key={stat}>
                            <Table.Th>{stat}</Table.Th>
                            {QC_COLUMNS.map((c) => (
                                <Table.Td key={c}>{formatNumber(summary.describe[c][stat])}</Table.Td>
                            ))}
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
        </Stack>);
};

export default EmbeddingSummaryPanel;
