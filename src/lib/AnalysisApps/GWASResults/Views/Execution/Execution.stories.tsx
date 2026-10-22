import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { coreStore } from '@gen3/core';
import { Meta, StoryObj } from '@storybook/nextjs-vite';
import SharedContext from '../../Utils/SharedContext';
import Execution from './Execution';
import { http, HttpResponse, delay } from 'msw';
import { GEN3_WORKFLOW_API } from '../../../SharedUtils/Endpoints';

const selectedRowData = {
  finishedAt: new Date('2022-02-15T14:00:00Z'),
  gen3teamproject: 'test_project',
  gen3username: 'test_user',
  name: 'gwas-workflow-787571537',
  phase: 'Failed',
  startedAt: new Date('2022-02-15T13:00:00Z'),
  submittedAt: new Date('2022-02-15T12:00:00Z'),
  uid: '4b125c09-9712-486f-bacd-ec1451aae935',
  wf_name: 'user created name',
};
const { name, uid } = selectedRowData;

const meta: Meta<typeof Execution> = {
  title: 'Results/Views/Execution',
  component: Execution,
  decorators: [
    (Story) => {
      const [currentView, setCurrentView] = useState('Execution');
      return (
        <Provider store={coreStore}>
          <SharedContext.Provider
            value={{
              selectedRowData: selectedRowData,
              setCurrentView,
            }}
          >
            <div className='GWASResults'>
              <Story />
            </div>
          </SharedContext.Provider>
        </Provider>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof Execution>;

const MockedFailureJSON = [
  {
    name: 'gwas-workflow-7875715375',
    step_name: 'attrition-table',
    step_template: 'get-attrition-table',
    error_interpreted: "Timeout occurred while fetching attrition table information."
  },
  {
    name: 'gwas-workflow-7875715375.get-pheno-csv',
    step_name: 'pheno-csv',
    step_template: 'get-pheno-csv',
    error_interpreted: ""
  },
];
/* api responce as of 2/10/2026
  name: string;
  node_type: string;
  node_phase: string;
  step_name: string;
  step_template: string;
  error_interpreted: string;
*/

export const MockedFailure: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/logs/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return HttpResponse.json(MockedFailureJSON);
          }
        ),
      ],
    },
  }
};

export const MockedSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/logs/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            // Successful executions return an empty array
            return HttpResponse.json([]);
          }
        ),
      ],
    },
  }
};

export const MockedErrorObject: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/logs/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return HttpResponse.json({ error: 'Mocked Server error response' });
          }
        ),
      ],
    },
  }
};

export const MockedError403Response: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/logs/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return new HttpResponse(null, {
              status: 403,
            });
          }
        ),
      ],
    },
  }
};
