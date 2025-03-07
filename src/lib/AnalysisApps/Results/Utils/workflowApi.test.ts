// workflowApi.test.ts
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { renderHook } from '../../../test/test-utils';
import {
  GEN3_WORKFLOW_API,
  getPresignedUrl,
  useGetWorkflowDetailsQuery,
  useGetWorkflowsQuery,
  useGetWorkflowsMonthlyQuery,
  useGetPresignedUrlOrDataForWorkflowArtifactQuery,
} from './workflowApi';
import { GEN3_API } from '@gen3/core';

const GEN3_FENCE_API = `${GEN3_API}/user`; // TODO replace with GEN3_FENCE_API from gff core when updated

const server = setupServer();

import {
  FetchArgs,
  FetchBaseQueryError,
  FetchBaseQueryMeta,
  QueryReturnValue,
} from '@reduxjs/toolkit/query';
import {
  describe,
  expect,
  it,
  afterEach,
  jest,
  beforeAll,
  beforeEach,
  afterAll,
} from '@jest/globals';

type MaybePromise<T> = T | Promise<T>;

type FetchMockResponse = { url: string };

type RTKQFetchFunction = (
  arg: string | FetchArgs,
) => MaybePromise<
  QueryReturnValue<FetchMockResponse, FetchBaseQueryError, FetchBaseQueryMeta>
>;

describe('getPresignedUrl', () => {
  const fetchWithBQMock = jest.fn<RTKQFetchFunction>();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a presigned URL when the API call is successful', async () => {
    const mockUid = '12345';
    const mockMethod = 'download';
    const mockUrl = 'https://example.com/presigned-url';
    fetchWithBQMock.mockReturnValue({
      data: { url: mockUrl },
    });

    const result = await getPresignedUrl(mockUid, fetchWithBQMock, mockMethod);

    expect(fetchWithBQMock).toHaveBeenCalledWith({
      url: `${GEN3_FENCE_API}/data/${mockMethod}/${mockUid}`,
    });
    expect(result).toEqual({ data: { url: mockUrl } });
  });

  it('should return an error when the API call fails', async () => {
    const mockUid = '12345';
    fetchWithBQMock.mockReturnValue({
      error: { status: 500, data: undefined },
    });

    const result = await getPresignedUrl(mockUid, fetchWithBQMock);

    expect(fetchWithBQMock).toHaveBeenCalledWith({
      url: `${GEN3_FENCE_API}/data/download/${mockUid}`,
    });
    expect(result).toEqual({ error: { status: 500, data: undefined } });
  });

  it('should default to the "download" method if no method is provided', async () => {
    const mockUid = '12345';
    const mockUrl = 'https://example.com/presigned-url';
    fetchWithBQMock.mockReturnValue({
      data: { url: mockUrl },
    });

    await getPresignedUrl(mockUid, fetchWithBQMock);

    expect(fetchWithBQMock).toHaveBeenCalledWith({
      url: `${GEN3_FENCE_API}/data/download/${mockUid}`,
    });
  });
});

