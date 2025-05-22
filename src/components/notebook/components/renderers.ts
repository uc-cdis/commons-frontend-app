import type { NodeRenderers } from '@myst-theme/providers';
import { DEFAULT_RENDERERS } from 'myst-to-react';
import { MystDemoRenderer } from 'myst-demo';
import { MermaidNodeRenderer } from '@myst-theme/diagrams';

import { mergeRenderers } from '@myst-theme/providers';
import { JUPYTER_RENDERERS } from '@myst-theme/jupyter';

const RENDERERS: NodeRenderers = mergeRenderers([DEFAULT_RENDERERS, JUPYTER_RENDERERS]);

export const renderers: NodeRenderers = {
  ...RENDERERS,
  myst: MystDemoRenderer,
  mermaid: MermaidNodeRenderer,
};
