import { TextInput, NumberInput, Checkbox, Select, Group, Box, Text, MultiSelect } from '@mantine/core';
import { ModelParamValues, ModelParametersUtils } from './ModelParametersUtils';
import CommaSeparatedNumberInput from './CommaSeparatedNumberInput';
import React, { useEffect } from 'react';

interface RandomForestParametersProps {
  dispatch: (action: any) => void;
  model: string;
  modelParameters?: Record<string, any>;
}

// Constants: these MUST match EXACTLY the doc parameter names here: https://ohdsi.github.io/PatientLevelPrediction/reference/setRandomForest.html
const NUM_TREES = 'ntrees';
const CRITERION = 'criterion';
const MAX_DEPTH = 'maxDepth';
const MIN_SAMPLES_SPLIT = 'minSamplesSplit';
const MIN_SAMPLES_LEAF = 'minSamplesLeaf';
const MIN_WEIGHT_FRACTION_LEAF = 'minWeightFractionLeaf';
const MTRIES = 'mtries';
const MAX_LEAF_NODES = 'maxLeafNodes';
const MIN_IMPURITY_DECREASE = 'minImpurityDecrease';
const BOOTSTRAP = 'bootstrap';
const MAX_SAMPLES = 'maxSamples';
const OOB_SCORE = 'oobScore';
const CLASS_WEIGHT = 'classWeight';
const SEED = 'seed';

