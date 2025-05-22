import { BaseUrlProvider, ProjectProvider, SiteProvider, ThemeProvider } from '@myst-theme/providers';
import { renderers } from '@/components/notebook/components';
import { ComputeOptionsProvider, ThebeLoaderAndServer } from '@myst-theme/jupyter';
import { ArticlePage } from '@/components/notebook/article/ArticlePage';
import { ArticlePageAndNavigation } from '@/components/notebook/article/ArticlePageAndNavigation';
import React, { useState } from 'react';
import { useRouter } from 'next/dist/client/router';
import { Theme } from '@myst-theme/common';
import { SiteManifest } from 'myst-config';
import { useGetProject} from '@/features/MystMd/hooks';
import { MystMdConfiguration } from '@/features/MystMd/types';
import { isMySTMDError } from '@/features/MystMd/loader';


interface MystMdArticleProps {
  article?: any;
  manifest?: SiteManifest;
}

const MystMdArticle = ({ article, manifest }: MystMdArticleProps
) => {

  const router = useRouter();
  const baseUrl = router.basePath;
  const [theme, setTheme] = useState<Theme>(Theme.light);

  return (
    <ThemeProvider theme={theme} setTheme={setTheme} renderers={renderers}>
      <BaseUrlProvider baseurl={baseUrl ?? ''}>
        <SiteProvider config={manifest}>
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
  );
}

const NotebookArticle = (  config : MystMdConfiguration) => {

  const { data : article, isLoading, isError, error, isSuccess } = useGetProject({
    contentURL: config.projectPath,
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError) return <div>Error: {error?.message}</div>;

  if (isMySTMDError(article)) {
    return <div>Error: {article.statusText}</div>;
  }

  if (article === null) {
    return <div>No article found</div>;
  }

  const a = { ...article, project: article?.project ?? "unknown" }
  return (
    <ArticlePage article={a} />
  );

}

export default NotebookArticle;
