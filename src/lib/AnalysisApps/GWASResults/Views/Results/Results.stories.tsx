import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { http, HttpResponse, delay } from 'msw';
import SharedContext from '../../Utils/SharedContext';
import Results from './Results';
import imageFile from '../../TestData/dummy_result1.png'; // not a Manhattan plot...but will do for now
import manhattanPheWebJsonFile from '../../TestData/Diagrams/ManhattanPlotTestDataLarge.json';
import qqPlotJsonFile from '../../TestData/Diagrams/QQPlotData/LargeQQPlotTestData.json';
import WorkflowStatusResponse from '../../TestData/WorkflowDetailsOnlyPng';
import WorkflowStatusResponse2 from '../../TestData/WorkflowDetailsPngAndPheWebJson';
import { GEN3_WORKFLOW_API } from '../../../SharedUtils/Endpoints';
import { GEN3_API } from '@gen3/core';

const selectedRowData1 = { name: 'Test Name', uid: '123456' };
const selectedRowData2 = { name: 'Test_Name2', uid: '7891011' };
const selectedRowData3 = { name: 'Test_Name3', uid: '999111' };
const selectedRowData4 = { name: 'Test_Name4', uid: '999222' };
const selectedRowData5 = { name: 'Test Name5', uid: '123456789' };
const selectedRowData6 = { name: 'Test_Name6', uid: '9991116' };

const meta: Meta<typeof Results> = {
  title: 'Results/Views/Results',
  component: Results,
  decorators: [
    (Story, { parameters }) => {
      const [currentView, setCurrentView] = useState('Results');
      /*useEffect(() => {
        alert(`setCurrentView called with ${currentView}`);
      }, [currentView]);*/
      const { selectedRowData } = parameters;
      console.log('selectedRowData in decorator:', selectedRowData);
      return (
          <SharedContext.Provider
            value={{
              selectedRowData: selectedRowData,
              setCurrentView,
            }}
          >
      <Story />
    </SharedContext.Provider>
      );
    },
  ],
};
export default meta;

type Story = StoryObj<typeof Results>;

export const MockedSuccess: Story = {
  parameters: {
    selectedRowData: selectedRowData1,
    msw: {
      handlers: [
        http.get(
          `${GEN3_WORKFLOW_API}/status/:workflowname`,
          async ({ params }) => {
            const { argowrapperpath, workflowname } = params;
            console.log('argowrapperpath', argowrapperpath);
            console.log('workflowname', workflowname);
            await delay(500);
            return HttpResponse.json(WorkflowStatusResponse);
          }
        ),
        http.get(
          `${GEN3_API}/user/data/download/:index_did`,
          async ({ params }) => {
            const { index_did } = params;
            console.log('index_did', index_did);
            console.log('imageFile', imageFile);
            await delay(500);
            return HttpResponse.json({
                url:
                  index_did === '999-8888-7777-aaaa123456-777777'
                    ? imageFile.src
                    : imageFile.src + '.zip',
              }); // note: the .zip here is fake and although its download will be initiated in this storybook, it won't really work or download any .zip file
          }
        ),
      ],
    },
  },
};

