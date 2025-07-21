import React, { useReducer, Reducer } from 'react';
import { Button, Group, Title } from '@mantine/core';
import ProgressBar from './Components/ProgressBar/ProgressBar';
import { PLPAppSteps } from  './Utils/constants';
import { SourceContextProvider } from '../SharedUtils/Source';
import reducer, {State, Action} from './Utils/StateManagement/reducer';
import ACTIONS from './Utils/StateManagement/Actions';
import AttritionTableWrapper from './Components/AttritionTableWrapper/AttritionTableWrapper';
import SelectStudyPopulation from './Steps/SelectStudyPopulation/SelectStudyPopulation';
import SelectOutcomeCohort from './Steps/SelectOutcomeCohort/SelectOutcomeCohort';

import DefineDatasetObservationWindow from './Steps/DefineDatasetObservationWindow/DefineDatasetObservationWindow';
import DefineOutcomeObservationWindow from './Steps/DefineOutcomeObservationWindow/DefineOutcomeObservationWindow';
import AddCovariates from './Steps/AddCovariates/AddCovariates';
import DefineTestAndValidationDatasets from './Steps/DefineTestAndValidationDatasets/DefineTestAndValidationDatasets';
import SelectModelAndParameters from './Steps/SelectModelAndParameters/SelectModelAndParameters';
//import MakeFullscreenButton from './Components/MakeFullscreenButton/MakeFullscreenButton';
import InitializeCurrentState from './Utils/StateManagement/InitializeCurrentState';
import TeamProjectHeader from '../SharedUtils/TeamProject/TeamProjectHeader/TeamProjectHeader';
import WorkflowLimitsDashboard from '../SharedUtils/WorkflowLimitsDashboard/WorkflowLimitsDashboard';
import JobSubmitModal from './Components/JobSubmitModal/JobSubmitModal';
import DismissibleMessage from '../SharedUtils/DismissibleMessage/DismissibleMessage';

