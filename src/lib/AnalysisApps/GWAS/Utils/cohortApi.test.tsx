import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from '@jest/globals';
import { renderHook } from '../../../test/test-utils';

import {
  GEN3_COHORT_MIDDLEWARE_API,
  useGetCohortDefinitionsQuery,
  useGetSourcesQuery,
  useGetSourceIdQuery,
  useGetCovariatesQuery,
  useGetCovariateStatsQuery,
  useGetConceptStatsByHareSubsetQuery,
  useGetHistogramInfoQuery,
  useGetSimpleOverlapInfoQuery,
} from './cohortApi';

const server = setupServer();

const sourcesData = {
  sources: [{ source_id: 123, source_name: 'MVP-batch19000101' }],
};

const cohortDefinitionAndStatsData = {
  cohort_definitions_and_stats: [
    {
      cohort_definition_id: 573,
      cohort_name: 'team2 - test new cohort - catch all',
      size: 70240,
    },
    {
      cohort_definition_id: 559,
      cohort_name: 'test new cohort - catch all',
      size: 70240,
    },
    {
      cohort_definition_id: 574,
      cohort_name: 'team2 - test new cohort - medium + large',
      size: 23800,
    },
    {
      cohort_definition_id: 575,
      cohort_name: 'team2 - test new cohort - small',
      size: 80,
    },
  ],
};

const covariatesData = { covariates: [{ concept_id: 123, concept_name: 'Test Covariate' }] };
const covariateStatsData = { some_stat: 42 };
const conceptStatsData = { concept_stats: [{ size: 10, concept_name: 'Example' }] };
const histogramData = { bins: [{ start: 0, end: 10, personCount: 5 }] };
const overlapData = { cohort_overlap: { case_control_overlap: 15 } };

