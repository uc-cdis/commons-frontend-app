import localStorageAvailable from './localStorageAvailable';
import DetermineInitialColumnManagement from './DetermineInitialColumnManagement';

import {
  type MRT_ColumnDef,
  type MRT_ColumnFiltersState,
  type MRT_DensityState,
  type MRT_SortingState,
  type MRT_VisibilityState,
} from 'mantine-react-table';
export interface HomeTableStateType {
    columnFilters: MRT_ColumnFiltersState,
    columnVisibility: MRT_VisibilityState,
    globalFilter: string | undefined,
    showGlobalFilter: boolean,
    showColumnFilters: boolean,
    sorting: MRT_SortingState,

    nameSearchTerm?: string;
    userNameSearchTerm?: string;
    wfNameSearchTerm?: string;
    submittedAtSelections?: string[];
    finishedAtSelections?: string[];
    jobStatusSelections?: string[]; //TODO check
    sortInfo?: { //TODO check
        field?: string;
        order?: string;
    };
    currentPage?: number;
    columnManagement?: { [key: string]: boolean }; // Column visibility management
    useLocalStorage?: boolean; // Flag to determine if local storage should be used
}

const InitialHomeTableState: HomeTableStateType = {
  columnFilters: [],
  columnVisibility: {},
  globalFilter: undefined,
  showGlobalFilter: false,
  showColumnFilters: false,
  sorting: [],

  nameSearchTerm: '',
  userNameSearchTerm: '',
  wfNameSearchTerm: '',
  submittedAtSelections: [],
  finishedAtSelections: [],
  jobStatusSelections: [],
  sortInfo: {},
  currentPage: 1,
  columnManagement: DetermineInitialColumnManagement(),
  useLocalStorage: localStorageAvailable(),
};

export default InitialHomeTableState;
