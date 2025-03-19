import React, { useReducer } from 'react';
import reducer from '../../Utils/StateManagement/reducer';
import InitializeCurrentState from '../../Utils/StateManagement/InitializeCurrentState';

import { Meta, StoryObj } from '@storybook/react';

import SelectOutcome from './SelectOutcome';

const meta: Meta<typeof SelectOutcome> = {
  title: 'GWASAPP/Steps/SelectOutcome',
  component: SelectOutcome,
};

export default meta;
type Story = StoryObj<typeof SelectOutcome>;


const SelectCovariatesWithHooks = () => {

  const [state, dispatch] = useReducer(reducer, InitializeCurrentState());
  return <SelectOutcome
      studyPopulationCohort={state.selectedStudyPopulationCohort}
      outcome={state.outcome}
      covariates={state.covariates}
      dispatch={dispatch}
      selectedTeamProject={state.selectedTeamProject}
    />;
};

export const Mock: Story = {
  render: () => <SelectCovariatesWithHooks />,
};
