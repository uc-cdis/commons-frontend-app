import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import { NumberInput } from '@mantine/core';
import { toInteger } from 'lodash';


type DefineDatasetObservationWindowProps = {
  dispatch: (action: any) => void;
  datasetObservationWindow?: number;
};

const DefineDatasetObservationWindow = ({
  datasetObservationWindow,
  dispatch,
}: DefineDatasetObservationWindowProps) => {
  const handleDefineDatasetObservationWindow = (datasetObservationWindow: number) => {
    dispatch({
      type: ACTIONS.SET_DATASET_OBSERVATION_WINDOW,
      payload: datasetObservationWindow,
    });
  };

  return (
    <div data-tour="define-dataset-observation-window">
      <NumberInput
        label="Dataset observation window "
        placeholder="Enter number of days"
        w={400}
        min={0}
        value={datasetObservationWindow}
        rightSection="days"
        rightSectionWidth={50}
        onChange={(e) => handleDefineDatasetObservationWindow(toInteger(e))}
      />
    </div>
  );
};

export default DefineDatasetObservationWindow;
