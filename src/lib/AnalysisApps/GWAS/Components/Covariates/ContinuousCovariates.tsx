/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
//import Covariates from './Covariates';
import { State, Action } from '../../Utils/StateManagement/reducer';
import { Button } from '@mantine/core';
//import PhenotypeHistogram from '../Diagrams/PhenotypeHistogram/PhenotypeHistogram';
//import './Covariates.css';

interface ContinuousCovariatesInput {
  readonly dispatch: (arg: Action) => void,
  readonly selectedStudyPopulationCohort: State['selectedStudyPopulationCohort'],
  readonly selectedCovariates?: State['covariates'],
  readonly outcome?: State['outcome'],
  readonly handleSelect: (chosenCovariate: any) => void,
  readonly handleClose: () => void,
  readonly submitButtonLabel?: string,
}

const ContinuousCovariates = ({
  dispatch,
  selectedStudyPopulationCohort,
  selectedCovariates = [],
  outcome = null,
  handleSelect,
  handleClose,
  submitButtonLabel = 'Submit',
}: ContinuousCovariatesInput) => {
  const [selected, setSelected] = useState({variable_type: null, concept_id: null, concept_name: null});

  const formatSelected = () => ({
    variable_type: 'concept',
    concept_id: selected.concept_id,
    concept_name: selected.concept_name,
  });

  // when a user has selected a outcome phenotype that is a continuous covariate with a concept ID,
  // that should not appear as a selectable option, and be included in the submitted covariates.
  // If they selected a outcome phenotype that is dichotomous
  // the outcome doesn't need to be included as a submitted covariate
  const submittedCovariateIds = outcome?.concept_id
    ? [outcome.concept_id, ...selectedCovariates.map((obj) => obj.concept_id)]
    : [...selectedCovariates.map((obj) => obj.concept_id)];

  return (
    <React.Fragment>
      <div className="GWASUI-flexRow continuous-covariates">
        <div className="continuous-covariates-table">
        Covariates placeholder
          {/*<Covariates
            selected={selected}
            handleSelect={setSelected}
            submittedCovariateIds={submittedCovariateIds}
          />*/}
        </div>
        <div className="phenotype-histogram">
          <div data-tour="submit-cancel-buttons" className="continuous-covariates-button-container">
            <Button
              variant="outline"
              size="xl"
              radius="md"
              className=""
              onClick={() => handleClose()}
            >
              Cancel
            </Button>
            <Button
              size="xl"
              radius="md"
              disabled={!selected.concept_id}
              onClick={() => {
                handleSelect(formatSelected());
                handleClose();
              }}
            >
              {submitButtonLabel}
            </Button>
          </div>
          {selected.concept_id ? (
            <div data-tour="phenotype-histogram">
              PhenotypeHistogram placeholder
              {/*<PhenotypeHistogram
                dispatch={dispatch}
                selectedStudyPopulationCohort={selectedStudyPopulationCohort}
                selectedCovariates={selectedCovariates}
                outcome={outcome}
                selectedContinuousItem={selected}
              />*/}
            </div>
          ) : (
            <div data-tour="phenotype-histogram" className="phenotype-histogram-directions">
              Select a concept to render its corresponding histogram
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default ContinuousCovariates;
