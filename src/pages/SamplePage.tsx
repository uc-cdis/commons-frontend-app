import React from 'react';
import { Text, Paper } from '@mantine/core';
import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
} from '@gen3/frontend';
import { GetServerSideProps } from 'next';

const SamplePage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  return (
    <NavPageLayout {...{ headerProps, footerProps }}>
      <div className="w-96 m-10">
        <Paper shadow="md" p="xl" withBorder>
          <Text>This is a example custom page in Gen3</Text>
          <Text>
            You can add your own content here, and add a link to this page in
            the navigation bar by editing the config file in{' '}
            <em>COMMONSNAME</em>/navigation.json
          </Text>
        </Paper>
      </div>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (_context) => {
  return {
    props: {
      ...(await getNavPageLayoutPropsFromConfig()),
    },
  };
};

export default SamplePage;
