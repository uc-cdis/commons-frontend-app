import fetch from 'node-fetch';
import type { SiteManifest } from 'myst-config';
import {
  type PageLoader,
  getFooterLinks,
  getProject,
  updatePageStaticLinksInplace,
  updateSiteManifestStaticLinksInplace,
  ErrorStatus
} from '@myst-theme/common';


export function responseNoSite(): Response {
  // note: error boundary logic is dependent on the string sent here
  return new Response(ErrorStatus.noSite, {
    status: 404,
    statusText: ErrorStatus.noSite,
  });
}

export function responseNoArticle() {
  // note: error boundary logic is dependent on the string sent here
  return new Response(ErrorStatus.noArticle, {
    status: 404,
    statusText: ErrorStatus.noArticle,
  });
}

const CONTENT_CDN_PORT = process.env.CONTENT_CDN_PORT ?? '3002';
const CONTENT_CDN = process.env.CONTENT_CDN ?? `http://localhost:${CONTENT_CDN_PORT}/book/site`;

type LinkRewriteOptions = { rewriteStaticFolder?: boolean };

export async function getConfig(opts?: LinkRewriteOptions): Promise<SiteManifest> {
  const url = `${CONTENT_CDN}/config.json`;
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) {
    throw new Error(`No site configuration found at ${url}`);
  }

  const jsonData = await response.json();
  const data = (jsonData) as SiteManifest;
  return updateSiteManifestStaticLinksInplace(data, (url) => updateLink(url, opts));
}

function updateLink(
  url: string,
  { rewriteStaticFolder = process.env.MODE === 'static' }: LinkRewriteOptions = {},
) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol.startsWith('http')) return url;
  } catch (error) {
    // pass
  }
  if (rewriteStaticFolder) {
    return `/myst_assets_folder${url}`;
  }
  return `${CONTENT_CDN}${url}`;
}

async function getStaticContent(project?: string, slug?: string): Promise<PageLoader | null> {
  if (!slug) return null;
  const projectSlug = project ? `${project}/` : '';
  const url = `${CONTENT_CDN}/content/${projectSlug}${slug}.json`;
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  const jsonData = await response.json();

  console.log("getStaticContent jsonData", jsonData);
  const data = (jsonData) as PageLoader;
  return updatePageStaticLinksInplace(data, updateLink);
}

export async function getPage(
  domain: string,
  opts: {
    project?: string;
    loadIndexPage?: boolean;
    slug?: string;
    redirect?: boolean;
  },
) {

  console.log("Getting site page", opts.project);
  const projectName = opts.project;
  const config = await getConfig();
  console.log("got config", config);
  if (!config) throw responseNoSite();
  const project = getProject(config, projectName);
  if (!project) throw responseNoArticle();

  let slug = opts.loadIndexPage || opts.slug == null ? project.index : opts.slug;
  let loader = await getStaticContent(projectName, slug).catch(() => null);
  if (!loader) {
    // If you haven't loaded the first time, try the `.index`
    slug = `${slug}.index`;
    loader = await getStaticContent(projectName, slug).catch(() => null);
    if (!loader) throw responseNoArticle();
  }
  console.log("------------- before footer");
  const footer = getFooterLinks(config, projectName, slug);
  console.log("footer", footer);
  return { ...loader, footer, domain: domain, project: projectName };
}

export async function getObjectsInv(): Promise<Buffer | null> {
  const url = updateLink('/objects.inv');
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return response.buffer();
}

export async function getMystXrefJson(): Promise<Record<string, any> | null> {
  const url = updateLink('/myst.xref.json');
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  const xrefs = await response.json() as any;
  xrefs.references?.forEach((ref: any) => {
    ref.data = ref.data?.replace(/^\/content/, '');
  });
  return xrefs;
}

export async function getMystSearchJson(): Promise<Record<string, any> | null> {
  const url = updateLink('/myst.search.json');
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return await response.json() as any;
}

export async function getFavicon(): Promise<{ contentType: string | null; buffer: Buffer } | null> {
  // We are always fetching this at run time, so we don't want the rewritten links
  const config = await getConfig({ rewriteStaticFolder: false });
  const url = config.options?.favicon || 'https://mystmd.org/favicon.ico';
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return null;
  return { contentType: response.headers.get('Content-Type'), buffer: await response.buffer() };
}

export async function getCustomStyleSheet(): Promise<string | undefined> {
  // We are always fetching this at run time, so we don't want the rewritten links
  const config = await getConfig({ rewriteStaticFolder: false });
  const url = config.options?.style;
  if (!url) {
    return;
  }
  const response = await fetch(url).catch(() => null);
  if (!response || response.status === 404) return;
  const css = await response.text();
  return css;
}
