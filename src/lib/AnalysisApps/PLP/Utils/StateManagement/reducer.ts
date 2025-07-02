import ACTIONS from './Actions';

export interface Action {
  type: string;
  payload?: any;
};

export interface State {
  selectedStudyPopulationCohort: any;
  datasetObservationWindow: number;
  datasetRemainingSize: number | null;
  selectedOutcomeCohort: any;
  outcomeObservationWindow: number;
  minimumCovariateOccurrence: number;
  useAllCovariates: boolean;
  numberOfCrossValidationFolds: number,
  percentageOfDataToUseAsTest: number | null,
  model: string,
  modelParameters: Record<string,any>,
  finalPopulationSizes: any[];
  currentStep: number;
  selectionMode: string;
  messages: any[];
  selectedTeamProject: string;
  showJobSubmitModal: boolean;
  jobName: string;
  workflowSubmissionStatus: string | null;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case ACTIONS.SET_SELECTED_STUDY_POPULATION_COHORT:
      return { ...state, selectedStudyPopulationCohort: action.payload };
    case ACTIONS.SET_SELECTED_OUTCOME_COHORT:
      return { ...state, selectedOutcomeCohort: action.payload };
    case ACTIONS.SET_DATASET_OBSERVATION_WINDOW:
      return { ...state, datasetObservationWindow: action.payload };
    case ACTIONS.SET_DATASET_REMAINING_SIZE:
      return { ...state, datasetRemainingSize: action.payload };
    case ACTIONS.SET_OUTCOME_OBSERVATION_WINDOW:
      return { ...state, outcomeObservationWindow: action.payload };
    case ACTIONS.SET_MINIMUM_COVARIATE_OCCURRENCE:
      return { ...state, minimumCovariateOccurrence: action.payload };
    case ACTIONS.SET_USE_ALL_COVARIATES:
      return { ...state, useAllCovariates: action.payload };
    case ACTIONS.SET_NUMBER_OF_CROSS_VALIDATION_FOLDS:
      return { ...state, numberOfCrossValidationFolds: action.payload };
    case ACTIONS.SET_PERCENTAGE_OF_DATA_TO_USE_AS_TEST:
      return { ...state, percentageOfDataToUseAsTest: action.payload };
    case ACTIONS.INCREMENT_CURRENT_STEP:
      return { ...state, currentStep: state.currentStep + 1 };
    case ACTIONS.DECREMENT_CURRENT_STEP:
      return { ...state, currentStep: state.currentStep - 1 };
    case ACTIONS.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
    case ACTIONS.SET_SELECTION_MODE:
      return { ...state, selectionMode: action.payload };
    case ACTIONS.ADD_MESSAGE:
      if (!state.messages.find((element) => element === action.payload)) {
        return { ...state, messages: [...state.messages, action.payload] };
      }
      return state;
    case ACTIONS.DELETE_MESSAGE:
      return {
        ...state,
        messages: state.messages.filter(
          (message) => message !== action.payload,
        ),
      };
    case ACTIONS.SHOW_JOB_SUBMIT_MODAL:
      return { ...state, showJobSubmitModal: true };
    case ACTIONS.HIDE_JOB_SUBMIT_MODAL:
      return { ...state, showJobSubmitModal: false };
    case ACTIONS.SET_JOB_NAME:
      return { ...state, jobName: action.payload };
    case ACTIONS.SET_SELECTED_MODEL:
      return { ...state, model: action.payload };
    case ACTIONS.SET_SELECTED_MODEL_PARAMETERS:
      return { ...state, modelParameters: action.payload };
    case ACTIONS.SET_WORKFLOW_SUBMISSION_STATUS:
      return { ...state, workflowSubmissionStatus: action.payload };
    default:
      throw new Error(`Unknown action passed to reducer: ${action}`);
  }
};

export default reducer;
