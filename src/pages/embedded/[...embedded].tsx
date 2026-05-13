import React from 'react';
import { GetServerSideProps } from 'next';
import { NextRouter, useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import {
  getNavPageLayoutPropsFromConfig,
  NavPageLayout,
  NavPageLayoutProps,
} from '@gen3/frontend';

const EmbeddedApp = dynamic(() => import('../../components/EmbeddedApp'));

const EmbeddedAppsPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const router = useRouter();
  const app = getEmbeddedName(router);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 AI Application',
        content: 'AI Application',
        key: 'gen3-ai-app-page',
      }}
    >
      <EmbeddedApp app={app} />
    </NavPageLayout>
  );
};

const getEmbeddedName = (router: NextRouter): string => {
  const { embedded } = router.query;
  if (typeof embedded === 'string') return embedded;
  else if (typeof embedded === 'object') return embedded.join('/');


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
        headerProps: {
          topBar: { items: [] },
          navigation: {
            items: [],
          },
        },
        footerProps: {},
        headerMetadata: {
          title: 'Gen3 AI Application',
          content: 'AI Application',
          key: 'gen3-ai-app-page',
        },
      },
    };
  }
};

export default EmbeddedAppsPage;
