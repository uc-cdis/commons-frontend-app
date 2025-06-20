import { TextInput, NumberInput, Checkbox } from '@mantine/core';
import { ModelParamValues, ModelParametersUtils } from './ModelParametersUtils';
import React from 'react';

interface RandomForestParametersProps {
  dispatch: (action: any) => void;
  model: string;
  modelParameters?: Record<string, any>;
}

const MAX_INTERACTIONS = 'maxInteractions';
const NUM_FEATURES = 'numFeatures';
const NUM_TREES = 'numTrees';
const PERFORM_INIT_VAR_SEL = 'initVarSel';

export function RandomForestParameters({ dispatch, model, modelParameters }: RandomForestParametersProps) {
  const initialModelParameters: { [key: string]: ModelParamValues } = {
    [model]: {
      [MAX_INTERACTIONS]: '4, 10, 17',
      [NUM_FEATURES]: -1,
      [NUM_TREES]: 500,
      [PERFORM_INIT_VAR_SEL]: true,
    }
  }
  const utils = new ModelParametersUtils(initialModelParameters, dispatch, model, modelParameters);

  return (
    <div>
      <TextInput
        label="Maximum number of interactions - a large value will lead to slow model training(default = 4,10,17):"
        placeholder="Enter value"
        value={utils.getValue(MAX_INTERACTIONS)}
        onChange={(e) => utils.handleSetModelParameters(MAX_INTERACTIONS, e.target.value)}
      />
      <NumberInput
        label="The number of features to include in each tree (-1 defaults to square root of total features)(default = -1):"
        placeholder="Enter value"
        value={utils.getValue(NUM_FEATURES)}
        onChange={(e) => utils.handleSetModelParameters(NUM_FEATURES, e)}
        min={-1}
      />
      <NumberInput
        label="The number of trees to build(default = 500):"
        placeholder="Enter value"
        value={utils.getValue(NUM_TREES)}
        onChange={(e) => utils.handleSetModelParameters(NUM_TREES, e)}
        min={1}
      />
      <Checkbox
        mt="md"
        label="Perform an initial variable selection prior to fitting the model to select the useful variables(default = true):"
        checked={utils.getValue(PERFORM_INIT_VAR_SEL)}
        onChange={(event) => utils.handleSetModelParameters(PERFORM_INIT_VAR_SEL, event.currentTarget.checked)}
      />
    </div>
  );
}
