import React, { useState } from 'react';
import Home from './Views/Home/Home';
// import Results from './Views/Results/Results';
// import Execution from './Views/Execution/Execution';
// import Input from './Views/Input/Input';
import SharedContext from './Utils/SharedContext';
import VIEWS from './Utils/ViewsEnumeration';
import InitialHomeTableState from './Views/Home/HomeTableState/InitialHomeTableState';
import TeamProjectHeader from '../SharedUtils/TeamProject/TeamProjectHeader/TeamProjectHeader';
// import WorkflowLimitsDashboard from '../SharedUtils/WorkflowLimitsDashboard/WorkflowLimitsDashboard';

const GWASResultsContainer = () => {
  const [currentView, setCurrentView] = useState('home');
  const [selectedRowData, setSelectedRowData] = useState({});
  const [homeTableState, setHomeTableState] = useState(InitialHomeTableState);
  const [selectedTeamProject] = useState(
    localStorage.getItem('teamProject') || '',
  );

  const generateStep = () => {
    switch (currentView) {
      case VIEWS.home:
        return <Home selectedTeamProject={selectedTeamProject} />;
      case VIEWS.results:
        return <h1>Results</h1>;
      // return <Results />;
      case VIEWS.execution:
        return <h1>Execution</h1>;
      // return <Execution />;
      case VIEWS.input:
        return <h1>Input</h1>;
      //return <Input />;
      default:
        return null;
    }
  };

  return (
    <div data-testid="GWASResults">
      <div>
        <div className="flex justify-between pb-4">
          <h1 className="text-3xl pb-5 font-medium">GWAS Results</h1>
          <TeamProjectHeader isEditable={false} />
        </div>
      </div>
      {/* <WorkflowLimitsDashboard /> */}
      <SharedContext.Provider
        value={{
          setCurrentView,
          selectedRowData,
          setSelectedRowData,
          homeTableState,
          setHomeTableState,
        }}
      >
        <div data-testid="view">{generateStep()}</div>
      </SharedContext.Provider>
    </div>
  );
};

export default GWASResultsContainer;
