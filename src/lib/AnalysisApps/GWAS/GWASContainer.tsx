import React, { useReducer } from 'react';
import { Button, Group, Anchor, Title } from '@mantine/core';
import ProgressBar from './Components/ProgressBar/ProgressBar';
import { GWASAppSteps, checkFinalPopulationSizeZero } from './Utils/constants';
// import { SourceContextProvider } from './Utils/Source';
import reducer from './Utils/StateManagement/reducer';
// import ACTIONS from './Utils/StateManagement/Actions';
import AttritionTableWrapper from './Components/AttritionTableWrapper/AttritionTableWrapper';
import SelectStudyPopulation from './Steps/SelectStudyPopulation/SelectStudyPopulation';
// import ConfigureGWAS from './Steps/ConfigureGWAS/ConfigureGWAS';
import SelectOutcome from './Steps/SelectOutcome/SelectOutcome';
import SelectCovariates from './Steps/SelectCovariates/SelectCovariates';
// import DismissibleMessagesList from './Components/DismissibleMessagesList/DismissibleMessagesList';
import MakeFullscreenButton from './Components/MakeFullscreenButton/MakeFullscreenButton';
import InitializeCurrentState from './Utils/StateManagement/InitializeCurrentState';
import TeamProjectHeader from '../SharedUtils/TeamProject/TeamProjectHeader/TeamProjectHeader';
// import WorkflowLimitsDashboard from '../SharedUtils/WorkflowLimitsDashboard/WorkflowLimitsDashboard';
// import './GWASApp.css';
import Link from 'next/link';

const GWASContainer = () => {
  const [state, dispatch] = useReducer(reducer, InitializeCurrentState());
  const generateStep = () => {
    console.log('state.currentStep', state.currentStep, state);
    switch (state.currentStep) {
      case 0:
        return (
          <div data-tour="cohort-intro" className="min-w-[500px]">
            <SelectStudyPopulation
              selectedCohort={state.selectedStudyPopulationCohort}
              dispatch={dispatch}
              selectedTeamProject={state.selectedTeamProject}
            />
          </div>
        );

    case 1:
      return (
        <SelectOutcome
          studyPopulationCohort={state.selectedStudyPopulationCohort}
          outcome={state.outcome}
          covariates={state.covariates}
          dispatch={dispatch}
          selectedTeamProject={state.selectedTeamProject}
        />
      );
    case 2:
      return (
        <SelectCovariates
          studyPopulationCohort={state.selectedStudyPopulationCohort}
          outcome={state.outcome}
          covariates={state.covariates}
          dispatch={dispatch}
          selectedTeamProject={state.selectedTeamProject}
        />
      );/*
    case 3:
      return (
        <ConfigureGWAS
          dispatch={dispatch}
          numOfPCs={state.numPCs}
          mafThreshold={state.mafThreshold}
          imputationScore={state.imputationScore}
          selectedHare={state.selectedHare}
          covariates={state.covariates}
          selectedCohort={state.selectedStudyPopulationCohort}
          outcome={state.outcome}
          showModal={false}
          finalPopulationSizes={state.finalPopulationSizes}
          selectedTeamProject={state.selectedTeamProject}
        />
      );
    case 4:
      return (
        <ConfigureGWAS
          dispatch={dispatch}
          numOfPCs={state.numPCs}
          mafThreshold={state.mafThreshold}
          imputationScore={state.imputationScore}
          selectedHare={state.selectedHare}
          covariates={state.covariates}
          selectedCohort={state.selectedStudyPopulationCohort}
          outcome={state.outcome}
          showModal
          finalPopulationSizes={state.finalPopulationSizes}
          selectedTeamProject={state.selectedTeamProject}
        />
      );
    */
      default:
        return null;
    }
  };

  let nextButtonEnabled = true;

  // step specific conditions where progress to next step needs to be blocked:
  if (
    (state.currentStep === 0 && !state.selectedStudyPopulationCohort) ||
    (state.currentStep === 1 && !state.outcome) ||
    (state.currentStep === 3 && !state.selectedHare.concept_value) ||
    (state.currentStep === 3 &&
      checkFinalPopulationSizeZero(state.finalPopulationSizes))
  ) {
    nextButtonEnabled = false;
  }

  return (
    <React.Fragment>
      <div>
        <Anchor component={Link} href="/resource-browser"> ← Back to Apps</Anchor>
        <div className="flex justify-between pb-4">
          <Title order={1}>Gen3 GWAS</Title>
          <TeamProjectHeader isEditable={false} />
        </div>
      </div>
      <p className="pb-8 text-sm">
        Use this App to perform high throughput GWAS on Million Veteran Program
        (MVP) data, using the University of Washington Genesis pipeline
      </p>
      <ProgressBar
        currentStep={state.currentStep}
        selectionMode={state.selectionMode}
      />
      <AttritionTableWrapper
        covariates={state.covariates}
        selectedCohort={state.selectedStudyPopulationCohort}
        outcome={state.outcome}
      />
      {/* <SourceContextProvider>  <WorkflowLimitsDashboard />


      <DismissibleMessagesList
        messages={state.messages}
        dismissMessage={(chosenMessage) => {
          dispatch({
            type: ACTIONS.DELETE_MESSAGE,
            payload: chosenMessage,
          });
        }}
      /> */}
      <div data-testid="GWASApp" className="p-4">
        <div className="steps-wrapper">
          <div className="steps-content">
            <Group justify={'center'}>{generateStep()}</Group>
          </div>
          <div
            className="flex justify-between w-full"
            data-testid="steps-action"
          >
            <Button
              className="GWASUI-navBtn GWASUI-navBtn__next"
              onClick={() => {
                alert('Next!');
                // dispatch({ type: ACTIONS.DECREMENT_CURRENT_STEP });
              }}
              disabled={state.currentStep < 1}
            >
              Previous
            </Button>
            {/* If user is on the last step, do not show the next button */}
            {state.currentStep < GWASAppSteps.length && (
              <Button
                data-tour="next-button"
                className="GWASUI-navBtn GWASUI-navBtn__next"
                onClick={() => {
                  alert('clicked');
                  // dispatch({ type: ACTIONS.INCREMENT_CURRENT_STEP });
                }}
                disabled={!nextButtonEnabled}
              >
                Next
              </Button>
            )}
          </div>
          <MakeFullscreenButton />
        </div>
      </div>
    </React.Fragment>
  );
};

export default GWASContainer;
