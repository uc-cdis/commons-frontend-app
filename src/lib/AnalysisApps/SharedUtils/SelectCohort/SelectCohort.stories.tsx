import React, { useReducer, Reducer } from 'react';
import SelectCohort from './SelectCohort';
import reducer, {State, Action} from '../../PLP/Utils/StateManagement/reducer';
import ACTIONS from '../../PLP/Utils/StateManagement/Actions';
import initialState from '../../PLP/Utils/StateManagement/InitialState';
import { CohortsEndpoint, SourcesEndpoint } from '@/lib/AnalysisApps/SharedUtils/Endpoints';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import { SourceContextProvider } from '../Source';

const meta: Meta<typeof SelectCohort> = {
  title: 'Generic/SelectCohort',
  component: SelectCohort,
  parameters: { // TODO remove this and fix accessibility
    a11y: {
      disable: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectCohort>;

const TestData = {
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
      }
  ]
};

const TestSourcesData = {
  sources: [
    {
      source_id: 22,
      source_name: 'Synthetic OMOP',
    },
  ],
}

interface cohort { // TODO - centralize this interface
  cohort_definition_id: number;
  cohort_name: string;
  size: number;
}

const SelectCohortWithHooks = () => {
  const [state, dispatch] = useReducer<Reducer<State, Action>>(reducer, initialState);

  const handleStudyPopulationSelect = (selectedCohort: cohort) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_STUDY_POPULATION_COHORT,
      payload: selectedCohort,
    });
  };
  return (
    <SourceContextProvider>
      <SelectCohort
        selectedTeamProject=""
        selectedCohort={state.selectedStudyPopulationCohort}
        handleCohortSelect={handleStudyPopulationSelect}
      />
    </SourceContextProvider>
  );
};

export const GenericSelectCohortMockedSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(CohortsEndpoint + '/:sourceId/by-team-project?team-project=:selectedTeamProject', async () => {
          return HttpResponse.json(TestData);
        }),
        http.get(SourcesEndpoint, async () => {
          return HttpResponse.json(TestSourcesData);
        }),
      ],
    },
  },
  render: () => <SelectCohortWithHooks />, // see https://storybook.js.org/docs/writing-stories
};

export const GenericSelectCohortMockedError: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(CohortsEndpoint, async () => {
          await delay(800);
          return new HttpResponse(null, {
            status: 403,
          });
        }),
      ],
    },
  },
  render: () => <SelectCohortWithHooks />,
};
