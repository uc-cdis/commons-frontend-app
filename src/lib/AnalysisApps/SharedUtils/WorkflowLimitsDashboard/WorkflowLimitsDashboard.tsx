import React from 'react';
import LoadingErrorMessage from '../LoadingErrorMessage/LoadingErrorMessage';
import { Loader, Progress, Title } from '@mantine/core';
import { GEN3_API } from '@gen3/core';
import useSWR from 'swr';

const WorkflowLimitsDashboard = () => {
  const supportEmail = 'support@gen3.org';
  const refetchInterval = 5000;

  const { data, error, isLoading, isValidating } = useSWR(
    `${GEN3_API}/ga4gh/wes/v2/workflows/user-monthly`,
    (...args) => fetch(...args).then((res) => res.json()),
    { refreshInterval: refetchInterval },
  );

  const workflowLimitInfoIsValid = (data: any) => {
    // Check if data is an object
    if (typeof data !== 'object' || data === null) {
      return false;
    }
    // validate data contains expected keys and they're numeric
    // and workflow limit is greater than 0
    if (
      typeof data?.workflow_run !== 'number'
      || typeof data?.workflow_limit !== 'number'
      || !(data.workflow_limit > 0)
    ) {
      return false;
    }
    return true;
  };


  if (!(data || error) && (isLoading || isValidating)) {
    return (
      <div className='flex items-center justify-center bg-white p-4 rounded border border-gray-200'>
        <Loader /> 
        <span className='text-left ml-2'>
          Retrieving user workflow information.
          <br />
          Please wait...
        </span>
      </div>
    );
  }
  if (error) {
    return (
      <div className='flex bg-white p-4 rounded border border-gray-200'>
        <LoadingErrorMessage message={'Unable to gather user workflow information.'} />
      </div>
    );
  }
  if (!workflowLimitInfoIsValid(data)) {
    return (
      <div className='flex bg-white p-4 rounded border border-gray-200'>
        <LoadingErrorMessage message={'Invalid server response for user workflow information.'} />
      </div>
    );
  }
  const workflowRun = data.workflow_run;
  const workflowLimit = data.workflow_limit;

  return (
    <React.Fragment>
      <div className='flex bg-white p-4 rounded border border-gray-200'>
        <div className='pr-4'>
          <Title order={3}>Monthly Workflow Limit</Title>
          <div data-testid='workflow-limits-message'>
            <strong>{workflowRun} used</strong> from {workflowLimit} Limit
          </div>
        </div>
        <div className='grow relative'>
          {workflowRun >= workflowLimit && (
            <div>
              <div
                className='error-message'
                data-testid='workflow-exceeds-message'
              >
                You have exceeded your monthly workflow limit. Please contact
                support for assistance:{' '}
                <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.
              </div>
            </div>
          )}
          <Progress
            size="lg"
            radius="md"
            aria-label='Monthly Workflow Limit'
            value={(workflowRun / workflowLimit) * 100}
            color={workflowRun >= workflowLimit ? 'red' : 'blue'}
            className='absolute bottom-0 w-full'
          />
        </div>
      </div>
    </React.Fragment>
  );
};

export default WorkflowLimitsDashboard;
