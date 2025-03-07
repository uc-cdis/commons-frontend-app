import { gen3Api, GEN3_API } from '@gen3/core';

const TAGS = 'GWASApp';
export const GEN3_COHORT_MIDDLEWARE_API =   process.env.NEXT_PUBLIC_GEN3_COHORT_MIDDLEWARE_API || `${GEN3_API}/cohort-middleware`;

const hareConceptId = 2000007027;

export const gwasCohortApiTags = gen3Api.enhanceEndpoints({
  addTagTypes: [TAGS],
});

// Types for API calls

export interface CohortOverlap {
  cohort_overlap: {
    case_control_overlap: number;
  };
}

interface ConceptOutcome {
  size: number;
  variable_type: string;
  concept_id: number;
  concept_name: string;
}

interface Covariates {
  variable_type: string;
  provided_name: string;
  cohort_ids: [number, number];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CovariateStats extends Covariates {
  cohort_sizes: [number, number];
  cohort_names: [string, string];
}

interface ConceptStatsByHareSubset {
  sourceId: number;
  cohortDefinitionId: number;
  subsetCovariates: string;
  outcome: Array<ConceptOutcome>;
}

export interface GWASCohortDefinition {
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

interface CovariateConceptTypeAndId {
  concept_type: string;
  concept_id: number;
}

interface CovariateInformation extends CovariateConceptTypeAndId {
  prefixed_concept_id: string;
  concept_code: string;
  concept_name: string;
}

/**
 * Query Parameters for the rtkQueries below
 */

interface CohortDefinitionQueryParams {
  sourceId: string;
  selectedTeamProject: string;
}

interface CovariateQueryParams {
  sourceId: number;
  cohortDefinitionId: string;
  selectedCovariateIds: Array<string>;
}

interface HistogramQueryParams {
  sourceId: number;
  cohortId: number;
  selectedCovariates: Array<Covariates>;
  outcome?: ConceptOutcome;
  selectedConceptId: number;
}

interface OverlapQueryParams {
  sourceId: number;
  cohortAId: number;
  cohortBId: number;
  selectedCovariates: Array<Covariates>;
  outcome?: ConceptOutcome;
}

/**
 * Responses from queries below
 */
export interface GWASCohortDefinitionResponse {
  cohort_definitions_and_stats: Array<GWASCohortDefinition>;
}

interface SourcesResponse {
  sources: Array<{ source_id: string; source_name: string }>;
}

interface CovariateResponse {
  covariates: Array<CovariateInformation>;
}

export interface GWASHistogramBin {
  start: number;
  end: number;
  personCount: number;
}

export interface GWASHistogramResponse {
  bins: Array<GWASHistogramBin>;
}

/**
 * Adds a filter to the given covariate array to exclude individuals
 * who are members of both specified cohorts from analysis. This ensures that
 * overlapping members in the two cohorts are filtered out based on a
 * custom dichotomous variable.
 *
 * @param {number} cohortId - The identifier for the first cohort.
 * @param {number} otherCohortId - The identifier for the second cohort.
 * @param {Array<Covariates>} covariateArray - An array of covariate objects to which
 *                                             the new filter will be added.
 * @returns {Array<Covariates>} A new array of covariate objects with the added filter.
 */
export const addCDFilter = (
  cohortId: number,
  otherCohortId: number,
  covariateArray: Array<Covariates>,
) => {
  // adding an extra filter on top of the given covariateArr
  // to ensure that any person that belongs to _both_ cohorts
  // [cohortId, otherCohortId] also gets filtered out:
  const covariateRequest = [...covariateArray];
  const cdFilter: Covariates = {
    variable_type: 'custom_dichotomous',
    cohort_ids: [cohortId, otherCohortId],
    provided_name:
      'auto_generated_extra_item_to_filter_out_case_control_overlap',
  };
  covariateRequest.push(cdFilter);
  return covariateRequest;
};

/**
 * gwasCohortApi is a configuration object used to interact with the GWAS Cohort API.
 * It provides endpoints to query and transform data related to cohort definitions, sources,
 * covariates, histogram data, and cohort overlaps. Each endpoint is implemented as a query using
 * RTK Query `builder.query` and supports fetching and transforming of data for specific use cases.
 *
 * Endpoints included:
 * - getCohortDefinitions: Fetches cohort definitions and statistics by source ID and team project.
 * - getSources: Retrieves available data sources from the middleware API.
 * - getSourceId: Extracts the single source ID if only one source is available.
 * - getCovariates: Fetches covariates based on source ID and predefined concept types.
 * - getCovariateStats: Retrieves statistics for selected covariates for a given cohort definition.
 * - getConceptStatsByHareSubset: Fetches concept statistics for a subset of covariates broken down by HARE concept.
 * - getHistogramInfo: Retrieves histogram data for selected covariates, outcomes, and cohorts.
 * - getSimpleOverlapInfo: Checks the overlap between two cohorts for selected covariates and outcomes.
 */
export const gwasCohortApi = gwasCohortApiTags.injectEndpoints({
  endpoints: (builder) => ({
    getCohortDefinitions: builder.query<
      GWASCohortDefinitionResponse,
      CohortDefinitionQueryParams
    >({
      query: ({ sourceId, selectedTeamProject }) =>
        `${GEN3_COHORT_MIDDLEWARE_API}/cohortdefinition-stats/by-source-id/${sourceId}/by-team-project?team-project=${selectedTeamProject}`,
      transformResponse: (response: Record<string, never>) => {
        // confirm data is valid
        if (!response || typeof response !== 'object') {
          throw new Error('Invalid response format');
        }
        if (!('cohort_definitions_and_stats' in response)) {
          throw new Error('Missing field cohort_definitions_and_stats');
        }
        return {
          cohort_definitions_and_stats: response.cohort_definitions_and_stats,
        };
      },
    }),
    getSources: builder.query<SourcesResponse, void>({
      query: () => `${GEN3_COHORT_MIDDLEWARE_API}/sources`,
    }),
    getSourceId: builder.query<string, void>({
      query: () => `${GEN3_COHORT_MIDDLEWARE_API}/sources`,
      transformResponse: (response: SourcesResponse) => {
        if (Array.isArray(response?.sources) && response.sources.length === 1) {
          return response.sources[0].source_id;
        } else {
          const message = `Data source received in an invalid format:
        ${JSON.stringify(response?.sources)}`;
          throw new Error(message);
        }
      },
    }),
    getCovariates: builder.query<CovariateResponse, string>({
      query: (sourceId: string) => ({
        url: `${GEN3_COHORT_MIDDLEWARE_API}/concept/by-source-id/${sourceId}/by-type`,
        method: 'POST',
        body: JSON.stringify({
          ConceptTypes: ['MVP Continuous'],
        }),
      }),
    }),
    getCovariateStats: builder.query<string, CovariateQueryParams>({
      query: ({ sourceId, cohortDefinitionId, selectedCovariateIds }) => ({
        url: `${GEN3_COHORT_MIDDLEWARE_API}/concept-stats/by-source-id/${sourceId}/by-cohort-definition-id/${cohortDefinitionId}`,
        method: 'POST',
        body: JSON.stringify({
          ConceptIds: selectedCovariateIds,
        }),
      }),
    }),
    getConceptStatsByHareSubset: builder.query<
      string,
      ConceptStatsByHareSubset
    >({
      query: ({ outcome, cohortDefinitionId, subsetCovariates, sourceId }) => {
        const variablesPayload = {
          variables: [outcome, ...subsetCovariates],
        };
        return {
          url: `${GEN3_COHORT_MIDDLEWARE_API}/concept-stats/by-source-id/${sourceId}/by-cohort-definition-id/${cohortDefinitionId}/breakdown-by-concept-id/${hareConceptId}`,
          method: 'POST',
          body: JSON.stringify(variablesPayload),
        };
      },
    }),
    getHistogramInfo: builder.query<
      GWASHistogramResponse,
      HistogramQueryParams
    >({
      query: ({
        sourceId,
        cohortId,
        selectedCovariates,
        selectedConceptId,
        outcome = {},
      }) => {
        const variablesPayload = {
          variables: [
            ...selectedCovariates,
            outcome,
            // add extra filter to make sure we only count persons that have a HARE group as well:
            {
              variable_type: 'concept',
              concept_id: hareConceptId,
            },
          ].filter(Boolean), // filter out any undefined or null items (e.g. in some
          // scenarios "outcome" and "selectedCovariates" are still null and/or empty)
        };

        return {
          url: `${GEN3_COHORT_MIDDLEWARE_API}/histogram/by-source-id/${sourceId}/by-cohort-definition-id/${cohortId}/by-histogram-concept-id/${selectedConceptId}`,
          method: 'POST',
          body: JSON.stringify(variablesPayload),
        };
      },
    }),
    getSimpleOverlapInfo: builder.query<CohortOverlap, OverlapQueryParams>({
      query: ({
        sourceId,
        cohortAId,
        cohortBId,
        selectedCovariates,
        outcome = {},
      }) => {
        const variablesPayload = {
          variables: [
            ...selectedCovariates,
            outcome,
            // add extra filter to make sure we only count persons that have a HARE group as well:
            {
              variable_type: 'concept',
              concept_id: hareConceptId,
            },
          ].filter(Boolean), // filter out any undefined or null items (e.g. in some
          // scenarios "outcome" and "selectedCovariates" are still null and/or empty)
        };

        return {
          url: `${GEN3_COHORT_MIDDLEWARE_API}/cohort-stats/check-overlap/by-source-id/${sourceId}/by-cohort-definition-ids/${cohortAId}/${cohortBId}`,
          method: 'POST',
          body: JSON.stringify(variablesPayload),
        };
      },
    }),
  }),
});

// TODO: check if fetchConceptStatsByHareSubsetCC, fetchConceptStatsByHareForCaseControl, and fetchCovariateStats

export const {
  useGetCohortDefinitionsQuery,
  useGetSourcesQuery,
  useGetSourceIdQuery,
  useGetCovariatesQuery,
  useGetCovariateStatsQuery,
  useGetConceptStatsByHareSubsetQuery,
  useGetHistogramInfoQuery,
  useGetSimpleOverlapInfoQuery,
} = gwasCohortApi;
