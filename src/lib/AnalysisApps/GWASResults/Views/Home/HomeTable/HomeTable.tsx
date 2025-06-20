import React, { useContext, useState, useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_SortingState,
  type MRT_VisibilityState,
} from 'mantine-react-table';

import SharedContext from '../../../Utils/SharedContext';
//import ActionsDropdown from './ActionsDropdown/ActionsDropdown';
import Icons from './TableIcons/Icons';
import PHASES from '../../../Utils/PhasesEnumeration';
import VIEWS from '../../../Utils/ViewsEnumeration';
//import isIterable from '../../../Utils/isIterable';
import {Button} from '@mantine/core';

export interface GWASResultsJobs {
  finishedAt: Date;
  gen3teamproject: string;
  gen3username: string;
  name: string;
  phase: string;
  startedAt: Date;
  submittedAt: Date;
  uid: string;
  wf_name: string;
};

const HomeTable = ({ data }: { data: GWASResultsJobs[] }) => {
  const {
    setCurrentView,
    selectedRowData,
    setSelectedRowData,
    homeTableState,
    setHomeTableState,
  } = useContext(SharedContext);

  if (!setCurrentView) {
    throw new Error('setCurrentView is not defined in SharedContext');
  }
  if (!setSelectedRowData) {
    throw new Error('setSelectedRowData is not defined in SharedContext');
  }

  const columns = useMemo<MRT_ColumnDef<GWASResultsJobs>[]>(
    () => [
    {
      header: 'Run ID',
      accessorKey: 'name',
    },
    {
      header: 'User Name',
      accessorKey: 'gen3username',
    },
    {
      header: 'Workflow name',
      accessorKey: 'wf_name',
    },
    {
      header: 'Date/Time Submitted',
      accessorKey: 'submittedAt',
      filterVariant: 'date-range',
      Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(),
    },
    {
      header: 'Job status',
      accessorKey: 'phase',
      Cell: ({ cell }) => {
        //return cell.getValue;
        const cellValue = cell.getValue<string>();
        let icon = <Icons.Error />;
        switch (cellValue) {
          case PHASES.Succeeded:
            icon = <Icons.Succeeded />;
            break
          case PHASES.Pending:
            icon = <Icons.Pending />;
            break
          case PHASES.Running:
            icon = <Icons.Running />;
            break
          case PHASES.Error:
            icon = <Icons.Error />;
            break
          case PHASES.Failed:
            icon = <Icons.Failed />;
            break
        }
        return (
          <div className='flex items-center gap-2'>
            <span className=''>{icon}</span>
            <span className=''>{cellValue}</span>
          </div>
        );
      },
    },
    {
      header: 'Date/Time Finished',
      accessorKey: 'finishedAt',
      filterVariant: 'date-range',
      Cell: ({ cell }) => cell.getValue<Date>().toLocaleDateString(),
    },
    {
      header: 'View Details',
      accessorKey: 'viewDetails',
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ cell }) => {
        const record = cell.row.original;
        return (
          <div className='flex items-center gap-2'>
            <Button
              onClick={() => {
                setSelectedRowData(record);
                setCurrentView(VIEWS.input);
              }}
            >
              Input
            </Button>
            <Button
              onClick={() => {
                setSelectedRowData(record);
                setCurrentView(VIEWS.execution);
              }}
            >
              Execution
            </Button>
            <Button
              onClick={() => {
                setSelectedRowData(record);
                setCurrentView(VIEWS.results);
              }}
              disabled={record.phase !== PHASES.Succeeded}
            >
              Results
            </Button>
          </div>
        );
      },
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      enableColumnFilter: false,
      enableSorting: false,
      Cell: ({ cell }) => {
        const record = cell.row.original;
        return (
          <div className='flex items-center gap-2'>
            {/*<ActionsDropdown record={record} />*/}
          </div>
        );
      },
    },
  ],[]);

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = useState<MRT_VisibilityState>(
    {},
  );
  const [globalFilter, setGlobalFilter] = useState<string | undefined>(
    undefined,
  );
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [sorting, setSorting] = useState<MRT_SortingState>([]);

  /*useEffect(() => { TODO get persisrtence working
    setHomeTableState({
      ...homeTableState, 
      columnFilters: columnFilters,
      columnVisibility: columnVisibility,
      globalFilter: globalFilter,
      showGlobalFilter: showGlobalFilter,
      showColumnFilters: showColumnFilters,
      sorting: sorting,
    });
  }, [columnFilters, columnVisibility, globalFilter, showGlobalFilter, showColumnFilters, sorting]);*/

  const table = useMantineReactTable({
    columns,
    data,
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableFacetedValues: true,
    enableColumnPinning: true,
    enableDensityToggle: false,
    mantinePaginationProps: {
      rowsPerPageOptions: ['10', '20', '30'],
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onShowColumnFiltersChange: setShowColumnFilters,
    onShowGlobalFilterChange: setShowGlobalFilter,
    onSortingChange: setSorting,
    state: {
      columnFilters,
      columnVisibility,
      globalFilter,
      showColumnFilters,
      showGlobalFilter,
      sorting,
      density: 'xs',
    },
  });

  return (
    <div className='home-table'>
      <MantineReactTable table={table} />
    </div>
  );
};

export default HomeTable;
