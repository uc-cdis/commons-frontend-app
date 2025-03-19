import React, { useReducer } from 'react';
import reducer from '../../Utils/StateManagement/reducer';
import InitializeCurrentState from '../../Utils/StateManagement/InitializeCurrentState';

import { Meta, StoryObj } from '@storybook/react';

import SelectCovariates from './SelectCovariates';

const meta: Meta<typeof SelectCovariates> = {
  title: 'GWASAPP/Steps/SelectCovariates',
  component: SelectCovariates,
};

export default meta;
type Story = StoryObj<typeof SelectCovariates>;


const SelectCovariatesWithHooks = () => {

  const [state, dispatch] = useReducer(reducer, InitializeCurrentState());
  return <SelectCovariates
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
