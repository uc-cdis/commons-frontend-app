import React from 'react';
import ACTIONS from '../../Utils/StateManagement/Actions';
import { NumberInput } from '@mantine/core';
import { toInteger } from 'lodash';


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
        placeholder="Number of folds to use in the cross-validation"
        min={2}
        max={15}
        value={numberOfCrossValidationFolds}
        rightSection="folds"
        rightSectionWidth={50}
        onChange={(e) => handleNumberOfCrossValidationFolds(toInteger(e))}
      />
      <NumberInput
        placeholder="Percentage of the data to be held out for final model testing (0-100%)"
        min={0}
        value={percentageOfDataToUseAsTest}
        rightSection="%"
        onChange={(value) => {
          if (typeof value === 'number') {
            handlePercentageOfDataToUseAsTest(value);
          }
        }}
      />
    </div>
  );
};

export default DefineTestAndValidationDatasets;
