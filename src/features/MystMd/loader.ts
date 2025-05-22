import { fetchJSONDataFromURL } from '@gen3/core';
import type { SiteManifest } from 'myst-config';
import {
  ErrorStatus,
  getFooterLinks,
  getProject,
  type PageLoader,
  updatePageStaticLinksInplace,
  updateSiteManifestStaticLinksInplace,
} from '@myst-theme/common';
import { LinkRewriteOptions } from './types';

interface MySTMDError {
  status: number;
  statusText: string;
}

/**
 * Type guard to check if an object is a MySTMDError
 * @param obj Any object to check
 * @returns True if the object conforms to the MySTMDError interface
 */
export const isMySTMDError = (obj: unknown): obj is MySTMDError => {
  if (typeof obj !== 'object' || obj === null) return false;

  const error = obj as Partial<MySTMDError>;
  return (
    typeof error.status === 'number' &&
    typeof error.statusText === 'string'
  );
}


const ErrorNoSite: MySTMDError = {
  status: 404,
  statusText: ErrorStatus.noSite,
};

const ErrorNoArticle: MySTMDError = {
  status: 404,
  statusText: ErrorStatus.noArticle,
};

const updateLink = (
  contentURL: string,
  url: string,
  {
    rewriteStaticFolder = process.env.MODE === 'static',
  }: LinkRewriteOptions = {},
) => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol.startsWith('http')) return url;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error: unknown) {
    // pass
  }
  if (rewriteStaticFolder) {
    return `/myst_assets_folder${url}`;
  }
  return `${contentURL}${url}`;
};

export const getConfig = async (
  contentURL: string,
  opts?: LinkRewriteOptions,
): Promise<SiteManifest | null> => {
  const url = `${contentURL}/config.json`;

  try {
    const response = await fetchJSONDataFromURL(url);
    const data = response as SiteManifest;
    return updateSiteManifestStaticLinksInplace(data, (url) =>
      updateLink(contentURL, url, opts),
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error('mystmd getConfig: ', error);
    }
    console.error(
      `mystmd getConfig: Failed to retrieve site configuration: ${String(error)}`,
    );
    return null;
  }
};

const getStaticContent = async (
  contentURL: string,
  project?: string,
  slug?: string,
): Promise<PageLoader | null> => {
  if (!slug) return null;
  const projectSlug = project ? `${project}/` : '';
  const url = `${contentURL}/content/${projectSlug}${slug}.json`;

  try {
    const response = await fetchJSONDataFromURL(url);

    const data = response as PageLoader;
    return updatePageStaticLinksInplace(data, (url) =>
      updateLink(contentURL, url, { rewriteStaticFolder: true }),
    );
  } catch (error) {
    console.error('mystmd getStaticContent: ', error);
    return null;
  }
};

export interface GetPageOpts {
  project?: string;
  loadIndexPage?: boolean;
  slug?: string;
  redirect?: boolean;
  contentURL: string;
}

export const getPage = async (opts: GetPageOpts) => {
  const projectName = opts.project;
  const config = await getConfig(opts.contentURL);
  if (!config) return ErrorNoSite;
  const project = getProject(config, projectName);
  if (!project) return ErrorNoArticle;

  let slug =
    opts.loadIndexPage || opts.slug == null ? project.index : opts.slug;
  let page = await getStaticContent(opts.contentURL, projectName, slug);
  if (!page) {
    // If you haven't loaded the first time, try the `.index`
    slug = `${slug}.index`;
    page = await getStaticContent(opts.contentURL, projectName, slug);
    if (!page) return ErrorNoArticle;
  }

  const footer = getFooterLinks(config, projectName, slug);
  return { ...page, footer, project: projectName };
};
