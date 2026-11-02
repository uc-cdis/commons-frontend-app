import React, { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table-open";
import "mantine-react-table-open/styles.css";
import { Text } from "@mantine/core";

export type MetadataRow = Record<string, string>;

export interface MetadataTableProps {
  /** column names, in file order */
  columns: string[];
  rows: MetadataRow[];
}

const MetadataTable = ({ columns, rows }: MetadataTableProps) => {
  const columnDefs = useMemo<MRT_ColumnDef<MetadataRow>[]>(
    () => columns.map((name) => ({ id: name, accessorFn: (row) => row[name], header: name })),
    [columns],
  );

  const table = useMantineReactTable({
    columns: columnDefs,
    data: rows,
    enableColumnResizing: true,
    enableDensityToggle: false,
    enableFullScreenToggle: false,
    initialState: { density: "xs", pagination: { pageIndex: 0, pageSize: 25 } },
    enableStickyHeader: true,
  });

  if (!rows.length)
    return ((<div className="flex flex-col space-y-2 m-10 p-1 h-full w-full">
      <Text fs="xl">No data to display.</Text>
    </div>));

    return <div className="m-2"> <MantineReactTable table={table} /></div>;
};

export default MetadataTable;