describe('cohortApi', () => {
  beforeAll(() => {
    // Start the interception.
    server.listen();
  });
  beforeEach(() => {});

  afterEach(() => {
    // Remove any handlers you may have added
    // in individual tests (runtime handlers).
    server.resetHandlers();
  });

  afterAll(() => {
    // Disable request interception and clean up.
    server.close();
  });

  it('fetches and returns cohort definitions successfully', async () => {
    const sourceId = '1234567890';
    const selectedTeamProject = 'project2';

    server.use(
      http.get(
        `${GEN3_COHORT_MIDDLEWARE_API}/cohortdefinition-stats/by-source-id/1234567890/by-team-project`,
        ({ request }) => {
          const url = new URL(request.url);
          const project = url.searchParams.get('team-project');
          if (project !== 'project2') {
            return new HttpResponse(null, {
              status: 403,
            });
          }
          return HttpResponse.json(cohortDefinitionAndStatsData);
        },
      ),
    );

    const { result } = renderHook(() =>
      useGetCohortDefinitionsQuery({ sourceId, selectedTeamProject }),
    );

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());

    expect(result.current).toMatchObject({
      isError: false,
      isFetching: false,
      isSuccess: true,
      isLoading: false,
      data: cohortDefinitionAndStatsData,
    });
  });

  it('returns error if project id not accessible ', async () => {
    const sourceId = '1234567890';
    const selectedTeamProject = 'project2345';

    server.use(
      http.get(
        `${GEN3_COHORT_MIDDLEWARE_API}/cohortdefinition-stats/by-source-id/1234567890/by-team-project`,
        () => {
          return new HttpResponse(null, {
            status: 403,
          });
        },
      ),
    );

    const { result } = renderHook(() =>
      useGetCohortDefinitionsQuery({ sourceId, selectedTeamProject }),
    );

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isError).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: true,
      isFetching: false,
      isSuccess: false,
      isLoading: false,
      error: { status: 403 },
    });
  });

  it('test for successful useGetSources ', async () => {
    server.use(
      http.get(`${GEN3_COHORT_MIDDLEWARE_API}/sources`, () => {
        return HttpResponse.json(sourcesData);
      }),
    );

    const { result } = renderHook(() => useGetSourcesQuery());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: false,
      isFetching: false,
      isSuccess: true,
      isLoading: false,
      data: sourcesData,
    });
  });

  it('test for useGetSources handling error', async () => {
    server.use(
      http.get(`${GEN3_COHORT_MIDDLEWARE_API}/sources`, () => {
        return new HttpResponse(null, {
          status: 500,
        });
      }),
    );

    const { result } = renderHook(() => useGetSourcesQuery());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isError).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: true,
      isFetching: false,
      isSuccess: false,
      isLoading: false,
      error: { status: 500 },
    });
  });

  it('test for successful useGetSourceIdQuery ', async () => {
    server.use(
      http.get(`${GEN3_COHORT_MIDDLEWARE_API}/sources`, () => {
        return HttpResponse.json(sourcesData);
      }),
    );

    const { result } = renderHook(() => useGetSourceIdQuery());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: false,
      isFetching: false,
      isSuccess: true,
      isLoading: false,
      data: 123,
    });
  });

  it('test for useGetSourceIdQuery error', async () => {
    server.use(
      http.get(`${GEN3_COHORT_MIDDLEWARE_API}/sources`, () => {
        return HttpResponse.json({ } );
      }),
    );

    const { result } = renderHook(() => useGetSourceIdQuery());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isError).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: true,
      isFetching: false,
      isSuccess: false,
      isLoading: false,
      data: undefined,
    });
  });
  it('fetches and returns covariates successfully', async () => {
    server.use(
      http.post(`${GEN3_COHORT_MIDDLEWARE_API}/concept/by-source-id/123/by-type`, () => {
        return HttpResponse.json(covariatesData);
      })
    );

    const { result } = renderHook(() => useGetCovariatesQuery('123'));

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current.data).toEqual(covariatesData);
  });

  it('fetches and returns covariate stats successfully', async () => {
    server.use(
      http.post(`${GEN3_COHORT_MIDDLEWARE_API}/concept-stats/by-source-id/123/by-cohort-definition-id/456`, () => {
        return HttpResponse.json(covariateStatsData);
      })
    );

    const { result } = renderHook(() =>
      useGetCovariateStatsQuery({ sourceId: 123, cohortDefinitionId: '456', selectedCovariateIds: ['789'] })
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current.data).toEqual(covariateStatsData);
  });

  it('fetches and returns concept stats by HARE subset successfully', async () => {
    server.use(
      http.post(`${GEN3_COHORT_MIDDLEWARE_API}/concept-stats/by-source-id/123/by-cohort-definition-id/456/breakdown-by-concept-id/2000007027`, () => {
        return HttpResponse.json(conceptStatsData);
      })
    );

    const { result } = renderHook(() =>
      useGetConceptStatsByHareSubsetQuery({ sourceId: 123, cohortDefinitionId: 456, subsetCovariates: '', outcome: [] })
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current.data).toEqual(conceptStatsData);
  });

  it('fetches and returns histogram info successfully', async () => {
    server.use(
      http.post(`${GEN3_COHORT_MIDDLEWARE_API}/histogram/by-source-id/123/by-cohort-definition-id/456/by-histogram-concept-id/789`, () => {
        return HttpResponse.json(histogramData);
      })
    );

    const { result } = renderHook(() =>
      useGetHistogramInfoQuery({ sourceId: 123, cohortId: 456, selectedCovariates: [], selectedConceptId: 789 })
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current.data).toEqual(histogramData);
  });

  it('fetches and returns simple overlap info successfully', async () => {
    server.use(
      http.post(`${GEN3_COHORT_MIDDLEWARE_API}/cohort-stats/check-overlap/by-source-id/123/by-cohort-definition-ids/456/789`, () => {
        return HttpResponse.json(overlapData);
      })
    );

    const { result } = renderHook(() =>
      useGetSimpleOverlapInfoQuery({ sourceId: 123, cohortAId: 456, cohortBId: 789, selectedCovariates: [] })
    );

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current.data).toEqual(overlapData);
  });
});
