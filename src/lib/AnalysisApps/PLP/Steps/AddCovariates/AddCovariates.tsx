import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import { NumberInput } from '@mantine/core';

type AddCovariatesProps = {
  dispatch: (action: any) => void;
  minimumCovariateOccurrence?: number;
};

const AddCovariates = ({
  minimumCovariateOccurrence = 0.1,
  dispatch,
}: AddCovariatesProps) => {
  const handleSetMinimumCovariateOccurrence = (minimumCovariateOccurrence: number) => {
    dispatch({
      type: ACTIONS.SET_MINIMUM_COVARIATE_OCCURRENCE,
      payload: minimumCovariateOccurrence,
    });
  };

  return (
    <div data-tour="define-dataset-observation-window">
      <NumberInput
        label="Minimum covariate occurrence"
        placeholder="Enter %"
        w={400}
        min={0.1}
        step={0.1}
        defaultValue={0.1}
        rightSection="%"
        value={minimumCovariateOccurrence}
        onChange={(value) => {
          if (typeof value === 'number') {
            handleSetMinimumCovariateOccurrence(value);
          }
        }}
      />
    </div>
  );
};

export default AddCovariates;
