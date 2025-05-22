import React, { useEffect, useState } from 'react';
import { GetServerSideProps } from 'next';
import { useRouter } from 'next/dist/client/router';
import { ensureSerializable } from '@/pages/book/utils';
import { renderers } from '@/components/notebook/components/renderers';
import { Theme } from '@myst-theme/common';

import { ArticlePage } from '@/components/notebook/article/ArticlePage';
import { ArticlePageAndNavigation } from '@/components/notebook/article/ArticlePageAndNavigation';
import {
  ComputeOptionsProvider,
  ThebeLoaderAndServer,
} from '@myst-theme/jupyter';
import {
  BaseUrlProvider,
  SiteProvider,
  ThemeProvider,
  ProjectProvider,
} from '@myst-theme/providers';

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

const NotebookArticlePage = ({ headerProps, footerProps, article, config }: AppConfig) => {
  const router = useRouter();
  const baseUrl = router.basePath;
  // (Local) theme state driven by SSR and cookie/localStorage
  const [theme, setTheme] = useState<Theme>(Theme.light);

  return (
    <NavPageLayout
      {...{ headerProps, footerProps }}
      headerData={{
        title: 'Gen3 App Page',
        content: 'App Data',
        key: 'gen3-app-page',
      }}
    >
      <ThemeProvider theme={theme} setTheme={setTheme} renderers={renderers}>
        <BaseUrlProvider baseurl={baseUrl ?? ''}>
          <SiteProvider config={config}>
            <ArticlePageAndNavigation>
            <ProjectProvider>
              <ComputeOptionsProvider
                features={{
                  notebookCompute: true,
                  figureCompute: true,
                  launchBinder: false,
                }}
              >
                <ThebeLoaderAndServer connect={true}>
                  <ArticlePage article={article} />
                </ThebeLoaderAndServer>
              </ComputeOptionsProvider>
            </ProjectProvider>
              </ArticlePageAndNavigation>
          </SiteProvider>
        </BaseUrlProvider>
      </ThemeProvider>
    </NavPageLayout>
  );
};

export const getServerSideProps: GetServerSideProps<
  NavPageLayoutProps
> = async (context) => {
  const host = context.req.headers.host;
  try {
    const article = await getPage(host ?? 'localhost', {
      project: '',
      slug: 'primary-analyses',
    });

    const config = await getConfig();
    const jsonConfig = JSON.parse(JSON.stringify(config));

    console.log('got article', article);
    const serializedData = ensureSerializable(article);
    console.log('got serializedData', serializedData);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        article: serializedData,
        config: jsonConfig,
      },
    };
  } catch (err) {
    console.error(err);
    return {
      props: {
        ...(await getNavPageLayoutPropsFromConfig()),
        article: null,
        config: null,
      },
    };
  }
};

export default NotebookArticlePage;
