/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react';
import { State, Action } from '../../Utils/StateManagement/reducer';
import { MantineProvider, Button, Group } from '@mantine/core';
import { SelectCovariatesBtnTheme } from '../SelectCovariates/SelectCovariates';
import ContinuousCovariates from '../../Components/Covariates/ContinuousCovariates';
//import CovariatesCardsList from '../../Components/Covariates/CovariatesCardsList';
import CustomDichotomousCovariates from '../../Components/Covariates/CustomDichotomousCovariates';
import ACTIONS from '../../Utils/StateManagement/Actions';

interface SelectOutcomeInput {
  readonly dispatch: (arg: Action) => void,
  readonly studyPopulationCohort: State['selectedStudyPopulationCohort'],
  readonly outcome?: State['outcome'],
  readonly covariates?: State['covariates'],
  readonly selectedTeamProject: State['selectedTeamProject'],
}
const SelectOutcome = ({
  dispatch,
  studyPopulationCohort,
  outcome = null,
  covariates = [],
  selectedTeamProject,
}: SelectOutcomeInput) => {
  const [selectionMode, setSelectionMode] = useState('');
  useEffect(
    () => () => dispatch({
      type: ACTIONS.SET_SELECTION_MODE,
      payload: '',
    }),
    [],
  );

  const determineSelectOutcomeJsx = () => {
    if (selectionMode === 'continuous') {
      return (
        <div className="select-container">
          <ContinuousCovariates
            dispatch={dispatch}
            selectedStudyPopulationCohort={studyPopulationCohort}
            outcome={null}
            handleClose={() => {
              setSelectionMode('');
              dispatch({
                type: ACTIONS.SET_SELECTION_MODE,
                payload: '',
              });
            }}
            handleSelect={(chosenOutcome) => {
              dispatch({
                type: ACTIONS.SET_OUTCOME,
                payload: chosenOutcome,
              });
            }}
          />
        </div>
      );
    }
    if (selectionMode === 'dichotomous') {
      return (
        <div className="select-container">
          <CustomDichotomousCovariates
            dispatch={dispatch}
            studyPopulationCohort={studyPopulationCohort}
            outcome={null}
            handleClose={() => {
              setSelectionMode('');
              dispatch({
                type: ACTIONS.SET_SELECTION_MODE,
                payload: '',
              });
            }}
            handleSelect={(chosenOutcome) => {
              dispatch({
                type: ACTIONS.SET_OUTCOME,
                payload: chosenOutcome,
              });
            }}
            selectedTeamProject={selectedTeamProject}
          />
        </div>
      );
    }

    return (
      <MantineProvider theme={SelectCovariatesBtnTheme}>
          <Group justify="center">
            <Button
              data-tour="select-outcome-continious"
              onClick={() => {
                setSelectionMode('continuous');
                dispatch({
                  type: ACTIONS.SET_SELECTION_MODE,
                  payload: 'continuous',
                });
            }}>
              Add Continuous Outcome Phenotype
            </Button>

            <Button
              data-tour="select-outcome-dichotomous"
              onClick={() => {
                setSelectionMode('dichotomous');
                dispatch({
                  type: ACTIONS.SET_SELECTION_MODE,
                  payload: 'dichotomous',
                });
              }}>
              Add Dichotomous Outcome Phenotype
            </Button>
          </Group>
        </MantineProvider>
    );
  };

  // Outputs the JSX for the component:
  return (
    <div className="GWASUI-row">
      <div data-tour="select-outcome" className="GWASUI-double-column">
        {determineSelectOutcomeJsx()}
      </div>
      <div className="GWASUI-column GWASUI-card-column">
      CovariatesCardsList placeholder
        {/*<CovariatesCardsList
          covariates={covariates}
          outcome={outcome}
          deleteCovariate={(chosenCovariate) => dispatch({
            type: ACTIONS.DELETE_COVARIATE,
            payload: chosenCovariate,
          })}
        />*/}
      </div>
    </div>
  );
};

export default SelectOutcome;
