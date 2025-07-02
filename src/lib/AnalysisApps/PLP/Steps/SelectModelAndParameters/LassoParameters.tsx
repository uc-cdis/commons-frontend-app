import { TextInput, NumberInput, Checkbox, Group, Box, Text } from '@mantine/core';
import { ModelParamValues, ModelParametersUtils } from './ModelParametersUtils';
import React, { useEffect } from 'react';

interface LassoParametersProps {
  dispatch: (action: any) => void;
  model: string;
  modelParameters?: Record<string, any>;
}

// Constants to match doc parameter names
const VARIANCE = 'variance';
const FORCE_INTERCEPT = 'forceIntercept';
const UPPER_LIMIT = 'upperLimit';
const LOWER_LIMIT = 'lowerLimit';
const TOLERANCE = 'tolerance';
const MAX_ITERATIONS = 'maxIterations';
const SEED = 'seed';

export function LassoParameters({ dispatch, model, modelParameters }: LassoParametersProps) {

  // Default initial values, mirroring your R defaults
  const initialModelParameters: { [key: string]: ModelParamValues } = {
    [model]: {
      [VARIANCE]: 0.01,
      [FORCE_INTERCEPT]: false,
      [UPPER_LIMIT]: 20,
      [LOWER_LIMIT]: 0.01,
      [TOLERANCE]: 2e-6,
      [MAX_ITERATIONS]: 3000,
      [SEED]: 0,
    }
  };
  const utils = new ModelParametersUtils(initialModelParameters, dispatch, model, modelParameters);
  useEffect(() => {
    // Loop through all keys and set them
    Object.entries(initialModelParameters[model]).forEach(([param, value]) => {
      utils.handleSetModelParameters(param, value);
    });
  }, []); // Only runs once, on component mount

  return (
    <div>
      <NumberInput
        label="Prior distribution starting variance"
        placeholder="e.g. 0.01"
        value={utils.getValue(VARIANCE)}
        onChange={val => utils.handleSetModelParameters(VARIANCE, val)}
        min={0}
        step={0.01}
        required
      />
      <Box pb="md">
        <Checkbox
          mt="md"
          label="Force intercept coefficient into prior"
          checked={!!utils.getValue(FORCE_INTERCEPT)}
          onChange={e => utils.handleSetModelParameters(FORCE_INTERCEPT, e.currentTarget.checked)}
        />
      </Box>
      <NumberInput
        label="Upper prior variance limit for grid-search"
        value={utils.getValue(UPPER_LIMIT)}
        onChange={val => utils.handleSetModelParameters(UPPER_LIMIT, val)}
        min={0}
        step={0.01}
      />
      <NumberInput
        label="Lower prior variance limit for grid-search"
        value={utils.getValue(LOWER_LIMIT)}
        onChange={val => utils.handleSetModelParameters(LOWER_LIMIT, val)}
        min={0}
        step={0.01}
      />
      <NumberInput
        label="Maximum relative change in convergence criterion from successive iterations to achieve convergence"
        placeholder="e.g. 2e-6"
        value={utils.getValue(TOLERANCE)}
        onChange={val => utils.handleSetModelParameters(TOLERANCE, val)}
        min={0}
        step={0.000001}
      />
      <NumberInput
        label="Maximum iterations"
        placeholder="e.g. 3000"
        value={utils.getValue(MAX_ITERATIONS)}
        onChange={val => utils.handleSetModelParameters(MAX_ITERATIONS, val)}
        min={1}
        step={1}
      />
      <NumberInput
        label="A seed for the model"
        placeholder="e.g. 421"
        value={utils.getValue(SEED)}
        onChange={val => utils.handleSetModelParameters(SEED, val)}
        min={0}
        max={100000}
        step={1}
      />
    </div>
  );
}
