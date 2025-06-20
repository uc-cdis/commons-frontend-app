import { GEN3_API, gen3Api } from '@gen3/core';
import {
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
const TAGS = 'GWASWorkflow';

export const GEN3_WORKFLOW_API =
  process.env.NEXT_PUBLIC_GEN3_WORLFLOW_API || `${GEN3_API}/ga4gh/wes/v2`;

export const ResultsApiTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

// Response Types

export interface WorkflowResponse {
  name: string;
  phase: string;
  gen3username: string;
  submittedAt: string; // ISO date string
  startedAt: string; // ISO date string
  finishedAt: string; // ISO date string
  wf_name: string;
  gen3teamproject: string;
  uid: string;
}

interface WorkflowArguments {
  parameters: WorkflowParameter[];
}

interface WorkflowOutputs {
  parameters: WorkflowParameter[];
}

interface WorkflowParameter {
  name: string;
  value: string;
  default?: string;
  enum?: string[];
}

interface WorkflowDetails {
  name: string;
  phase: string;
  gen3username: string;
  submittedAt: string;
  startedAt: string;
  finishedAt: string;
  wf_name: string;
  arguments: WorkflowArguments;
  progress: string;
  outputs: WorkflowOutputs;
  gen3teamproject: string;
}

export interface PresignedUrl {
  url: string;
}

export interface WorkflowMonthly {
  workflow_run: number;
  workflow_limit: number;
}

// Requests Types

interface WorkflowDetailsRequest {
  workflowName: string;
  workflowUid: string;
}

interface PresignedUrlWorkflowArtifactRequest extends WorkflowDetailsRequest {
  artifactName: string;
  retrieveData?: boolean;
}


/**
 * Asynchronously fetches a presigned URL from a specified API endpoint.
 *
 * @param {string} uid - The unique identifier for the required resource.
 * @param {any} fetchWithBQ - A function to perform the fetching operation, typically integrated with an API client.
 * @param {string} [method='download'] - The HTTP method or operation type, defaulting to 'download'.
 * @returns {Promise<{data?: PresignedUrl, error?: FetchBaseQueryError}>} - Returns an object containing the data with the presigned URL if successful, or an error if the operation fails.
 */
export const getPresignedUrl = async (
  uid: string,
  fetchWithBQ: any,
  method: string = 'download',
) => {
  const result = await fetchWithBQ({
    url: `${GEN3_API}/user/data/${method}/${uid}`, // TODO Replace with GEN3_FENCE_API
  });
  return result.data
    ? { data: result.data as PresignedUrl }
    : { error: result.error as FetchBaseQueryError };
};

/**
 * Asynchronously fetches data from a given URL using a provided fetch function.
 *
 * This function sends a request to the specified URL using the `fetchWithBQ` function and retrieves the response.
 * If an error occurs during the request, it returns an object containing the error.
 * If the request is successful, it returns an object containing the response data.
 *
 * @param {string} url - The URL to fetch data from.
 * @param {Function} fetchWithBQ - A function responsible for making the request, typically a fetch or query utility.
 * @returns {Promise<Object>} A promise that resolves to an object containing either the fetched data or an error.
 */
export const getUrlData = async (url: string, fetchWithBQ: any) => {
  const response = await fetchWithBQ({
    url,
  });
  if (response.error) {
    return { error: response.error as FetchBaseQueryError };
  }
  return { data: response.data };
};

/**
 * Provides endpoint definitions for interacting with the workflow-related APIs.
 *
 * The `workflowApi` object includes multiple API endpoints for managing workflow data, retrieving detailed information about workflows, retrying workflows, and obtaining presigned URLs or direct artifact data.
 *
 * Endpoints:
 * - `getWorkflowDetails`: Retrieves details for a specific workflow by its name and unique identifier (UID).
 * - `getWorkflows`: Fetches the list of workflows for the currently specified team project.
 * - `getWorkflowsMonthly`: Retrieves monthly statistics about user workflows.
 * - `retryWorkflow`: Initiates a retry for a specific workflow using its name and UID.
 * - `getPresignedUrlOrDataForWorkflowArtifact`: Provides a presigned URL or retrieves direct data for a specified workflow artifact.
 *
 */
const workflowApi = ResultsApiTags.injectEndpoints({
  endpoints: (builder) => ({
    getWorkflowDetails: builder.query<WorkflowDetails, WorkflowDetailsRequest>({
      query: ({ workflowName, workflowUid }) =>
        `${GEN3_WORKFLOW_API}/status/${workflowName}?uid=${workflowUid}`,
    }),
    getWorkflows: builder.query<WorkflowResponse, string>({
      query: (currentTeamProject) =>
        `${GEN3_WORKFLOW_API}/workflows?team_projects=${currentTeamProject}`,
    }),
    getWorkflowsMonthly: builder.query<WorkflowMonthly, void>({
      query: () => `${GEN3_WORKFLOW_API}/workflows/user-monthly`,
    }),
    retryWorkflow: builder.mutation({
      query: ({ workflowName, workflowUid }) =>
        `${GEN3_WORKFLOW_API}/retry/${workflowName}?uid=${workflowUid}`,
    }),
    getPresignedUrlOrDataForWorkflowArtifact: builder.query({
      async queryFn(
        args: PresignedUrlWorkflowArtifactRequest,
        _queryApi,
        _extraOptions,
        fetchWithBQ,
      ) {
        const { artifactName, workflowName, workflowUid, retrieveData } = args;

        const workflowDetailsResponse = await fetchWithBQ({
          url: `${GEN3_WORKFLOW_API}/status/${workflowName}?uid=${workflowUid}`,
          credentials: 'include',
        });

        if (workflowDetailsResponse.error) {
          return {
            error: workflowDetailsResponse.error as FetchBaseQueryError,
          };
        }

        const results = (
          workflowDetailsResponse.data as WorkflowDetails
        )?.outputs?.parameters.filter((entry) => entry.name === artifactName);
        if (!results || results.length !== 1) {
          return {
            error: {
              error: `Expected 1 artifact with name ${artifactName}, found: ${
                results?.length ?? 'undefined'
              }`,
              status: 'CUSTOM_ERROR',
            } as FetchBaseQueryError,
          };
        }

        let parsedValue;
        try {
          parsedValue = JSON.parse(results[0].value);
          if (!parsedValue?.did) {
            throw new Error(`Missing "did" field in artifact value.`);
          }
        } catch {
          return {
            error: {
              error: 'Failed to parse artifact value or missing "did"',
              status: 'CUSTOM_ERROR',
            } as FetchBaseQueryError,
          };
        }

        const presignedUrl = await getPresignedUrl(
          parsedValue.did,
          fetchWithBQ,
        );

        if (!retrieveData || presignedUrl.data?.url === undefined)
          return presignedUrl;

        return await getUrlData(presignedUrl.data.url, fetchWithBQ);
      },
    }),
  }),
});

export const {
  useGetWorkflowDetailsQuery,
  useGetWorkflowsQuery,
  useLazyGetWorkflowsQuery,
  useGetPresignedUrlOrDataForWorkflowArtifactQuery,
  useLazyGetPresignedUrlOrDataForWorkflowArtifactQuery,
  useGetWorkflowsMonthlyQuery,
  useRetryWorkflowMutation,
} = workflowApi;
