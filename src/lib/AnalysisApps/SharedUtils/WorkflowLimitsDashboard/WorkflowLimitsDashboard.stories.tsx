import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import { GEN3_API } from '@gen3/core';
import WorkflowLimitsDashboard from './WorkflowLimitsDashboard';


const meta: Meta<typeof WorkflowLimitsDashboard> = {
  title: 'SharedUtils/WorkflowLimitsDashboard',
  component: WorkflowLimitsDashboard,
};
export default meta;

type Story = StoryObj<typeof WorkflowLimitsDashboard>;

const oneSecondInMilliseconds = 1000;
const fifteenMinutesInMilliseconds = 900000;
const exceedsWorkflowLimitObject = { workflow_run: 50, workflow_limit: 50 };
const invalidWorkflowLimitObject = { invalidKey: 123 };

let requestCount = 0;
const getValidMockWorkflowLimitsInfo = () => {
  requestCount++;
  return { workflow_run: requestCount, workflow_limit: 50 };
};

export const MockedSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_API}/ga4gh/wes/v2/workflows/user-monthly`,
          async () => {
            await delay(oneSecondInMilliseconds);
            return HttpResponse.json(getValidMockWorkflowLimitsInfo());
          }
        ),
      ],
    },
  }
};

export const MockedSuccessOverLimit: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_API}/ga4gh/wes/v2/workflows/user-monthly`,
          async () => {
            await delay(oneSecondInMilliseconds * 2);
            return HttpResponse.json(exceedsWorkflowLimitObject);
          }
        ),
      ],
    },
  }
};

export const MockedLoading: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_API}/ga4gh/wes/v2/workflows/user-monthly`,
          async () => {
            await delay(fifteenMinutesInMilliseconds);
            return HttpResponse.json(getValidMockWorkflowLimitsInfo());
          }
        ),
      ],
    },
  }
};

export const MockedError500: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_API}/ga4gh/wes/v2/workflows/user-monthly`,
          async () => {
            await delay(oneSecondInMilliseconds);
            return new HttpResponse(invalidWorkflowLimitObject, {
              status: 500,
            });
          }
        ),
      ],
    },
  }
};

export const MockedErrorInvalidData: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_API}/ga4gh/wes/v2/workflows/user-monthly`,
          async () => {
            await delay(oneSecondInMilliseconds);
            return HttpResponse.json(invalidWorkflowLimitObject);
          }
        ),
      ],
    },
  }
};
