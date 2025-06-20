import React from 'react';
import HomeTable from './HomeTable/HomeTable';
import LoadingErrorMessage from '../../../SharedUtils/LoadingErrorMessage/LoadingErrorMessage';
import { Loader } from '@mantine/core';
import { GEN3_API } from '@gen3/core';
import useSWR from 'swr';
import { GwasWorkflowEndpoint } from '../../../SharedUtils/Endpoints';

const Home = ({ selectedTeamProject }: { selectedTeamProject: string }) => {
  const tranformDates = (data: any) => {
    return data.map((item: any) => ({
      ...item,
      startedAt: new Date(item.startedAt),
      submittedAt: new Date(item.submittedAt),
      finishedAt: new Date(item.finishedAt),
    }));
  };
  const { data, error, isLoading, isValidating } = useSWR(
    `${GEN3_API}/${GwasWorkflowEndpoint}?team_projects=${selectedTeamProject}`,
    (...args) => fetch(...args).then((res) => res.json().then(tranformDates)),
  );

  if (isLoading || isValidating) {
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
  if (error) {
    return <LoadingErrorMessage />;
  }
  return (
    <HomeTable data={data} />
  );
};

export default Home;
