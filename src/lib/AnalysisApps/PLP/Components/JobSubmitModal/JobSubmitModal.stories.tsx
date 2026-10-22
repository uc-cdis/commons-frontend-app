import React, { useReducer } from 'react';
import JobSubmitModal from './JobSubmitModal';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import reducer from '../../Utils/StateManagement/reducer';
import InitializeCurrentState from '../../Utils/StateManagement/InitializeCurrentState';

const meta: Meta<typeof JobSubmitModal> = {
  title: 'PLP/JobSubmitModal',
  component: JobSubmitModal,
};

export default meta;
type Story = StoryObj<typeof JobSubmitModal>;


const selectedStudyPopulationCohort = {
  cohort_definition_id: 25,
  cohort_name: 'Study Population Cohort',
  size: 4000,
};
const selectedOutcomeCohort = {
  cohort_definition_id: 25,
  cohort_name: 'Outcome Cohort',
  size: 4000,
};

const AttritionTableWithHooksWaiting = () => {
  const [state, dispatch] = useReducer(reducer, {
    ...InitializeCurrentState(), 
    selectedStudyPopulationCohort: selectedStudyPopulationCohort,
    selectedOutcomeCohort: selectedOutcomeCohort,
    sourceId: 0,
  });

  return (
      <JobSubmitModal
        jobName={state.jobName}
        dispatch={dispatch}
        selectedStudyPopulationCohort={state.selectedStudyPopulationCohort}
        datasetObservationWindow={state.datasetObservationWindow}
        selectedOutcomeCohort={state.selectedOutcomeCohort}
        outcomeObservationWindow={state.outcomeObservationWindow}
        removeIndividualsWithPriorOutcome={state.removeIndividualsWithPriorOutcome}
        selectedTeamProject={state.selectedTeamProject}
        minimumCovariateOccurrence={state.minimumCovariateOccurrence}
        percentageOfDataToUseAsTest={25}
        numberOfCrossValidationFolds={state.numberOfCrossValidationFolds}
        datasetRemainingSize={state.datasetRemainingSize}
        model={state.model}
        modelParameters={state.modelParameters}
        sourceId={state.sourceId}
      />
  );
};

const AttritionTableWithHooksFull = () => {
  const [state, dispatch] = useReducer(reducer, {
    ...InitializeCurrentState(), 
    selectedStudyPopulationCohort: selectedStudyPopulationCohort,
    selectedOutcomeCohort: selectedOutcomeCohort,
    sourceId: 0,
  });

  return (
      <JobSubmitModal
        jobName={state.jobName}
        dispatch={dispatch}
        selectedStudyPopulationCohort={state.selectedStudyPopulationCohort}
        datasetObservationWindow={state.datasetObservationWindow}
        selectedOutcomeCohort={state.selectedOutcomeCohort}
        outcomeObservationWindow={state.outcomeObservationWindow}
        removeIndividualsWithPriorOutcome={state.removeIndividualsWithPriorOutcome}
        selectedTeamProject={state.selectedTeamProject}
        minimumCovariateOccurrence={state.minimumCovariateOccurrence}
        percentageOfDataToUseAsTest={25}
        numberOfCrossValidationFolds={state.numberOfCrossValidationFolds}
        datasetRemainingSize={100}
        model={state.model}
        modelParameters={state.modelParameters}
        sourceId={state.sourceId}
      />
  );
};

export const AttritionTableMockedWaiting: Story = {
  render: () => <AttritionTableWithHooksWaiting />, // see https://storybook.js.org/docs/writing-stories
};

export const AttritionTableMockedSuccess: Story = {
  render: () => <AttritionTableWithHooksFull />, 
};

