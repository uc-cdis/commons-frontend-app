import React from 'react';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';
import ResourceBrowser from '../lib/AnalysisApps/ResourceBrowser/ResourceBrowser';

const Analysis = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Resource Browser',
        content: 'Resource Browser',
        key: 'Resource Browser',
      }}
    >
      <ResourceBrowser />
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default Analysis;
