import React from 'react';
import { GetServerSideProps } from 'next';
import { NextRouter, useRouter } from 'next/dist/client/router';
import dynamic from 'next/dynamic';
import {
  getNavPageLayoutPropsFromConfig,
  NavPageLayout,
  NavPageLayoutProps,
} from '@gen3/frontend';

const GradioApp = dynamic(() => import('../../components/GradioApp'));

const GradioAppsPage = ({ headerProps, footerProps }: NavPageLayoutProps) => {
  const router = useRouter();
  const app = getGradioName(router);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerMetadata={{
        title: 'Gen3 AI Application',
        content: 'AI Application',
        key: 'gen3-ai-app-page',
      }}
    >
      <GradioApp app={app} />
    </NavPageLayout>
  );
};

const getGradioName = (router: NextRouter): string => {
  const { gradio } = router.query;
  if (typeof gradio === 'string') return gradio;
  else if (typeof gradio === 'object') return gradio.join('/');


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

export default GradioAppsPage;
