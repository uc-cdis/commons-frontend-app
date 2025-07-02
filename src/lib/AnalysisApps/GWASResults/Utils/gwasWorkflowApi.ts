import React, { useState } from 'react';
import { GEN3_API } from '@gen3/core';
import { GEN3_WORKFLOW_API } from '../../SharedUtils/Endpoints';

export const getPresignedUrl = async (did: string, method: string) => {
  const urlPath = `${GEN3_API}/user/data/${method}/${did}`;
  const response = await fetch(urlPath).then((res) => res.json());
  return response?.url;
};

export interface WorkflowDetailsType {
  name: string;
  phase: string;
  gen3username: string;
  submittedAt: string;
  startedAt: string;
  finishedAt: string;
  wf_name: string;
  arguments: {
    parameters: Array<{
      name: string;
      value: string;
    }>;
  };
  progress: string;
  outputs: {
    parameters: Array<{
      name: string;
      value: string;
    }>;
  };
  gen3teamproject: string;
}

export const getWorkflowDetails = async (
  workflowName: string,
  workflowUid: string,
) => {
  // query argo-wrapper endpoint to get the list of artifacts produced by the workflow:
  const endPoint = `${GEN3_WORKFLOW_API}/status/${workflowName}?uid=${workflowUid}`;
  const errorMessage = 'An error has occured while fetching workflow details';
  const response: WorkflowDetailsType = await fetch(endPoint)
    .then((res) => res.json())
    .then((data) => data)
    .catch((error) => { throw new Error(`${errorMessage}: ${error}`); });
  if (!response) {
    throw new Error(`${errorMessage}: empty response`);
  }
  return response;
};

/* Removed

export const fetchGwasWorkflows = async () => {
  const currentTeamProject = localStorage.getItem('teamProject');
  const workflowsEndpoint = `${gwasWorkflowPath}workflows?team_projects=${currentTeamProject}`;
  const response = await fetch(workflowsEndpoint, { headers });
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return response.json();

  became

  const { data, error, isLoading, isValidating } = useSWR(
    `${GEN3_API}/${GwasWorkflowEndpoint}?team_projects=${selectedTeamProject}`,
    (...args) => fetch(...args).then((res) => tranformDates(testData)),
  );
};*/

export const fetchPresignedUrlForWorkflowArtifact = async (
  workflowName: string,
  workflowUid: string,
  artifactName: string,
) => {
  const response = await getWorkflowDetails(workflowName, workflowUid);
  if (!response.outputs.parameters) {
    throw new Error('Found no artifacts for workflow');
  }
  // filter the list to find the artifact matching the given name:
  const results = response.outputs.parameters.filter((entry) => entry.name === artifactName);
  if (results.length !== 1) {
    throw new Error(`Expected 1 artifact with name ${artifactName}, found: ${results.length}`);
  }
  // return a pre-signed "download ready" URL to the artifact:
  return getPresignedUrl(JSON.parse(results[0].value).did, 'download');
};

const getDataFromUrl = async (
  url: string,
) => {
  const response = await fetch(url);
  if (!response || !response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return response.json();
};
export interface AttritionTableJSONconcept_breakdownType {
  concept_value_name: string;
  persons_in_cohort_with_value: number;
}
export interface AttritionTableJSONrowsType {
  type: string;
  name: string;
  size: number;
  concept_breakdown: AttritionTableJSONconcept_breakdownType[];
}
export interface AttritionTableJSONType {
  table_type: string;
  rows: AttritionTableJSONrowsType[];
}

export const getDataForWorkflowArtifact = (
  workflowName: string,
  workflowUid: string,
  artifactName: string,
) => {
  const [loading, setLoading] = useState(true);
  const [presignedUrl, setPresignedUrl] = useState<string>();
  const [data, setData] = useState<AttritionTableJSONType[]>();
  const [error, setError] = useState();
  if (!presignedUrl && loading){
    fetchPresignedUrlForWorkflowArtifact(
      workflowName,
      workflowUid,
      artifactName
    )
      .then((url) => {
        setPresignedUrl(url) ;
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }
  if (presignedUrl && loading) {
    getDataFromUrl(presignedUrl).then((data) => {
      setData(data);
      setLoading(false);
    })
    .catch((err) => {
      setError(err);
      setLoading(false);
    });
  }
  return {isLoading: loading, data: data, error: error};
};

/*export const retryWorkflow = async (
  workflowName: string,
  workflowUid: string,
) => {
  // query argo-wrapper endpoint to retry a failed workflow:
  const endPoint = `${gwasWorkflowPath}retry/${workflowName}?uid=${workflowUid}`;
  const response = await fetch(endPoint, { method: 'POST', headers });
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return response.text();
};
*/
