const initialState = {
  selectedStudyPopulationCohort: null,
  datasetObservationWindow: 0,
  datasetRemainingSize: null,
  selectedOutcomeCohort: null,
  outcomeObservationWindow: 0,
  minimumCovariateOccurrence: 0.1,
  useAllCovariates: true,
  numberOfCrossValidationFolds: 3,
  percentageOfDataToUseAsTest: null,
  model: 'Lasso Logistic Regression',
  modelParameters: {},
  currentStep: 0,
  finalPopulationSizes: [],
  selectionMode: '',
  messages: [],
  showJobSubmitModal: false,
  jobName: '',
  workflowSubmissionStatus: null,
  selectedTeamProject: '',
};

export default initialState;
