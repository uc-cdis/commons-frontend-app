import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import SelectCohort from '../../../SharedUtils/SelectCohort/SelectCohort';

type SelectStudyPopulationProps = {
  dispatch: (action: any) => void;
  selectedCohort?: cohort;
  selectedTeamProject: string;
};

interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

const SelectStudyPopulation = ({
  selectedCohort,
  dispatch,
  selectedTeamProject,
}: SelectStudyPopulationProps) => {
  const handleCohortSelect = (selectedCohort: cohort) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_STUDY_POPULATION_COHORT,
      payload: selectedCohort,
    });
  };

  return (
    <div data-tour="cohort-select">
      <SelectCohort
        selectedCohort={selectedCohort}
        handleCohortSelect={handleCohortSelect}
        selectedTeamProject={selectedTeamProject}
      />
    </div>
  );
};

export default SelectStudyPopulation;
