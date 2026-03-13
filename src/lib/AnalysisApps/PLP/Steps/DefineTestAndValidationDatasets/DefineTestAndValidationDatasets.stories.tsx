import React, { useReducer, Reducer } from 'react';
import reducer, {State, Action} from '../../Utils/StateManagement/reducer';
import InitializeCurrentState from '../../Utils/StateManagement/InitializeCurrentState';
import DefineTestAndValidationDatasets from './DefineTestAndValidationDatasets';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof DefineTestAndValidationDatasets> = {
  title: 'PLP/DefineTestAndValidationDatasets',
  component: DefineTestAndValidationDatasets,
};

export default meta;
type Story = StoryObj<typeof DefineTestAndValidationDatasets>;

const DefineTestAndValidationDatasetsWithHooks = () => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, InitializeCurrentState());

  return (
    <DefineTestAndValidationDatasets
      numberOfCrossValidationFolds={state.numberOfCrossValidationFolds}
      percentageOfDataToUseAsTest={state.percentageOfDataToUseAsTest ?? undefined}
      dispatch={dispatch}
    />
  );
};

export const DefineTestAndValidationDatasetsMockedSuccess: Story = {
  render: () => <DefineTestAndValidationDatasetsWithHooks />, // see https://storybook.js.org/docs/writing-stories
};
