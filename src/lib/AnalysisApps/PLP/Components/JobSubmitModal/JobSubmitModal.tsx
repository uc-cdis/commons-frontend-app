import React, { useState } from 'react';
import { Modal, TextInput, Button, Loader } from '@mantine/core';
import ACTIONS from '../../Utils/StateManagement/Actions';
//import './JobInputModal.css';
import { SubmitWorkflowEndpoint, DefaultHeaders } from '@/lib/AnalysisApps/SharedUtils/Endpoints';
import { useSourceContext } from '../../../SharedUtils/Source';

interface Props {
  jobName: string;
  dispatch: React.Dispatch<any>;
  selectedStudyPopulationCohort: cohort;
  datasetObservationWindow: number;
  selectedOutcomeCohort: cohort;
  outcomeObservationWindow: number;
  selectedTeamProject: string;
  minimumCovariateOccurrence: number;
  percentageOfDataToUseAsTest: number;
  numberOfCrossValidationFolds: number;
  model: string;
  modelParameters: Record<string, any>;
}

interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

const JobSubmitModal: React.FC<Props> = ({
  jobName,
  dispatch,
  selectedStudyPopulationCohort,
  datasetObservationWindow,
  selectedOutcomeCohort,
  outcomeObservationWindow,
  selectedTeamProject,
  minimumCovariateOccurrence,
  percentageOfDataToUseAsTest,
  numberOfCrossValidationFolds,
  model,
  modelParameters,
}) => {
  // const { data, status } = useQuery(
  //   ['monthly-workflow-limit-job-input-modal'],
  //   fetchMonthlyWorkflowLimitInfo,
  // );

  const { sourceId } = useSourceContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isSubmitButtonDisabled =
    jobName === '' || isSubmitting; // Add additional checks here if needed
    // !workflowLimitInfoIsValid(data) ||
    // workFlowLimitExceeded;

  const handleEnterJobName = (jobName: string) => {
    dispatch({
      type: ACTIONS.SET_JOB_NAME,
      payload: jobName,
    });
  };

  // Submit workflow request
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true); // Start the submission process
      setSubmitError(null); // Reset any previous errors

      const requestBody = {
        dataset_id: selectedStudyPopulationCohort.cohort_definition_id,
        outcome_id: selectedOutcomeCohort.cohort_definition_id,
        dataset_observation_window: datasetObservationWindow,
        outcome_observation_window: outcomeObservationWindow,
        require_time_at_risk: false, // TODO - advanced option
        min_time_at_risk: 364,  // TODO - advanced option
        include_all_outcomes:  true, // TODO - advanced option
        first_exposure_only: false, // TODO - advanced option
        remove_subjects_with_prior_outcome: true, // TODO - advanced option
        source_id: sourceId,
        covariate_min_fraction: minimumCovariateOccurrence,
        test_fraction: percentageOfDataToUseAsTest/100,
        n_fold: numberOfCrossValidationFolds,
        template_version: "plp-template",
        workflow_name: jobName,
        team_project: selectedTeamProject,
        model_list: [
          {
            name: model,
            params: modelParameters[model]
          },
        ]
      };

      const response = await fetch(SubmitWorkflowEndpoint, {
        method: 'POST',
        headers: DefaultHeaders,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Submission failed with status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Submission Successful: ' + JSON.stringify(responseData));
      // Dispatch success-related actions
      dispatch({
        type: ACTIONS.SET_WORKFLOW_SUBMISSION_STATUS,
        payload: 'success',
      });
      dispatch({ type: ACTIONS.HIDE_JOB_SUBMIT_MODAL });
    } catch (error: any) {
      setSubmitError(error.message || 'Something went wrong during submission.');
      // Dispatch error-related actions
      dispatch({
        type: ACTIONS.SET_WORKFLOW_SUBMISSION_STATUS,
        payload: 'error',
      });
      console.error('Error submitting workflow:', error);
    } finally {
      setIsSubmitting(false); // End the submission process
    }
  };

  return (
    <Modal
      opened={true}
      onClose={() => {
        dispatch({ type: ACTIONS.HIDE_JOB_SUBMIT_MODAL });
      }}
      title={<div className="flex-row">Review Details</div>}
      overlayProps={{ opacity: 0.55, blur: 3 }}
      size="80vh"
    >
      <TextInput
        className="gwas-job-name"
        placeholder="Enter Job Name"
        onChange={(e) => handleEnterJobName(e.target.value)}
        value={jobName}
      />
      <div className="flex-col">
        <div className="flex-row">
          <div>
            Dataset: {selectedStudyPopulationCohort.cohort_name}, size{' '}
            {selectedOutcomeCohort.size}
          </div>
        </div>
        <div className="flex-row">
          <div>Dataset Observation Window: {datasetObservationWindow}</div>
        </div>
        <div className="flex-row">
          <div>
            Outcome of Interest: {selectedOutcomeCohort.cohort_name}, size{' '}
            {selectedOutcomeCohort.size}
          </div>
        </div>
        <div className="flex-row">
          <div>Outcome Observation Window: {outcomeObservationWindow}</div>
        </div>

        {submitError && (
          <div className="error-message">
            <p style={{ color: 'red' }}>{submitError}</p>
          </div>
        )}
      </div>
      <div className="flex-row">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitButtonDisabled}
          className="submit-button"
        >
          {isSubmitting ? <Loader color="white" size="sm" /> : 'Submit'}
        </Button>
        <Button
          onClick={() => {
            dispatch({ type: ACTIONS.HIDE_JOB_SUBMIT_MODAL });
          }}
          className="back-button"
          variant="outline"
        >
          Back
        </Button>
      </div>
    </Modal>
  );
};

export default JobSubmitModal;
