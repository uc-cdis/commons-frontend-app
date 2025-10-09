import React from 'react';
import { GetServerSideProps } from 'next';
import { NextRouter, useRouter } from 'next/dist/client/router';

import {
  getNavPageLayoutPropsFromConfig,
  NavPageLayout,
  NavPageLayoutProps,
  StaticNotebookIFrame,
} from '@gen3/frontend';

const StaticNotebookApp = ({
  headerProps,
  footerProps,
}: NavPageLayoutProps) => {
  const router = useRouter();
  const notebook = getNotebookName(router);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 Static Notebook Page',
        content: 'Static Notebook',
        key: 'gen3-static-notebook-page',
      }}
    >
      <StaticNotebookIFrame notebook={notebook} />
    </NavPageLayout>
  );
};

const getNotebookName = (router: NextRouter): string => {
  const { notebook } = router.query;
  if (typeof notebook === 'string') return notebook;
  else if (typeof notebook === 'object') return notebook[0];

  return 'notFound';
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async () => {
  try {
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
      },
    };
  }
};

export default StaticNotebookApp;
