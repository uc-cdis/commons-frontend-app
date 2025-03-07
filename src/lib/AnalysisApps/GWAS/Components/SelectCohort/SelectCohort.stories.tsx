import React, { useReducer } from 'react';
import SelectCohort from './SelectCohort';
import reducer from '../../Utils/StateManagement/reducer';
import ACTIONS from '../../Utils/StateManagement/Actions';
import initialState from '../../Utils/StateManagement/InitialState';
import { CohortsEndpoint } from '@/lib/AnalysisApps/SharedUtils/Endpoints';
import type { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';

const meta: Meta<typeof SelectCohort> = {
  title: 'GWASAPP/SelectCohort',
  component: SelectCohort,
  parameters: { // TODO remove this and fix accessibility
    a11y: {
      disable: true,
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectCohort>;

const TestData = [
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
];

const SelectCohortWithHooks = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleStudyPopulationSelect = (selectedRow: number) => {
    dispatch({
      type: ACTIONS.SET_SELECTED_STUDY_POPULATION_COHORT,
      payload: selectedRow,
    });
  };
  return (
    <SelectCohort
      selectedTeamProject=""
      selectedCohort={state.selectedStudyPopulationCohort}
      handleCohortSelect={handleStudyPopulationSelect}
    />
  );
};

export const MockedSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(CohortsEndpoint, () => {
          return HttpResponse.json(TestData);
        }),
      ],
    },
  },
  render: () => <SelectCohortWithHooks />, // see https://storybook.js.org/docs/writing-stories
};

export const MockedError: Story = {
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
