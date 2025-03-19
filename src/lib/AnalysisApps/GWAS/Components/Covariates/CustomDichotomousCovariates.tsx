/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import { State, Action } from '../../Utils/StateManagement/reducer';
import { Button, TextInput } from '@mantine/core';
//import SelectCohortDropDown from '../SelectCohort/SelectCohortDropDown';
//import CohortsOverlapDiagram from '../Diagrams/CohortsOverlapDiagram/CohortsOverlapDiagram';
//import './Covariates.css';

interface CustomDichotomousCovariatesInput {
  readonly dispatch: (arg: Action) => void,
  readonly handleSelect: (chosenCovariate: any) => void,
  readonly handleClose: () => void,
  readonly studyPopulationCohort: State['selectedStudyPopulationCohort'],
  readonly covariates?: State['covariates'],
  readonly outcome?: State['outcome'],
  readonly submitButtonLabel?: string,
  readonly selectedTeamProject: string,
}
interface setPopulationType {
  cohort_name?: string,
  size?: number,
  cohort_definition_id?: string
}
const setPopulation: setPopulationType = {
  cohort_name: undefined,
  size: undefined,
  cohort_definition_id: undefined,
};
const CustomDichotomousCovariates = ({
  dispatch,
  handleSelect,
  handleClose,
  studyPopulationCohort,
  covariates = [],
  outcome = null,
  submitButtonLabel = 'Submit',
  selectedTeamProject,
}: CustomDichotomousCovariatesInput) => {
  const [firstPopulation, setFirstPopulation] = useState(setPopulation);
  const [secondPopulation, setSecondPopulation] = useState(setPopulation);
  const [providedName, setProvidedName] = useState('');

  const handleDichotomousSubmit = () => {
    const dichotomous = {
      variable_type: 'custom_dichotomous',
      cohort_names: [
        firstPopulation.cohort_name,
        secondPopulation.cohort_name,
      ],
      cohort_sizes: [
        firstPopulation.size,
        secondPopulation.size,
      ],
      cohort_ids: [
        firstPopulation.cohort_definition_id,
        secondPopulation.cohort_definition_id,
      ],
      provided_name: providedName,
    };
    handleSelect(dichotomous);
    handleClose();
  };

  const customDichotomousValidation = providedName.length === 0
    || firstPopulation.cohort_name === undefined
    || secondPopulation.cohort_name === undefined;

  return (
    <div className="">
      <div className="">
        <TextInput
          data-tour="name-input"
          label="Phenotype Name"
          placeholder="Provide a name..."
          onChange={(e) => setProvidedName(e.target.value)}
          value={providedName}
        />
        <span
          className=""
          data-tour="submit-cancel-buttons"
        >
          <Button
            variant="outline"
            size="xl"
            radius="md"
            className=""
            onClick={() => handleClose()}
          >
            Cancel
          </Button>
          <div>
            <Button
              size="xl"
              radius="md"
              disabled={customDichotomousValidation}
              className=""
              onClick={() => handleDichotomousSubmit()}
            >
              {submitButtonLabel}
            </Button>
          </div>
        </span>
      </div>
      <React.Fragment>
        <div>
          <div className="GWASUI-flexRow">
            <div
              data-tour="select-dichotomous"
              className="GWASUI-flexColumn dichotomous-selection"
            >
              <div className="dichotomous-directions">
                Define a dichotomous variable by study population with 2 other
                cohorts.
              </div>
              <div>
                <h3>Get Value 0</h3>
                {/*<SelectCohortDropDown
                  handleCohortSelect={setFirstPopulation}
                  selectedTeamProject={selectedTeamProject}
                />
              </div>
              <div>
                <h3>Get Value 1</h3>
                <SelectCohortDropDown
                  handleCohortSelect={setSecondPopulation}
                  selectedTeamProject={selectedTeamProject}
                />*/}
              </div>
            </div>
            <div
              data-tour="cohorts-overlap-diagram"
              className="cohorts-overlap-diagram"
            >
              {!firstPopulation.cohort_name || !secondPopulation ? (
                <div>Select your cohorts to assess overlap</div>
              ) : (
                <React.Fragment>{/*<CohortsOverlapDiagram
                  dispatch={dispatch}
                  selectedStudyPopulationCohort={studyPopulationCohort}
                  selectedCaseCohort={firstPopulation}
                  selectedControlCohort={secondPopulation}
                  selectedCovariates={covariates}
                  outcome={outcome}
                />*/}</React.Fragment>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
      <div />
    </div>
  );
};

export default CustomDichotomousCovariates;
