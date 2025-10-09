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
        title: 'Gen3 Gradio App',
        content: 'Huggingface Gradio app',
        key: 'gen3-gradio-page',
      }}
    >
      <GradioApp app={app} />
    </NavPageLayout>
  );
};

const getGradioName = (router: NextRouter): string => {
  const { gradio } = router.query;
  if (typeof gradio === 'string') return gradio;
  else if (typeof gradio === 'object') return gradio[0];

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
          top: { items: [] },
          navigation: {
            items: [],
          },
        },
        footerProps: {},
        headerMetadata: {
          title: 'Gen3 Gradio App',
          content: 'Huggingface Gradio app',
          key: 'gen3-gradio-page',
        },
      },
    };
  }
};

export default GradioAppsPage;
