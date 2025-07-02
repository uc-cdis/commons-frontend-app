import React, { useReducer, Reducer } from 'react';
import reducer, {State, Action} from '../../Utils/StateManagement/reducer';
import InitializeCurrentState from '../../Utils/StateManagement/InitializeCurrentState';
import SelectModelAndParameters from './SelectModelAndParameters';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SelectModelAndParameters> = {
  title: 'PLP/SelectModelAndParameters',
  component: SelectModelAndParameters,
};

export default meta;
type Story = StoryObj<typeof SelectModelAndParameters>;

const SelectModelAndParametersWithHooks = () => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, InitializeCurrentState());

  return (
    <SelectModelAndParameters
          model={state.model}
          modelParameters={state.modelParameters}
          dispatch={dispatch}
     />
  );
};

export const SelectModelAndParametersMockedSuccess: Story = {
  render: () => <SelectModelAndParametersWithHooks />, // see https://storybook.js.org/docs/writing-stories
};
