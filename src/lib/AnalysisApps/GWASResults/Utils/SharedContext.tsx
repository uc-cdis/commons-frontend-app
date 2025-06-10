import React, { createContext } from 'react';
import { HomeTableStateType } from '../Views/Home/HomeTableState/InitialHomeTableState';
import { GWASResultsJobs } from '../Views/Home/HomeTable/HomeTable';

interface SharedContextType {
    setCurrentView?: React.Dispatch<React.SetStateAction<string>>;
    selectedRowData?: GWASResultsJobs;
    setSelectedRowData?: React.Dispatch<React.SetStateAction<GWASResultsJobs>>;
    homeTableState?: HomeTableStateType;
    setHomeTableState?: React.Dispatch<React.SetStateAction<HomeTableStateType>>;
}
const SharedContext = createContext<SharedContextType>({});

export default SharedContext;
