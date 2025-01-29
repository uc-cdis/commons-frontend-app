import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import SelectCohort from '../../Components/SelectCohort/SelectCohort';

type SelectStudyPopulationProps = {
  dispatch: (action: any) => void;
  selectedCohort?: number;
  selectedTeamProject: string;
};

const SelectStudyPopulation = ({
  selectedCohort,
  dispatch,
  selectedTeamProject,
}: SelectStudyPopulationProps) => {
  const handleStudyPopulationSelect = (selectedRow: number) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_STUDY_POPULATION_COHORT,
      payload: selectedRow,
    });
  };

  return (
    <div data-tour="cohort-select">
      <SelectCohort
        selectedCohort={selectedCohort}
        handleCohortSelect={handleStudyPopulationSelect}
        selectedTeamProject={selectedTeamProject}
      />
    </div>
  );
};

export default SelectStudyPopulation;
