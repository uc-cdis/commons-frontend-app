import React from 'react';
import { GetServerSideProps } from 'next';

import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig, ContentSource,
} from '@gen3/frontend';
import { getMyStMdConfig, getPage } from '@/lib/mystmd/loaders';
import { MystMdConfiguration } from '@/features/MystMd/types';
import MystMdArticle from '@/features/MystMd/MystMdArticle';
import { GEN3_COMMONS_NAME } from '@gen3/core';

interface AppConfig extends NavPageLayoutProps {
  config?: MystMdConfiguration;
}

const NotebookArticlePage = async ({ headerProps, footerProps, config }: AppConfig) => {


  const mystConfig = await getMyStMdConfig(config?.rewriteLinks ?? {})
  const article = await getPage( 'localhost', {
    project: '',
    slug: 'primary-analyses',
  });


  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 App Page',
        content: 'App Data',
        key: 'gen3-app-page',
      }}
    >
      <MystMdArticle article={article} config={mystConfig} />
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {
  try {
    const config: MystMdConfiguration = await ContentSource.getContentDatabase().get(
      `${GEN3_COMMONS_NAME}/apps/mystmd.json`,
    );

    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: config,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        config: {
          projectPath: '/book/site',
        }
      },
    };
  }
};

export default NotebookArticlePage;
