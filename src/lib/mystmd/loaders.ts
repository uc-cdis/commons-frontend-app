import type { SiteManifest } from 'myst-config';
import fetch from 'node-fetch';
import {
  getFooterLinks,
  getProject,
  type PageLoader,
  updatePageStaticLinksInplace,
  updateSiteManifestStaticLinksInplace,
} from '@myst-theme/common';
import { LinkRewriteOptions } from '@/features/MystMd/types';
import { getConfig, responseNoArticle, responseNoSite } from '@/lib/book/loaders.server';

const GEN3_MYSTMD_CONTENT = process.env.GEN3_MYSTMD_CONTENT ?? '/mystmd/content';



const updateLink = (
  url: string,
  { rewriteStaticFolder = process.env.MODE === 'static' }: LinkRewriteOptions = {},
)=>  {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol.startsWith('http')) return url;
  } catch (error: unknown) {
    // pass
  }
  if (rewriteStaticFolder) {
    return `/myst_assets_folder${url}`;
  }
  return `${GEN3_MYSTMD_CONTENT}${url}`;
}


/**
 * Fetches and processes the site configuration from the remote server
 * Rewrites any static links in the configuration based on provided options
 */
export const getMyStMdConfig = async (opts?: LinkRewriteOptions): Promise<SiteManifest> => {
  try {
    const configUrl = `${GEN3_MYSTMD_CONTENT}/config.json`;
    const siteManifest = await fetchAndParseConfig(configUrl);
    return updateSiteManifestStaticLinksInplace(siteManifest, (url) => updateLink(url, opts));
  } catch (error) {
    // Re-throw with more context if it's not already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to retrieve site configuration: ${String(error)}`);
  }
};

/**
 * Fetches and parses the configuration from the specified URL
 * @throws Error if the configuration cannot be fetched or parsed
 */
const fetchAndParseConfig = async (url: string): Promise<SiteManifest> => {
  const response = await fetch(url).catch(() => null);

  if (!response) {
    throw new Error(`Failed to fetch site configuration from ${url}`);
  }

  if (response.status === 404) {
    throw new Error(`No site configuration found at ${url}`);
  }

  if (!response.ok) {
    throw new Error(`Error fetching site configuration: ${response.status} ${response.statusText}`);
  }

  try {
    const jsonData = await response.json();
    return jsonData as SiteManifest;
  } catch (error) {
    throw new Error(`Invalid JSON in site configuration: ${String(error)}`);
  }
}


/**
 * Constructs the content URL based on project and slug
 * @param project - Optional project identifier
 * @param slug - Content slug
 * @returns Full URL to the content JSON
 */
const buildContentUrl = (project?: string, slug?: string): string => {
  const projectSlug = project ? `${project}/` : '';
  return `${GEN3_MYSTMD_CONTENT}/content/${projectSlug}${slug}.json`;
};

/**
 * Fetches and processes static content based on project and slug
 * @param project - Optional project identifier
 * @param slug - Content slug
 * @returns PageLoader object with updated links or null if content not found
 */
const getStaticContent = async (project?: string, slug?: string): Promise<PageLoader | null> => {
  if (!slug) return null;

  try {
    const url = buildContentUrl(project, slug);
    const response = await fetch(url);

    if (!response || response.status === 404) {
      return null;
    }

    const jsonData = await response.json();
    const data = jsonData as PageLoader;
    return updatePageStaticLinksInplace(data, updateLink);
  } catch (error) {
    console.error('Error fetching static content:', error);
    return null;
  }
};

export const getPage = async (
  domain: string,
  opts: {
    project?: string;
    loadIndexPage?: boolean;
    slug?: string;
    redirect?: boolean;
  },
) => {

  const projectName = opts.project;
  const config = await getConfig();

  if (!config) return  responseNoSite();

  const project = getProject(config, projectName);
  if (!project) return responseNoArticle();

  let slug = opts.loadIndexPage || opts.slug == null ? project.index : opts.slug;
  let loader = await getStaticContent(projectName, slug).catch(() => null);
  if (!loader) {
    // If you haven't loaded the first time, try the `.index`
    slug = `${slug}.index`;
    loader = await getStaticContent(projectName, slug).catch(() => null);
    if (!loader) return responseNoArticle();
  }
  const footer = getFooterLinks(config, projectName, slug);

  return { ...loader, footer, domain: domain, project: projectName };
}
