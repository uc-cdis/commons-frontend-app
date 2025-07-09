import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
  ProtectedContent,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import GWASContainer from '../lib/AnalysisApps/GWAS/GWASContainer';

const GWASUIApp = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Sample Page',
        content: 'Sample Data',
        key: 'gen3-sample-page',
      }}
    >
      <ProtectedContent>
        <div className="w-full m-10">
          <div className="w-full p-5">
            <GWASContainer />
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

export default GWASUIApp;