describe('workflowApi', () => {
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

  const detailsData = {
    name: 'gwas-workflow-1000001',
    phase: 'Succeeded',
    gen3username: 'user996@example.com',
    submittedAt: '2024-12-23T04:23:53Z',
    startedAt: '2024-12-23T04:23:53Z',
    finishedAt: '2025-01-07T02:32:30Z',
    wf_name: 'test 1',
    arguments: {
      parameters: [
        {
          name: 'n_pcs',
          value: '3',
        },
        {
          name: 'variables',
          value:
            '[{"variable_type": "concept", "concept_id": 5350450469, "concept_name": "Theta Baseline Index"}, {"variable_type": "concept", "concept_id": 1321922298, "concept_name": "Delta Parameter Reading"}, {"variable_type": "concept", "concept_id": 3723846140, "concept_name": "Eta Composite Score"}]',
        },
        {
          name: 'out_prefix',
          default: 'genesis_vadc',
          value: '3859895161',
        },
        {
          name: 'outcome',
          value:
            '{"variable_type": "concept", "concept_id": 3723846140, "concept_name": "Eta Composite Score"}',
        },
        {
          name: 'hare_population',
          value: 'Group C',
        },
        {
          name: 'hare_concept_id',
          default: '8361572894',
          value: '8361572894',
        },
        {
          name: 'maf_threshold',
          value: '0.01',
        },
        {
          name: 'imputation_score_cutoff',
          value: '0.3',
        },
        {
          name: 'template_version',
          value: 'gwas-template-genesisupdate',
        },
        {
          name: 'source_id',
          value: '12',
        },
        {
          name: 'source_population_cohort',
          value: '2356',
        },
        {
          name: 'workflow_name',
          value: 'test 1',
        },
        {
          name: 'team_project',
          value: '/research_projects/PROJECT_BETA',
        },
        {
          name: 'genome_build',
          default: 'hg19',
          value: 'hg19',
          enum: ['hg38', 'hg19'],
        },
        {
          name: 'pca_file',
          value: '/commons-data/pcs.RData',
        },
        {
          name: 'relatedness_matrix_file',
          value: '/commons-data/KINGmatDeg3.RData',
        },
        {
          name: 'widget_table',
          value: '/commons-data/mvp_widget_table.csv',
        },
        {
          name: 'related_samples',
          value: '/commons-data/related_samples.csv',
        },
        {
          name: 'n_segments',
          value: '0',
        },
        {
          name: 'segment_length',
          default: '2000',
          value: '2000',
        },
        {
          name: 'variant_block_size',
          default: '1024',
          value: '100',
        },
        {
          name: 'mac_threshold',
          value: '0',
        },
        {
          name: 'gds_files',
          value:
            '["/commons-data/gds/chr1.merged.vcf.gz.gds", "/commons-data/gds/chr2.merged.vcf.gz.gds", "/commons-data/gds/chr3.merged.vcf.gz.gds", "/commons-data/gds/chr4.merged.vcf.gz.gds", "/commons-data/gds/chr5.merged.vcf.gz.gds", "/commons-data/gds/chr6.merged.vcf.gz.gds", "/commons-data/gds/chr7.merged.vcf.gz.gds", "/commons-data/gds/chr8.merged.vcf.gz.gds", "/commons-data/gds/chr9.merged.vcf.gz.gds", "/commons-data/gds/chr10.merged.vcf.gz.gds", "/commons-data/gds/chr11.merged.vcf.gz.gds", "/commons-data/gds/chr12.merged.vcf.gz.gds", "/commons-data/gds/chr13.merged.vcf.gz.gds", "/commons-data/gds/chr14.merged.vcf.gz.gds", "/commons-data/gds/chr15.merged.vcf.gz.gds", "/commons-data/gds/chr16.merged.vcf.gz.gds", "/commons-data/gds/chr17.merged.vcf.gz.gds", "/commons-data/gds/chr18.merged.vcf.gz.gds", "/commons-data/gds/chr19.merged.vcf.gz.gds", "/commons-data/gds/chr20.merged.vcf.gz.gds", "/commons-data/gds/chr21.merged.vcf.gz.gds", "/commons-data/gds/chr22.merged.vcf.gz.gds", "/commons-data/gds/chrX.merged.vcf.gz.gds"]',
        },
        {
          name: 'internal_api_env',
          default: 'default',
          value: 'default',
        },
      ],
    },
    progress: '1618/1620',
    outputs: {
      parameters: [
        {
          name: 'gwas_archive_index',
          value:
            '{"baseid": "af4fb252-d773-4f9b-9a4f-5a7251c54b46", "did": "dg.TST0/9aee8147-97e7-4b07-9690-bf26e953ed2a", "rev": "ed3d2bcf"}',
        },
        {
          name: 'manhattan_plot_index',
          value:
            '{"baseid": "7637a41e-cbec-4ba2-8556-3b8a506498bb", "did": "dg.TST0/e41e7a85-baba-4a37-8871-45bc3c375c7f", "rev": "c60b974f"}',
        },
        {
          name: 'attrition_json_index',
          value:
            '{"baseid": "a13b170e-e8c1-4750-831f-1b1587bd960a", "did": "dg.TST0/08803c69-3ef9-46c9-b025-fd12e0ed6d23", "rev": "8ab52ddc"}',
        },
        {
          name: 'pheweb_manhattan_json_index',
          value:
            '{"baseid": "6129ca03-c9c1-4b27-b410-6773fac5bcce", "did": "dg.TST0/4dda3cba-636d-400b-ac70-3c8872c4d4ca", "rev": "ec930d6b"}',
        },
        {
          name: 'pheweb_qq_json_index',
          value:
            '{"baseid": "4135bb4b-3634-4fce-8bf6-fa533b253585", "did": "dg.TST0/5d458b10-ff4c-4920-8d28-9f2956e6dec8", "rev": "7dfb5d18"}',
        },
      ],
    },
    gen3teamproject: '/research_projects/PROJECT_BETA',
  };

  it('test getWorkflowDetails', async () => {
    server.use(
      http.get(`${GEN3_WORKFLOW_API}/status/123`, () => {
        return HttpResponse.json(detailsData);
      }),
    );

    const { result } = renderHook(() =>
      useGetWorkflowDetailsQuery({ workflowName: '123', workflowUid: '456' }),
    );

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: false,
      isFetching: false,
      isSuccess: true,
      isLoading: false,
      data: detailsData,
    });
  });

  it('test getWorkflowDetails error', async () => {
    server.use(
      http.get(`${GEN3_WORKFLOW_API}/status/123`, () => {
        return new HttpResponse(null, {
          status: 500,
        });
      }),
    );

    const { result } = renderHook(() =>
      useGetWorkflowDetailsQuery({ workflowName: '123', workflowUid: '456' }),
    );

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

  it('test getWorkflows', async () => {
    const data = [
      {
        name: 'gwas-workflow-5824608351',
        phase: 'Succeeded',
        submittedAt: '2025-01-21T19:42:42Z',
        startedAt: '2025-01-21T19:42:42Z',
        finishedAt: '2025-01-21T22:10:05Z',
        wf_name: 'test 1',
        gen3teamproject: '/synthetic_project',
        uid: '96816116-0928-4f57-97be-a7d26921b71e',
      },
      {
        name: 'gwas-workflow-9136614877',
        phase: 'Failed',
        submittedAt: '2025-01-21T18:51:35Z',
        startedAt: '2025-01-21T18:51:35Z',
        finishedAt: '2025-01-21T18:55:23Z',
        wf_name: 'test 1',
        gen3teamproject: '/synthetic_project',
        uid: '2c17fc87-ffea-4b00-bd67-9f8246928905',
      },
    ];

    server.use(
      http.get(`${GEN3_WORKFLOW_API}/workflows`, () => {
        return HttpResponse.json(data);
      }),
    );

    const { result } = renderHook(() => useGetWorkflowsQuery('123'));

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: false,
      isFetching: false,
      isSuccess: true,
      isLoading: false,
      data: data,
    });
  });

  it('test getWorkflowsMonthly', async () => {
    const data = { workflow_run: 0, workflow_limit: 50 };

    server.use(
      http.get(`${GEN3_WORKFLOW_API}/workflows/user-monthly`, () => {
        return HttpResponse.json(data);
      }),
    );

    server.use(
      http.get(`${GEN3_WORKFLOW_API}/workflows/user-monthly`, () => {
        return HttpResponse.json(data);
      }),
    );

    const { result } = renderHook(() => useGetWorkflowsMonthlyQuery());

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: false,
      isFetching: false,
      isSuccess: true,
      isLoading: false,
      data: data,
    });
  });

  it('test useGetPresignedUrlOrDataForWorkflowArtifactQuery to get a URL', async () => {
    const urlData = { url: 'https://awspresignedurl.com' };
    server.use(
      http.get(`${GEN3_WORKFLOW_API}/status/123`, () => {
        return HttpResponse.json(detailsData);
      }),
      http.get(
        `${GEN3_FENCE_API}/data/download/dg.TST0/9aee8147-97e7-4b07-9690-bf26e953ed2a`,
        () => {
          return HttpResponse.json(urlData);
        },
      ),
    );

    const { result } = renderHook(() =>
      useGetPresignedUrlOrDataForWorkflowArtifactQuery({
        workflowName: '123',
        workflowUid: '456',
        artifactName: 'gwas_archive_index',
      }),
    );

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current).toMatchObject({
      isError: false,
      isFetching: false,
      isSuccess: true,
      isLoading: false,
      data: urlData,
    });
  });

  it('test useGetPresignedUrlOrDataForWorkflowArtifactQuery can`t find artifact', async () => {
    const urlData = { url: 'https://awspresignedurl.com' };
    server.use(
      http.get(`${GEN3_WORKFLOW_API}/status/123`, () => {
        return HttpResponse.json(detailsData);
      }),
      http.get(
        `${GEN3_FENCE_API}/data/download/dg.TST0/9aee8147-97e7-4b07-9690-bf26e953ed2a`,
        () => {
          return HttpResponse.json(urlData);
        },
      ),
    );

    const { result } = renderHook(() =>
      useGetPresignedUrlOrDataForWorkflowArtifactQuery({
        workflowName: '123',
        workflowUid: '456',
        artifactName: 'gwas_archive_index_not_found',
      }),
    );

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isError).toBeTruthy());

    expect(result.current).toMatchObject({
      isError: true,
      isFetching: false,
      isSuccess: false,
      isLoading: false,
      data: undefined,
      error: {
        error:
          'Expected 1 artifact with name gwas_archive_index_not_found, found: 0',
        status: 'CUSTOM_ERROR',
      },
    });
  });

  it('test useGetPresignedUrlOrDataForWorkflowArtifactQuery test 401', async () => {
    const urlData = { url: 'https://awspresignedurl.com' };

    server.use(
      http.get(`${GEN3_WORKFLOW_API}/status/123`, () => {
        return HttpResponse.json(detailsData);
      }),
      http.get(
        `${GEN3_FENCE_API}/data/download/dg.TST0/9aee8147-97e7-4b07-9690-bf26e953ed2a`,
        () => {
          return HttpResponse.json(urlData);
        },
      ),
      http.get('https://awspresignedurl.com/', () => {
        return new HttpResponse(null, {
          status: 401,
        });
      }),
    );

    const { result } = renderHook(() =>
      useGetPresignedUrlOrDataForWorkflowArtifactQuery({
        workflowName: '123',
        workflowUid: '456',
        artifactName: 'gwas_archive_index',
        retrieveData: true,
      }),
    );

    expect(result.current.isFetching).toBe(true);

    await waitFor(() => expect(result.current.isError).toBeTruthy());

    expect(result.current).toMatchObject({
      isError: true,
      isFetching: false,
      isSuccess: false,
      isLoading: false,
      error: { status: 401 },
    });
  });
});
