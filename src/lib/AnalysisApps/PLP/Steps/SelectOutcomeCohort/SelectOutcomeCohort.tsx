import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import SelectCohort from '../../../SharedUtils/SelectCohort/SelectCohort';

type SelectOutcomeCohortProps = {
  dispatch: (action: any) => void;
  selectedCohort?: cohort;
  selectedTeamProject: string;
};

interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

const SelectOutcomeCohort = ({
  selectedCohort,
  dispatch,
  selectedTeamProject,
}: SelectOutcomeCohortProps) => {
  const handleCohortSelect = (selectedCohort: cohort) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_OUTCOME_COHORT,
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

export default SelectOutcomeCohort;
