import React, { useContext } from 'react';
import { Loader } from '@mantine/core';
//import { useQuery } from 'react-query';
import DetailPageHeader from '../../Components/DetailPageHeader/DetailPageHeader';
import JobDetails from './JobDetails/JobDetails';
import AttritionTableWrapper from './AttritionTable/AttrtitionTableWrapper';
import SharedContext from '../../Utils/SharedContext';
import { getDataForWorkflowArtifact } from '../../Utils/gwasWorkflowApi';
//import queryConfig from '../../../SharedUtils/QueryConfig';
import LoadingErrorMessage from '../../../SharedUtils/LoadingErrorMessage/LoadingErrorMessage';
import useSWR from 'swr';
import { GEN3_API } from '@gen3/core';
import { GwasWorkflowEndpoint } from '../../../SharedUtils/Endpoints';

const Input = () => {
  const { selectedRowData } = useContext(SharedContext);
  if (!selectedRowData) {
    throw new Error('selectedRowData is not defined in SharedContext');
  }
  console.log('selectedRowData', selectedRowData);
  const { name, uid } = selectedRowData;
  const { data, error, isLoading } = getDataForWorkflowArtifact(name, uid, 'attrition_json_index');
  console.log('data 2', data, error, isLoading);

  const displayTopSection = () => (
    <section className='results-top'>
      <div className='GWASResults-flex-row'>
        <div className='GWASResults-flex-col'>
          <DetailPageHeader pageTitle={'Input Details'} />
        </div>
      </div>
    </section>
  );

  if (error) {
    return (
      <React.Fragment>
        {displayTopSection()}
        <LoadingErrorMessage
          data-testid='loading-error-message'
          message='Error getting attrition table data due to status'
        />
      </React.Fragment>
    );
  }

  if (isLoading) {
    return (
      <React.Fragment>
        {displayTopSection()}
        <div className='spinner-container' data-testid='spinner'>
          <Loader />
        </div>
      </React.Fragment>
    );
  }

  if (
    !data
    || data.length === 0
    || data[0].table_type !== 'case'
  ) {
    return (
      <React.Fragment>
        {displayTopSection()}
        <LoadingErrorMessage message='Error Getting Attrition Table Data' />
      </React.Fragment>
    );
  }

  return (
    <div className='results-view'>
      {displayTopSection()}
      <AttritionTableWrapper data={data} />
      <JobDetails attritionTableData={data} />
    </div>
  );
};
export default Input;
