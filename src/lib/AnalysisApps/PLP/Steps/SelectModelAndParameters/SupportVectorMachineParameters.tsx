import { NumberInput, Checkbox, Select, MultiSelect, Tooltip, Input, ActionIcon, Box } from '@mantine/core';
import { IconQuestionMark } from '@tabler/icons-react';
import { ModelParamValues, ModelParametersUtils } from './ModelParametersUtils';
import CommaSeparatedNumberInput from './CommaSeparatedNumberInput';
import React, { useEffect } from 'react';

interface SVMParametersProps {
  dispatch: (action: any) => void;
  model: string;
  modelParameters?: Record<string, any>;
}

// Constants for param names
const C_PARAM = 'C';
const KERNEL = 'kernel';
const DEGREE = 'degree';
const GAMMA = 'gamma';
const COEF0 = 'coef0';
const SHRINKING = 'shrinking';
const TOL = 'tol';
const CLASS_WEIGHT = 'classWeight';
const SEED = 'seed';

export function SupportVectorMachineParameters({ dispatch, model, modelParameters }: SVMParametersProps) {
  const initialModelParameters: { [key: string]: ModelParamValues } = {
    [model]: {
      [C_PARAM]: [1],
      [KERNEL]: ['rbf'],
      [DEGREE]: [3],
      [GAMMA]: ['scale'],
      [COEF0]: [0],
      [SHRINKING]: [true],
      [TOL]: [0.001],
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
        label="C (Regularization parameter)"
        tooltip={<>Regularization parameter. The strength of the regularization is inversely proportional to C.
        Must be strictly positive. The penalty is a squared l2 penalty.
        You can provide a single number (e.g. 1) or a comma-separated list (e.g. 1,10,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        value={utils.getValue(C_PARAM).join(", ")}
        onChange={val => utils.handleSetModelParameters(C_PARAM, val)}
        placeholder = 'e.g. 0.1,0.9,etc or just 0.1'
      />
      <MultiSelect
        label={
          <Input.Label>
            Kernel type to be used in the algorithm
            <Tooltip multiline withArrow withinPortal w="90vh"
              label={<>If none is given, RBF will be used. If multiple are selected, the model will run for each value,
              assess the results, and use the best one.</>}>
              <ActionIcon size="xs" variant="light" ml={5} tabIndex={-1}><IconQuestionMark size={15} /></ActionIcon>
            </Tooltip>
          </Input.Label>
        }
        placeholder="e.g. RBF"
        data={[
        { value: 'linear', label: 'Linear' },
        { value: 'poly', label: 'Polynomial' },
        { value: 'rbf', label: 'RBF (Radial Basis Function)' },
        { value: 'sigmoid', label: 'Sigmoid' },
        { value: 'precomputed', label: 'Precomputed' }
        ]}
        value={utils.getValue(KERNEL || [])}
        onChange={v => utils.handleSetModelParameters(KERNEL, v)}
        clearable
      />
      <CommaSeparatedNumberInput
        label="Degree (for poly/rbf/sigmoid kernels)"
        value={utils.getValue(DEGREE).join(", ")}
        onChange={(v) => utils.handleSetModelParameters(DEGREE, v)}
        placeholder = 'e.g. 1,3,5 or just 1'
      />
      <MultiSelect
        label={
          <Input.Label>
            Kernel coefficient for RBF and poly
            <Tooltip multiline withArrow withinPortal w="90vh"
              label={<>By default 1/n_features will be taken.</>}>
              <ActionIcon size="xs" variant="light" ml={5} tabIndex={-1}><IconQuestionMark size={15} /></ActionIcon>
            </Tooltip>
          </Input.Label>
        }
        data={[
          'scale',
          'auto',
          '1e-04',
          '3e-05',
          '0.001',
          '0.01',
          '0.25'
        ]}
        value={utils.getValue(GAMMA).map(String)}
        onChange={v => utils.handleSetModelParameters(GAMMA, v)}
        clearable
      />
      <CommaSeparatedNumberInput
        label="Independent term in kernel function (only for poly/sigmoid)"
        value={utils.getValue(COEF0).join(", ")}
        onChange={v => utils.handleSetModelParameters(COEF0, v)}
      />
      <Box pb="md">
        <Checkbox
          mt="md"
          label="Use shrinking heuristic"
          checked={!!utils.getValue(SHRINKING)[0]}
          onChange={e => utils.handleSetModelParameters(SHRINKING, [e.currentTarget.checked])}
        />
      </Box>
      <CommaSeparatedNumberInput
        label="Tolerance for stopping criterion"
        tooltip={<>You can provide a single number (e.g. 0.001) or a comma-separated list (e.g. 0.001,0.005,etc).
        When you provide a list, the model will run for each value, assess the results, and use the best one.
        </>}
        value={utils.getValue(TOL).join(", ")}
        onChange={val => utils.handleSetModelParameters(TOL, val)}
        placeholder="e.g. 0.001 or a list 0.001,0.005,etc"
      />
      <Select
        label="Class weight based on imbalance"
        placeholder="e.g. balanced"
        data={[
          { value: 'NULL', label: 'None' },
          { value: 'balanced', label: 'Balanced' }
        ]}
        value={utils.getValue(CLASS_WEIGHT)[0]}
        onChange={val => utils.handleSetModelParameters(CLASS_WEIGHT, [val])}
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
