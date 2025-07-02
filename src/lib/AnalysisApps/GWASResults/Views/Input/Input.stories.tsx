import React, { useEffect, useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
//import { QueryClient, QueryClientProvider } from 'react-query';
import SharedContext from '../../Utils/SharedContext';
import Input from './Input';
import { http, HttpResponse, delay } from 'msw';
import MockedSuccessJSON from '../../TestData/InputViewData/MockedSuccessJSON';
import MockedFailureJSON from '../../TestData/InputViewData/MockedFailureJSON';
import AttritionTableJSON from '../../TestData/InputViewData/AttritionTableJSON';
import { GEN3_API } from '@gen3/core';
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

const meta: Meta<typeof Input> = {
  title: 'Results/Views/Input',
  component: Input,
  decorators: [
    (Story) => {
      const [currentView, setCurrentView] = useState('Input');
      /*useEffect(() => {
        alert(`setCurrentView called with ${currentView}`);
      }, [currentView]);*/
      return (
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
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof Input>;

export const MockedFailure: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/status/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return HttpResponse.json(MockedFailureJSON);
          }
        ),
      ],
    },
  }
};

const dummyS3BucketLocation =
  'https://some-bucket.s3.amazonaws.com/gwas-workflow-123/test_pheweb.json';
export const MockedSuccess: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/status/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return HttpResponse.json(MockedSuccessJSON);
          }
        ),
        http.get(
          `${GEN3_API}/user/data/download/733993c2-3238-4779-8b4b-a3d744dadba1`,
          async () => {
            await delay(500);
            return HttpResponse.json({
                url: dummyS3BucketLocation + '?X-Amz-Algorithm=AWS4-ETC',
              });
          }
        ),
        http.get(dummyS3BucketLocation, async () => {
            await delay(500);
            return HttpResponse.json(AttritionTableJSON);
          }),
      ],
    },
  },
};
export const MockedErrorNoData: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/status/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return HttpResponse.json(MockedSuccessJSON);
          }
        ),
        http.get(
          `${GEN3_API}/user/data/download/733993c2-3238-4779-8b4b-a3d744dadba1`,
          async () => {
            await delay(500);
            return HttpResponse.json({
                url: dummyS3BucketLocation + '?X-Amz-Algorithm=AWS4-ETC',
              });
          }
        ),
        http.get(dummyS3BucketLocation, async () => {
            await delay(1000);
            return HttpResponse.json([]);
          }),
      ],
    },
  },
};
export const MockedError500Response: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/status/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return new HttpResponse(null, {
              status: 500,
            });
          }
        ),
      ],
    },
  },
};
export const MockedError403Response: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/status/${name}?uid=${uid}`,
          async () => {
            await delay(100);
            return new HttpResponse(null, {
              status: 403,
            });
          }
        ),
      ],
    },
  },
};
