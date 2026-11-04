import React from "react";
import { ScrollArea, Table, Text, Tooltip } from '@mantine/core';
import type { NeighborRow } from "./processing/nearestNeighbors";
import { TARGET_PROJECT, TOP_K } from "./processing/nearestNeighbors";
import { metadataFieldLabel } from "./utils";

const NeighborsTable = ({ rows }: { rows: NeighborRow[] }) => (
  <div className="border-1 border-base-light p-2">
    <Text fw={500}>Nearest TCGA neighbor of each input sample</Text>
    <ScrollArea h={320}>
      <Table stickyHeader withTableBorder withColumnBorders style={{ tableLayout: 'fixed' }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={80}>Sample</Table.Th>
            <Table.Th>Nearest case</Table.Th>
            <Table.Th>Project</Table.Th>
            <Table.Th>Similarity</Table.Th>
            <Table.Th>{`Top ${TOP_K}: n ${TARGET_PROJECT}`}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map(({ input, nearest, nTargetProject }) => (
            <Table.Tr key={input.sample_id}>
              <Table.Td ><Tooltip label={input.sample_id}><Text  truncate="end">{input.sample_id}</Text></Tooltip></Table.Td>
              <Table.Td>{nearest.metadata.case_id}</Table.Td>
              <Table.Td>{nearest.metadata.project_id}</Table.Td>
              <Table.Td>{nearest.similarity.toFixed(3)}</Table.Td>
              <Table.Td>{nTargetProject}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  </div>
);

export default NeighborsTable;
