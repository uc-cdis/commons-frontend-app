import React, { useReducer, Reducer } from 'react';
import reducer, {State, Action} from '../../Utils/StateManagement/reducer';
import InitializeCurrentState from '../../Utils/StateManagement/InitializeCurrentState';
import SelectSource from './SelectSource';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SourcesEndpoint } from '@/lib/AnalysisApps/SharedUtils/Endpoints';
import { http, HttpResponse } from 'msw';

const meta: Meta<typeof SelectSource> = {
  title: 'PLP/SelectSource',
  component: SelectSource,
};

export default meta;
type Story = StoryObj<typeof SelectSource>;

const SelectSourceWithHooks = () => {
  const [state, dispatch] = useReducer(reducer, InitializeCurrentState());

  return (
    <SelectSource
      team={state.selectedTeamProject}
      selectedSourceId={state.sourceId}
      dispatch={dispatch}
     />
  );
};
const TestSourcesData = {
  sources: [
    {
      source_id: 0,
      source_name: 'test 0',
      description: "Synthea version:  3.3.0   SyntheaTM is a Synthetic Patient Population Simulator. The goal is to output synthetic, realistic (but not real), patient data and associated health records in a variety of formats.",
			CurrentTeamProjectAccessible: false
    },
    {
      source_id: 1,
      source_name: 'test 1',
      description: "Synthea version:  3.3.0   SyntheaTM is a Synthetic Patient Population Simulator. The goal is to output synthetic, realistic (but not real), patient data and associated health records in a variety of formats.",
			CurrentTeamProjectAccessible: true
    },
    {
      source_id: 2,
      source_name: 'test 2',
      description: "short description",
			CurrentTeamProjectAccessible: true
    },
    {
      source_id: 2,
      source_name: 'test 3',
			CurrentTeamProjectAccessible: true
    },
    {
      source_id: 3,
      source_name: 'test 4'
			//no CurrentTeamProjectAccessible -> should work the same as CurrentTeamProjectAccessible: false
    }
  ]
}

export const SelectSourceMockedSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(SourcesEndpoint + '?team-project=:team', async () => {
          return HttpResponse.json(TestSourcesData);
        }),
      ]
      }},
  render: () => <SelectSourceWithHooks />, // see https://storybook.js.org/docs/writing-stories
};