/*const dummyS3BucketLocation =
  'https://some-bucket.s3.amazonaws.com/gwas-workflow-123/test_pheweb.json';
const dummyS3BucketLocation2 =
  'https://some-bucket.s3.amazonaws.com/gwas-workflow-1234/test_pheweb.json';
export const MockedSuccess2 = MockTemplate.bind({});
MockedSuccess2.args = selectedRowData5;

const determineEndPointURL = (index_did) => {
  // note: the .json and .zip here are fake urls
  if (index_did === '222-8888-7777-bbbb123456-777777') {
    return dummyS3BucketLocation + '?X-Amz-Algorithm=AWS4-ETC';
  } else if (index_did === '999-8888-7777-cccc123456-777777') {
    return dummyS3BucketLocation2 + '?X-Amz-Algorithm=AWS4-ETC';
  } else {
    return 'manhattanPheWebJsonFile.zip';
  }
};

MockedSuccess2.parameters = {
  msw: {
    handlers: [
      rest.get(
        'http://:argowrapperpath/ga4gh/wes/v2/status/:workflowname',
        (req, res, ctx) => {
          const { argowrapperpath, workflowname } = req.params;
          console.log(argowrapperpath);
          console.log(workflowname);
          return res(ctx.delay(500), ctx.json(WorkflowStatusResponse2));
        }
      ),
      rest.get(
        'http://:server/user/data/download/:index_did',
        (req, res, ctx) => {
          const { index_did } = req.params;
          console.log(index_did);
          return res(
            ctx.delay(500),
            ctx.json({
              url: determineEndPointURL(index_did),
            })
          );
        }
      ),
      rest.get(dummyS3BucketLocation, (req, res, ctx) => {
        const { index_did } = req.params;
        console.log('pheWeb JSON DID:', index_did);
        return res(ctx.delay(500), ctx.json(manhattanPheWebJsonFile));
      }),

      rest.get(dummyS3BucketLocation2, (req, res, ctx) => {
        const { index_did } = req.params;
        console.log('QQ did:', index_did);
        console.log('qqPlotJSON', qqPlotJsonFile);
        return res(ctx.delay(500), ctx.json(qqPlotJsonFile));
      }),
    ],
  },
};

export const MockedError = MockTemplate.bind({});
MockedError.args = selectedRowData2;
MockedError.parameters = {
  msw: {
    handlers: [
      rest.get(
        'http://:argowrapperpath/ga4gh/wes/v2/status/:workflowname',
        (_, res, ctx) => res(ctx.delay(800), ctx.status(403))
      ),
    ],
  },
};

export const MockedError2WhenPng = MockTemplate.bind({});
MockedError2WhenPng.args = selectedRowData3;
MockedError2WhenPng.parameters = {
  msw: {
    handlers: [
      rest.get(
        'http://:argowrapperpath/ga4gh/wes/v2/status/:workflowname',
        (req, res, ctx) => {
          const { argowrapperpath, workflowname } = req.params;
          console.log(argowrapperpath);
          console.log(workflowname);
          return res(ctx.delay(500), ctx.json(WorkflowStatusResponse));
        }
      ),
      rest.get(
        'http://:server/user/data/download/:manhattan_plot_index_did',
        (req, res, ctx) => {
          const { manhattan_plot_index_did } = req.params;
          console.log(manhattan_plot_index_did);
          return res(ctx.delay(500), ctx.json({ url: imageFile + '.invalid' }));
        }
      ),
    ],
  },
};

export const MockedError2WhenPheweb = MockTemplate.bind({});
MockedError2WhenPheweb.args = selectedRowData6;
MockedError2WhenPheweb.parameters = {
  msw: {
    handlers: [
      rest.get(
        'http://:argowrapperpath/ga4gh/wes/v2/status/:workflowname',
        (req, res, ctx) => {
          const { argowrapperpath, workflowname } = req.params;
          console.log(argowrapperpath);
          console.log(workflowname);
          return res(ctx.delay(500), ctx.json(WorkflowStatusResponse2));
        }
      ),
      rest.get(
        'http://:server/user/data/download/:manhattan_plot_index_did',
        (req, res, ctx) => {
          const { manhattan_plot_index_did } = req.params;
          console.log(manhattan_plot_index_did);
          return res(ctx.delay(500), ctx.json({ someerror: 'error' }));
        }
      ),
    ],
  },
};

export const MockedError3 = MockTemplate.bind({});
MockedError3.args = selectedRowData4;
MockedError3.parameters = {
  msw: {
    handlers: [
      rest.get(
        'http://:argowrapperpath/ga4gh/wes/v2/status/:workflowname',
        (req, res, ctx) => {
          const { argowrapperpath, workflowname } = req.params;
          console.log(argowrapperpath);
          console.log(workflowname);
          return res(
            ctx.delay(500),
            ctx.json({ some_dummy: 'and-wrong-response-format' })
          );
        }
      ),
    ],
  },
};*/