export function RandomForestParameters({ dispatch, model, modelParameters }: RandomForestParametersProps) {

  // Default initial values:
  const initialModelParameters: { [key: string]: ModelParamValues } = {
    [model]: {
      [NUM_TREES]: [100,500],
      [CRITERION]: ['gini'],
      [MAX_DEPTH]: [4,10,17],
      [MIN_SAMPLES_SPLIT]: [2],
      [MIN_SAMPLES_LEAF]: [1,10],
      [MIN_WEIGHT_FRACTION_LEAF]: [0.0],
      [MTRIES]: ['sqrt', 'log2'],
      [MAX_LEAF_NODES]: [100],
      [MIN_IMPURITY_DECREASE]: [0],
      [BOOTSTRAP]: [true],
      [MAX_SAMPLES]: [0.9],
      [OOB_SCORE]: [false],
      [CLASS_WEIGHT]: ['balanced'],
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
      <CommaSeparatedNumberInput
        label="Number of trees to build"
        value={utils.getValue(NUM_TREES).join(", ")}
        onChange={val => utils.handleSetModelParameters(NUM_TREES, val)}
        required
        placeholder = 'e.g. 100, 200, 500 or just 100'
      />
      <MultiSelect
        label="Function to measure the quality of a split"
        placeholder="Select one or more"
        value={utils.getValue(CRITERION) || []}
        onChange={(v) => utils.handleSetModelParameters(CRITERION, v)}
        data={[
          { value: 'gini', label: 'Gini impurity' },
          { value: 'entropy', label: 'Information gain' }
        ]}
      />
      <CommaSeparatedNumberInput
        label="Maximum tree depth (leave empty for unlimited)"
        tooltip={<>If empty, then nodes are expanded until all leaves are pure or
        until all leaves contain less than minSamplesSplit samples.
        You can provide a single number (e.g. 4) or a comma-separated list (e.g. 4,10,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        value={utils.getValue(MAX_DEPTH).join(", ")}
        onChange={val => utils.handleSetModelParameters(MAX_DEPTH, val)}
        placeholder = 'e.g. 4, 10, 17 or just 4'
      />
      <CommaSeparatedNumberInput
        label="Minimum number of samples required to split an internal node"
        tooltip={<>You can provide a single number (e.g. 2) or a comma-separated list (e.g. 2,3,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        placeholder="e.g. 2, 3, etc or just 2"
        value={utils.getValue(MIN_SAMPLES_SPLIT).join(", ")}
        onChange={val => utils.handleSetModelParameters(MIN_SAMPLES_SPLIT, val)}
      />
      <CommaSeparatedNumberInput
        label="Minimum number of samples required to be at a leaf node"
        tooltip={<>A split point at any depth will only be considered if it leaves at least minSamplesLeaf
        training samples in each of the left and right branches. This may have the effect of smoothing
        the model, especially in regression.
        You can provide a single number (e.g. 1) or a comma-separated list (e.g. 1,10,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        value={utils.getValue(MIN_SAMPLES_LEAF).join(", ")}
        onChange={val => utils.handleSetModelParameters(MIN_SAMPLES_LEAF, val)}
        placeholder = 'e.g. 1, 10,etc or just 1'
      />
      <CommaSeparatedNumberInput
        label="Minimum weighted fraction of the sum total of weights (of all the input samples) required to be at a leaf node"
        tooltip={<>You can provide a single number (e.g. 0.0) or a comma-separated list (e.g. 0.0,0.1,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        placeholder="e.g. 0.0"
        value={utils.getValue(MIN_WEIGHT_FRACTION_LEAF).join(", ")}
        onChange={val => utils.handleSetModelParameters(MIN_WEIGHT_FRACTION_LEAF, val)}
      />
      <MultiSelect
        label="The number of features to consider when looking for the best split "
        placeholder="Select one or more"
        value={utils.getValue(MTRIES) || []}
        onChange={(v) => utils.handleSetModelParameters(MTRIES, v)}
        data={[
          { value: 'int', label: 'consider max_features features at each split' },
          { value: 'float', label: 'consider round(max_features * n_features) at each split' },
          { value: 'sqrt', label: 'consider max_features=sqrt(n_features)' },
          { value: 'log2', label: 'consider max_features=log2(n_features)' },
          { value: 'NULL', label: 'consider max_features=n_features' },
        ]}
      />
      <CommaSeparatedNumberInput
        label="Maximum leaf nodes (grow trees with max_leaf_nodes in best-first fashion)"
        tooltip={<>You can provide a single number (e.g. 100) or a comma-separated list (e.g. 100,200,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        value={utils.getValue(MAX_LEAF_NODES).join(", ")}
        onChange={val => utils.handleSetModelParameters(MAX_LEAF_NODES, val)}
        placeholder = 'e.g. 100'
      />
      <CommaSeparatedNumberInput
        label="Minimum impurity decrease"
        tooltip={<>A node will be split if this split induces a decrease of the impurity greater
        than or equal to this value.
        You can provide a single number (e.g. 0) or a comma-separated list (e.g. 0,1,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        value={utils.getValue(MIN_IMPURITY_DECREASE).join(", ")}
        onChange={val => utils.handleSetModelParameters(MIN_IMPURITY_DECREASE, val)}
        placeholder = 'e.g. 0'
      />

      {/* START Bootstrap section */}
      <Checkbox
        mt="md"
        label="Use bootstrap samples when building trees (if not selected, the whole dataset is used to build each tree)"
        checked={!!utils.getValue(BOOTSTRAP)[0]}
        onChange={(e) => utils.handleSetModelParameters(BOOTSTRAP, [e.currentTarget.checked])}
      />
      {utils.getValue(BOOTSTRAP)[0] && (
        <Box
          mt="md"
          p="md"
          style={{
            border: '1.5px solid rgb(198, 206, 213)',
            borderRadius: 8,
            background: 'rgb(243, 244, 247)',
          }}
        >
          <Group mb="xs">
            <Text size="sm">
              Bootstrap settings
            </Text>
          </Group>
          <CommaSeparatedNumberInput
            label="Number or fraction of samples to draw from X to train each base estimator"
            tooltip={<>You can provide a single number (e.g. 100) or a comma-separated list (e.g. 100,200,etc).
            When you provide a list, the model will run for each value, assess the results, and use the best one.
            </>}
            value={utils.getValue(MAX_SAMPLES).join(", ")}
            onChange={val => utils.handleSetModelParameters(MAX_SAMPLES, val)}
            placeholder="e.g. 100 (for number of samples) or e.g. 0.9 (for fraction of samples)"
          />
          <Checkbox
            label="Use out-of-bag samples to estimate generalization score"
            checked={!!utils.getValue(OOB_SCORE)[0]}
            onChange={(e) => utils.handleSetModelParameters(OOB_SCORE, [e.currentTarget.checked])}
          />
        </Box>
      )}
      {/* END Bootstrap section */}
      <MultiSelect
        label="Class weights"
        placeholder="Select one or more"
        value={utils.getValue(CLASS_WEIGHT) || []}
        onChange={(v) => utils.handleSetModelParameters(CLASS_WEIGHT, v)}
        data={[
          { value: 'NULL', label: 'none' },
          { value: 'balanced', label: 'balanced' },
          { value: 'balanced_subsample', label: 'balanced_subsample' },
        ]}
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
