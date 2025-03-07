import { useGetAuthzMappingsQuery } from '@gen3/core';

interface TeamProject {
  teamName: string;
}


interface UseTeamProjectsResult {
  teams: Array<TeamProject>;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: unknown;
}

/**
 * A hook that retrieves and processes team project data by querying authorization mappings.
 * It filters the retrieved data to only include mappings associated with specific services
 * under the `/gwas_projects/` path and formats them into a list of team projects.
 *
 * @returns {UseTeamProjectsResult} An object containing the list of team projects,
 * and flags indicating the loading, success, or error state of the data retrieval process.
 */
export const useTeamProjects = (): UseTeamProjectsResult => {
  const {
    data: authorizationMappings,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetAuthzMappingsQuery();

  let teams : Array<TeamProject> =  [];

  if (isSuccess && authorizationMappings) {
    const entries = Object.entries(authorizationMappings);
     teams = entries
      .filter(
        ([key, value]) =>
          key.startsWith('/gwas_projects/') &&
          Array.isArray(value) &&
          value.some(
            (e) => e.service === 'atlas-argo-wrapper-and-cohort-middleware',
          ),
      )
      .map(([key]) => ({ teamName: key }));
  }

  return { teams : teams, isFetching, isSuccess, isError, error };
};
