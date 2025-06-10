import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig, ProtectedContent,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import GWASResultsContainer from '@/lib/AnalysisApps/GWASResults/GWASResultsContainer';
import { useGetWorkflowsMonthlyQuery } from '@/lib/AnalysisApps/Results/Utils/workflowApi';

const GWASResults = ({ headerProps, footerProps }: NavPageLayoutProps) => {

  const {data,  isFetching: isFetchingMonthlyData } = useGetWorkflowsMonthlyQuery();

  console.log(data, isFetchingMonthlyData);
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'GWAS Results',
        content: 'Results of GWAS Workflows',
        key: 'gen3-gwas-results',
      }}
    >
      <ProtectedContent>
        <div className="w-full p-10">
          <div className="w-full p-5">
            <GWASResultsContainer />
          </div>
        </div>
      </ProtectedContent>
    </NavPageLayout>
  );
};

// TODO: replace this with a custom getServerSideProps function
export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default GWASResults;
