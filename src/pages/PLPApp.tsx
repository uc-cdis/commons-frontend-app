import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
  ProtectedContent,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import PLPContainer from '../lib/AnalysisApps/PLP/PLPContainer';
import { Anchor } from '@mantine/core';
import Link from 'next/link';

const PLPApp = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Sample Page',
        content: 'Sample Data',
        key: 'gen3-plp-page',
      }}
    >
      <ProtectedContent>
        <div className="w-full m-10">
          <div className="w-full p-5">
            <Anchor component={Link} href="/resource-browser"> ← Back to Apps</Anchor>
            <PLPContainer />
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

export default PLPApp;
