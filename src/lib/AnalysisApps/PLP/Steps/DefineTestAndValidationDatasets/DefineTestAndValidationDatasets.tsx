import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import { NumberInput } from '@mantine/core';
import { toInteger, toNumber } from 'lodash';


type DefineTestAndValidationDatasetsProps = {
  dispatch: (action: any) => void;
  numberOfCrossValidationFolds?: number;
  percentageOfDataToUseAsTest?: number;
};

const DefineTestAndValidationDatasets = ({
  numberOfCrossValidationFolds,
  percentageOfDataToUseAsTest,
  dispatch,
}: DefineTestAndValidationDatasetsProps) => {
  const handleNumberOfCrossValidationFolds = (numberOfCrossValidationFolds: number) => {
    dispatch({
      type: ACTIONS.SET_NUMBER_OF_CROSS_VALIDATION_FOLDS,
      payload: numberOfCrossValidationFolds,
    });
  };

  const handlePercentageOfDataToUseAsTest = (percentageOfDataToUseAsTest: number) => {
    dispatch({
      type: ACTIONS.SET_PERCENTAGE_OF_DATA_TO_USE_AS_TEST,
      payload: percentageOfDataToUseAsTest,
    });
  };

  return (
    <div data-tour="define-dataset-observation-window">
      <NumberInput
        label="Number of folds to use in the cross-validation"
        placeholder="e.g. 3"
        w={450}
        min={2}
        max={15}
        value={numberOfCrossValidationFolds}
        rightSection="folds"
        rightSectionWidth={50}
        onChange={(e) => handleNumberOfCrossValidationFolds(toInteger(e))}
      />
      <NumberInput
        label="Percentage of the data to be held out for final model testing"
        placeholder="e.g. 25"
        w={450}
        min={0}
        max={99}
        value={percentageOfDataToUseAsTest}
        rightSection="%"
        onChange={(value) => {
          handlePercentageOfDataToUseAsTest(toNumber(value));
        }}
      />
    </div>
  );
};

export default DefineTestAndValidationDatasets;
