// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import path from 'path';
import type { StorybookConfig } from '@storybook/nextjs-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);


const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  env: (config) => ({
    ...config,
  }),
  addons: [
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-deep-controls'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  typescript: {
    check: false,
    skipCompiler: false,
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs-vite'),
    options: {
      nextConfigPath: path.resolve(__dirname, '../src//next.config.js'),
    },
  },
  staticDirs: ['../public'],
  viteFinal: async (config) => {
    const { mergeConfig } = await import('vite');
    const { default: svgr } = await import('vite-plugin-svgr');
    const aliases = [
      { find: 'next/router', replacement: 'next-router-mock' },
    ];

    const merged = mergeConfig(config, { plugins: [svgr()] });

    merged.resolve ??= {};
    const frameworkAliases = Array.isArray(merged.resolve.alias)
      ? merged.resolve.alias
      : [];
    merged.resolve.alias = [...aliases, ...frameworkAliases];

    return merged;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return path.dirname(require.resolve(path.join(value, 'package.json')));
}
