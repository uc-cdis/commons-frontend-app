// teamProjectHooks.test.ts
import { waitFor } from '@testing-library/react';
import { useTeamProjects } from './teamProjectHooks';
import {
  describe,
  expect,
  it,
  beforeAll,
  afterAll,
  afterEach,
  beforeEach,
} from '@jest/globals';
import { renderHook } from '../../../../test/test-utils';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { GEN3_AUTHZ_API } from '@gen3/core';

const server = setupServer();

describe('useTeamProjects', () => {
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

  it('fetches and returns team project roles successfully', async () => {
    server.use(
      http.get(`${GEN3_AUTHZ_API}/mapping`, () => {
        return HttpResponse.json({
          '/gwas_projects/project1': [{ abc: 'def' }],
          '/gwas_projects/project2': [
            { abc: 'def' },
            {
              service: 'atlas-argo-wrapper-and-cohort-middleware',
              method: 'access',
            },
          ],
          '/other/project3': [{ abc: 'def' }],
        });
      }),
    );

    const { result } = renderHook(() => useTeamProjects());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current).toEqual({
      isError: false,
      isFetching: false,
      isSuccess: true,
      teams: [
        {
          teamName: '/gwas_projects/project2',
        },
      ],
    });
  });

  it('fetches and returns isError', async () => {
    server.use(
      http.get(`${GEN3_AUTHZ_API}/mapping`, () => {
        // throw error
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const { result } = renderHook(() => useTeamProjects());
    expect(result.current.isFetching).toBe(true);
    await waitFor(() => expect(result.current.isError).toBeTruthy());
    expect(result.current).toEqual({
      isError: true,
      isFetching: false,
      isSuccess: false,
      teams: [],
      error: { status: 500, data: null }
    });
  });
});
