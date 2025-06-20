import { NumberInput } from '@mantine/core';
import { ModelParamValues, ModelParametersUtils } from './ModelParametersUtils';
import React from 'react';

interface LassoParametersProps {
  dispatch: (action: any) => void;
  model: string;
  modelParameters?: Record<string, any>;
}

const STARTING_VALUE_FIELD = 'startingValue';

export function LassoParameters({dispatch, model, modelParameters }: LassoParametersProps) {
  const initialModelParameters: { [key: string]: ModelParamValues } = {
    [model]: {
      [STARTING_VALUE_FIELD]: 0.01,
    }
  }
  const utils = new ModelParametersUtils(initialModelParameters, dispatch, model, modelParameters);

  return (
    <NumberInput
      label="A single value used as the starting value for the automatic lambda search(default = 0.01):"
      value={utils.getValue(STARTING_VALUE_FIELD)}
      placeholder="Enter value"
      min={0}
      onChange={(e) => utils.handleSetModelParameters(STARTING_VALUE_FIELD, e)}
    />
  );
}
