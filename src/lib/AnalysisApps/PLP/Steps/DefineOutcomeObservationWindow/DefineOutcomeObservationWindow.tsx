import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import { NumberInput } from '@mantine/core';
import { toInteger } from 'lodash';


type DefineOutcomeObservationWindowProps = {
  dispatch: (action: any) => void;
  outcomeObservationWindow?: number;
};

const DefineOutcomeObservationWindow = ({
  outcomeObservationWindow,
  dispatch,
}: DefineOutcomeObservationWindowProps) => {
  const handleDefineOutcomeObservationWindow = (outcomeObservationWindow: number) => {
    dispatch({
      type: ACTIONS.SET_OUTCOME_OBSERVATION_WINDOW,
      payload: outcomeObservationWindow,
    });
  };

  return (
    <div data-tour="define-dataset-observation-window">
      <NumberInput
        label="Outcome window"
        placeholder="Enter number of days"
        w={400}
        min={0}
        value={outcomeObservationWindow}
        rightSection="days"
        rightSectionWidth={50}
        onChange={(e) => handleDefineOutcomeObservationWindow(toInteger(e))}  // TODO - debounce?
      />
    </div>
  );
};

export default DefineOutcomeObservationWindow;
