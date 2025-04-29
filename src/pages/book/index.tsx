import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import {useRouter } from 'next/dist/client/router';
import { ensureSerializable} from '@/pages/book/utils';

import { ArticlePage } from '@/components/article/ArticlePage';
import { ComputeOptionsProvider, ThebeLoaderAndServer } from '@myst-theme/jupyter';
import { BaseUrlProvider, SiteProvider, useSiteManifest, ProjectProvider } from '@myst-theme/providers';
type Props = { host: string | null };

import {
  NavPageLayout,
  NavPageLayoutProps,
  getNavPageLayoutPropsFromConfig,
  ContentSource,
} from '@gen3/frontend';
import { getConfig, getPage } from '@/lib/book/loaders.server';
import { SiteManifest } from 'myst-config';

interface AppConfig extends NavPageLayoutProps {
  article?: any;
  config?: SiteManifest;
}

const AppsPage =  ({ headerProps, footerProps, article, config }: AppConfig) => {
  const router = useRouter();
  const  baseUrl  = router.basePath;


  console.log('baseUrl', baseUrl);
  console.log('config', config);
  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 App Page',
        content: 'App Data',
        key: 'gen3-app-page',
      }}
    >
      <BaseUrlProvider baseurl={baseUrl ?? ''}>
        <SiteProvider config={config}>
      <ProjectProvider>
        <ComputeOptionsProvider
          features={{ notebookCompute: true, figureCompute: true, launchBinder: false }}
        >
          <ThebeLoaderAndServer baseurl={baseUrl ?? ''}>
            <ArticlePage article={article} />
          </ThebeLoaderAndServer>
        </ComputeOptionsProvider>
      </ProjectProvider>
        </SiteProvider>
        </BaseUrlProvider>

    </NavPageLayout>

  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {
  const host = context.req.headers.host;
  try {

    const article = await getPage(host ?? "localhost", {
      project: "",
      slug: "primary-analyses"
    })

    const config =  await getConfig();
    const jsonConfig = JSON.parse(JSON.stringify(config));

    console.log("got article", article);
    const serializedData = ensureSerializable(article);
    console.log("got serializedData", serializedData);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        article: serializedData,
        config: jsonConfig
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        article: null,
        config: null
      },
    };
  }
};

export default AppsPage;
