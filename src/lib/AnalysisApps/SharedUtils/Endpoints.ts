import { GEN3_API } from '@gen3/core';
export const GwasWorkflowEndpoint = 'ga4gh/wes/v2/workflows';

export const GEN3_WORKFLOW_API =
  process.env.NEXT_PUBLIC_GEN3_WORLFLOW_API || `${GEN3_API}/ga4gh/wes/v2`;

const csrfToken = (typeof document !== 'undefined' ? document.cookie.replace(/(?:(?:^|.*;\s*)csrftoken\s*=\s*([^;]*).*$)|^.*$/, '$1') : '');
export const DefaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'x-csrf-token': csrfToken,
};

const COHORT_MIDDLEWARE_PATH = `${GEN3_API}/cohort-middleware`;
export const SourcesEndpoint = `${COHORT_MIDDLEWARE_PATH}/sources`;
export const CohortsEndpoint = `${COHORT_MIDDLEWARE_PATH}/cohortdefinition-stats/by-source-id`;
export const CohortsOverlapEndpoint = `${COHORT_MIDDLEWARE_PATH}/cohort-stats/check-overlap/by-source-id/`;

export const TeamProjectsEndpoint = 'api/teamprojects';
export const SubmitWorkflowEndpoint = `${GEN3_WORKFLOW_API}/submit`; // TODO - use src/lib/AnalysisApps/Results/Utils/workflowApi.ts instead...
