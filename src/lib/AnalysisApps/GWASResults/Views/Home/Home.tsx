import React from 'react';
// import { Spin } from 'antd';
// import { useQuery } from 'react-query';
// import PropTypes from 'prop-types';
import HomeTable from './HomeTable/HomeTable';
// import LoadingErrorMessage from '../../../SharedUtils/LoadingErrorMessage/LoadingErrorMessage';
// import { Loader } from '@mantine/core';
import ManageColumns from './ManageColumns/ManageColumns';
// import { fetchGwasWorkflows } from '../../Utils/gwasWorkflowApi';

const Home = ({ selectedTeamProject }: { selectedTeamProject: string }) => {
  /*const refetchInterval = 5000;
     const { data, status } = useQuery(
    ['workflows', selectedTeamProject],
    fetchGwasWorkflows,
    {
      refetchInterval,
    },
  ); */

  const data = {};

  /* if (status === 'loading') {
    return (
      <React.Fragment>
        <div className="spinner-container">
          <Loader /> Retrieving the list of workflows.
          <br />
          Please wait...
        </div>
      </React.Fragment>
    );
  }
  if (status === 'error') {
    return <LoadingErrorMessage />;
  } */
  return (
    <React.Fragment>
      <ManageColumns />
      <HomeTable data={data} />
    </React.Fragment>
  );
};

export default Home;
