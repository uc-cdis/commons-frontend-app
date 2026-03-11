import React, { useReducer, Reducer } from 'react';
import reducer, {State, Action} from '../../Utils/StateManagement/reducer';
import InitializeCurrentState from '../../Utils/StateManagement/InitializeCurrentState';
import DefineOutcomeObservationWindow from './DefineOutcomeObservationWindow';
import type { Meta, StoryObj } from '@storybook/nextjs';

const meta: Meta<typeof DefineOutcomeObservationWindow> = {
  title: 'PLP/DefineOutcomeObservationWindow',
  component: DefineOutcomeObservationWindow,
};

export default meta;
type Story = StoryObj<typeof DefineOutcomeObservationWindow>;

const DefineOutcomeObservationWindowWithHooks = () => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, InitializeCurrentState());

  return (
    <DefineOutcomeObservationWindow
      outcomeObservationWindow={state.outcomeObservationWindow}
      removeIndividualsWithPriorOutcome={state.removeIndividualsWithPriorOutcome}
      dispatch={dispatch}
     />
  );
};

export const DefineOutcomeObservationWindowMockedSuccess: Story = {
  render: () => <DefineOutcomeObservationWindowWithHooks />, // see https://storybook.js.org/docs/writing-stories
};
