import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import { NumberInput } from '@mantine/core';
import { toInteger } from 'lodash';
import { Box, Checkbox } from '@mantine/core';


type DefineOutcomeObservationWindowProps = {
  dispatch: (action: any) => void;
  outcomeObservationWindow?: number;
  removeIndividualsWithPriorOutcome?: boolean;
};

const DefineOutcomeObservationWindow = ({
  outcomeObservationWindow,
  removeIndividualsWithPriorOutcome,
  dispatch,
}: DefineOutcomeObservationWindowProps) => {
  const handleDefineOutcomeObservationWindow = (outcomeObservationWindow: number) => {
    dispatch({
      type: ACTIONS.SET_OUTCOME_OBSERVATION_WINDOW,
      payload: outcomeObservationWindow,
    });
  };

  const handleRemoveIndividualsWithPriorOutcomeCheckbox = (checked: boolean) => {
    dispatch({
      type: ACTIONS.SET_REMOVE_INDIVIDUALS_WITH_PRIOR_OUTCOME,
      payload: checked,
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
      <Box pb="md">
        <Checkbox
          mt="md"
          label="Remove individuals with prior outcome"
          checked={!!removeIndividualsWithPriorOutcome}
          onChange={(e) => handleRemoveIndividualsWithPriorOutcomeCheckbox(e.currentTarget.checked)}
        />
      </Box>
    </div>
  );
};

export default DefineOutcomeObservationWindow;
