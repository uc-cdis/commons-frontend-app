import {
  getConfig,
  getPage,
} from '@/lib/book/loaders.server';

import {
  getProject,
  isFlatSite
} from '@myst-theme/common';
import { SiteManifest } from 'myst-config';

export const loader = async ({
  params,
}: {
  params: { path: string, domain: string };
}) => {
  const [first, ...rest] = params.path.slice(1).split('/');
  const config = await getConfig();
  const project = getProject(config, first);
  const projectName = project?.slug === first ? first : undefined;
  const slugParts = projectName ? rest : [first, ...rest];
  const slug = slugParts.length ? slugParts.join('.') : undefined;
  const flat = isFlatSite(config);
  const page = await getPage(params.domain, {
    project: flat ? projectName : (projectName ?? slug),
    slug: flat ? slug : projectName ? slug : undefined,
    redirect: process.env.MODE === 'static' ? false : true,
  });
  return { config, project, page };
};
