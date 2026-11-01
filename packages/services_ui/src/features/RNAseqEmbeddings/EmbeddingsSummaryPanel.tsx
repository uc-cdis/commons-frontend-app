import React from "react";
import {Stack, Table, Text} from "@mantine/core";
import type { EmbeddingSummary} from "./summarizeEmbeddings";
import {DESCRIBE_STATS, QC_COLUMNS} from "./summarizeEmbeddings";
import {formatNumber} from "./utils";


interface EmbeddingSummaryPanelProps {
    summary: EmbeddingSummary
}

const EmbeddingSummaryPanel = ({ summary } : EmbeddingSummaryPanelProps) => {
    return (
        <Stack gap="xs" className="border-1 border-base-light p-2">
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
