import React from 'react';
import { AttritionTable } from './AttritionTable';
import { CohortsEndpoint, SourcesEndpoint, CohortsOverlapEndpoint } from '@/lib/AnalysisApps/SharedUtils/Endpoints';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse } from 'msw';
import { SourceContextProvider } from '../../../../SharedUtils/Source';

const meta: Meta<typeof AttritionTable> = {
  title: 'PLP/AttritionTable',
  component: AttritionTable,
};

export default meta;
type Story = StoryObj<typeof AttritionTable>;

const TestSourcesData = {
  sources: [
    {
      source_id: 22,
      source_name: 'Synthetic OMOP',
    },
  ],
}

const TestOverlapData = {
  cohort_overlap: { case_control_overlap: 111 }
}

const TestStatsData1 = {
  cohort_definition_and_stats: { size: 112 }
}

const TestStatsData2 = {
  cohort_definition_and_stats: { size: 107 }
}

const TestStatsData3 = {
  cohort_definition_and_stats: { size: 105 }
}

interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

const selectedStudyPopulationCohort: cohort = {
  cohort_definition_id: 123,
  cohort_name: 'test123',
  size: 123,
}

const selectedOutcomeCohort: cohort = {
  cohort_definition_id: 456,
  cohort_name: 'test456',
  size: 456,
}
const AttritionTableWithHooks = () => {

  return (
    <SourceContextProvider>
      <AttritionTable
        dispatch={() => {return null}}
        selectedStudyPopulationCohort={selectedStudyPopulationCohort}
        datasetObservationWindow={365}
        selectedOutcomeCohort={selectedOutcomeCohort}
        outcomeObservationWindow={365}
        percentageOfDataToUseAsTest={25}
      />
    </SourceContextProvider>
  );
};

export const AttritionTableMockedSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(SourcesEndpoint, async () => {
          return HttpResponse.json(TestSourcesData);
        }),
        http.get(CohortsOverlapEndpoint + '/:sourceId/by-cohort-definition-ids/:cohort1_definition_id/:cohort2_definition_id', async () => {
          // simulate 2s delay
          await new Promise((res) => setTimeout(res, 2000));
          return HttpResponse.json(TestOverlapData);
        }),
        http.get(CohortsEndpoint + '/:sourceId/by-cohort-definition-id/:cohort1_definition_id/by-observation-window/:observationwindow', async () => {
          return HttpResponse.json(TestStatsData1);
        }),
        http.get(CohortsEndpoint + '/:sourceId/by-cohort-definition-ids/:cohort1_definition_id/:cohort2_definition_id/by-observation-window-1st-cohort/:observationwindow', async () => {
          return HttpResponse.json(TestStatsData2);
        }),
        http.get(CohortsEndpoint + '/:sourceId/by-cohort-definition-ids/:cohort1_definition_id/:cohort2_definition_id/by-observation-window-1st-cohort/:observationwindow/by-outcome-window-2nd-cohort/:outcomeWindow2ndCohort', async () => {
          return HttpResponse.json(TestStatsData3);
        }),
      ],
    },
  },
  render: () => <AttritionTableWithHooks />, // see https://storybook.js.org/docs/writing-stories
};
