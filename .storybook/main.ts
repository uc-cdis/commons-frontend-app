// This file has been automatically migrated to valid ESM format by Storybook.
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import path from 'path';
import webpack from 'webpack';
import type { StorybookConfig } from '@storybook/nextjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);


const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  env: (config) => ({
    ...config,
  }),
  addons: [
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath('@storybook/addon-a11y'),
    getAbsolutePath('storybook-addon-deep-controls'),
    getAbsolutePath('@storybook/addon-docs'),
  ],
  typescript: {
    check: false,
    checkOptions: {},
    skipCompiler: false,
  },
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {
      builder: {
        useSWC: true, // Enables SWC support
      },
      image: {
        loading: 'eager',
      },
      nextConfigPath: path.resolve(__dirname, '../src//next.config.js'),
    },
  },
  staticDirs: ['../public'],
  webpackFinal: async (config) => {
    const imageRule = config.module?.rules?.find((rule) => {
      const test = (rule as { test: RegExp }).test;

      if (!test) {
        return false;
      }

      return test.test('.svg');
    }) as { [key: string]: any };

    imageRule.exclude = /\.svg$/;

    config.module?.rules?.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // @storybook/nextjs aliases react to next/dist/compiled/react (a canary build).
    // Remove the non-exact prefix aliases so they don't shadow our explicit overrides below.
    if (config.resolve?.alias && !Array.isArray(config.resolve.alias)) {
      delete (config.resolve.alias as Record<string, string>)['react'];
      delete (config.resolve.alias as Record<string, string>)['react-dom'];
    }

    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        'next/router': 'next-router-mock',
        // Pin all react/react-dom imports to the project's installed versions (19.2.6),
        // not the canary build bundled with Next.js.
        react$: require.resolve('react'),
        'react/jsx-runtime': require.resolve('react/jsx-runtime'),
        'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
        'react-dom$': require.resolve('react-dom'),
        'react-dom/client': require.resolve('react-dom/client'),
      },
    };

    config.plugins = [
      ...(config.plugins ?? []),
      new webpack.DefinePlugin(
        Object.keys(process.env)
          .filter((key) => key.startsWith('NEXT_PUBLIC_'))
          .reduce(
            (state, nextKey) => ({ ...state, [nextKey]: process.env[nextKey] }),
            {},
          ),
      ),
    ];

    return config;
  },
};
export default config;

function getAbsolutePath(value: string): any {
  return path.dirname(require.resolve(path.join(value, 'package.json')));
}
