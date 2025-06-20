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

const Input = () => {
  const { selectedRowData } = useContext(SharedContext);
  if (!selectedRowData) {
    throw new Error('selectedRowData is not defined in SharedContext');
  }
  const { name, uid } = selectedRowData;
  const { data, error, isLoading } = getDataForWorkflowArtifact(name, uid, 'attrition_json_index');

  const displayTopSection = () => (
    <section className='results-top'>
      <div className='GWASResults-flex-row'>
        <div className='GWASResults-flex-col'>
          <DetailPageHeader pageTitle={'Input Details'} />
        </div>
      </div>
    </section>
  );

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

  if (error) {
    return (
      <React.Fragment>
        {displayTopSection()}
        <LoadingErrorMessage
          data-testid='loading-error-message'
          message={`Error getting attrition table data due to status: ${error}`}
        />
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