const PLPContainer = () => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, InitializeCurrentState());
  const generateStep = () => {
    switch (state.currentStep) {
      case 0:
        return (
          <div data-tour="cohort-intro" className="min-w-[500px]">
            <div>
              In this step, you can select an initial dataset for Patient Level Prediction (PLP) training,
              validation, and testing. This initial dataset is a user-created cohort in Atlas. You will
              have the opportunity to split this dataset into training, validation, and testing in Step 6.
            </div>
            <br/>
            <SelectStudyPopulation
              selectedCohort={state.selectedStudyPopulationCohort}
              dispatch={dispatch}
              selectedTeamProject={state.selectedTeamProject}
            />
          </div>
        );
    case 1:
      return (
        <div data-tour="cohort-intro" >
          <div>
            In this step, you can define a minimum look-back period in days.
            This period specifies how many days of prior clinical history there should be on record for
            each patient relative to their cohort entry date in the initial dataset.
          </div>
          <br/>
          <DefineDatasetObservationWindow
            datasetObservationWindow={state.datasetObservationWindow}
            dispatch={dispatch}
          />
          <br/>
        </div>
      );
    case 2:
      return (
        <div data-tour="cohort-intro" className="min-w-[500px]">
          <div>
            In this step, you can select the outcome you want for the model to learn to predict.
            The outcome dataset is a user-created cohort in Atlas. This information will be used
            to create outcome labels for all individuals in the initial dataset.
          </div>
          <br/>
          <SelectOutcomeCohort
            selectedCohort={state.selectedOutcomeCohort}
            dispatch={dispatch}
            selectedTeamProject={state.selectedTeamProject}
          />
        </div>
      );
    case 3:
      return (
        <div data-tour="cohort-intro" >
          <div>
            In this step, you can define an outcome period in days. This period specifies how many days to look for the outcome
            of interest to occur for each patient relative to their cohort entry date in the initial dataset.
            This is also known as the time-at-risk window.
          </div>
          <br/>
          <DefineOutcomeObservationWindow
            outcomeObservationWindow={state.outcomeObservationWindow}
            dispatch={dispatch}
          />
          <br/>
        </div>
      );
    case 4:
      return (
        <div data-tour="cohort-intro" >
          <div>
          By default, the model will use all covariates from the clinical history available in the Dataset Observation
          Window (Step 2) and infer covariates with maximum predictive power. In this step, you can specify the minimal
          frequency (in percentage) for covariates to be included (default = 0.1%). If covariate frequency in the initial
          dataset is lower, the covariate will be excluded.
          </div>
          <br/>
          <AddCovariates
            minimumCovariateOccurrence={state.minimumCovariateOccurrence}
            //useAllCovariates={state.useAllCovariates}
            dispatch={dispatch}
          />
          <br/>
        </div>
      );
    case 5:
      return (
        <div data-tour="cohort-intro" >
          <div>
            In this step, you can split the initial dataset into training, validation, and test datasets. You can specify
            what percentage of data to use for the test dataset - this data will be set aside for testing the model,
            and the rest will be used as the training dataset. You can set the number of folds (k) for cross-validation - the
            training dataset will be split into equally sized k folds and for each fold, the model will be trained on all
            training data except the held-out fold, and evaluated by generating predictions for the held-out fold.
          </div>
          <br/>
          <DefineTestAndValidationDatasets
            numberOfCrossValidationFolds={state.numberOfCrossValidationFolds}
            percentageOfDataToUseAsTest={state.percentageOfDataToUseAsTest ?? undefined}
            dispatch={dispatch}
          />
          <br/>
        </div>
      );
    case 6:
      return (
        <div data-tour="cohort-intro" >
          {state.workflowSubmissionStatus && state.workflowSubmissionStatus === 'success' && (
            <React.Fragment key={state.jobName}>
              <DismissibleMessage
                title={"Success"}
                description={`Workflow [${state.jobName}] submitted successfully!`}
                messageType={"success"}
              />
            </React.Fragment>
          )}
          <div>
            In this step, you can select a machine learning model and its parameters.
            Depending on the selected model, relevant parameters will be presented, and
            you can adjust them.
          </div>
          <br/>
          <SelectModelAndParameters
            model={state.model}
            modelParameters={state.modelParameters}
            dispatch={dispatch}
          />
          {state.showJobSubmitModal && state.percentageOfDataToUseAsTest && (
            <JobSubmitModal
              jobName={state.jobName}
              dispatch={dispatch}
              selectedStudyPopulationCohort={state.selectedStudyPopulationCohort}
              datasetObservationWindow={state.datasetObservationWindow}
              selectedOutcomeCohort={state.selectedOutcomeCohort}
              outcomeObservationWindow={state.outcomeObservationWindow}
              selectedTeamProject={state.selectedTeamProject}
              minimumCovariateOccurrence={state.minimumCovariateOccurrence}
              percentageOfDataToUseAsTest={state.percentageOfDataToUseAsTest}
              numberOfCrossValidationFolds={state.numberOfCrossValidationFolds}
              datasetRemainingSize={state.datasetRemainingSize}
              model={state.model}
              modelParameters={state.modelParameters}
            />
          )}
          <br/>
        </div>
      );
    default:
      return null;
    }
  };

  let nextButtonEnabled = true;

  // step specific conditions where progress to next step needs to be blocked:
  if (
    (state.currentStep === 0 && !state.selectedStudyPopulationCohort) ||
    (state.currentStep === 1 && !state.datasetObservationWindow) ||
    (state.currentStep === 2 && !state.selectedOutcomeCohort) ||
    (state.currentStep === 3 && !state.outcomeObservationWindow) ||
    (state.currentStep === 5 && !state.percentageOfDataToUseAsTest)
  ) {
    nextButtonEnabled = false;
  }

  return (
    <SourceContextProvider>
    <React.Fragment>
      <div>
        <div className="flex justify-between pb-4">
          <Title order={1}>Patient Level Prediction</Title>
          <TeamProjectHeader isEditable={false} />
        </div>
      </div>
      <WorkflowLimitsDashboard />
      <p className="pt-4 pb-8 text-sm">
      Use this app for building Patient Level Prediction (PLP) models
      </p>
      <ProgressBar
        currentStep={state.currentStep}
        selectionMode={state.selectionMode}
      />
      <AttritionTableWrapper
        dispatch={dispatch}
        selectedStudyPopulationCohort={state.selectedStudyPopulationCohort}
        datasetObservationWindow={state.datasetObservationWindow}
        selectedOutcomeCohort={state.selectedOutcomeCohort}
        outcomeObservationWindow={state.outcomeObservationWindow}
        percentageOfDataToUseAsTest={state.percentageOfDataToUseAsTest}
      />
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
                dispatch({ type: ACTIONS.DECREMENT_CURRENT_STEP });
              }}
              disabled={state.currentStep < 1}
            >
              Previous
            </Button>
            {/* If user is on the last step, do not show the next button */}
            {state.currentStep < PLPAppSteps.length-1 && (
              <Button
                data-tour="next-button"
                className="GWASUI-navBtn GWASUI-navBtn__next"
                onClick={() => {
                  dispatch({ type: ACTIONS.INCREMENT_CURRENT_STEP });
                }}
                disabled={!nextButtonEnabled}
              >
                Next
              </Button>
            )}
            {state.currentStep === PLPAppSteps.length-1 && (
              <Button
                data-tour="next-button"
                className="GWASUI-navBtn GWASUI-navBtn__next"
                onClick={() => {
                  dispatch({ type: ACTIONS.SET_WORKFLOW_SUBMISSION_STATUS, payload: ''});
                  dispatch({ type: ACTIONS.SHOW_JOB_SUBMIT_MODAL });
                }}
                disabled={!nextButtonEnabled}
              >
                Finish
              </Button>
            )}
          </div>
          {/* <MakeFullscreenButton /> */}
        </div>
      </div>
    </React.Fragment>
    </SourceContextProvider>
  );
};

export default PLPContainer;
