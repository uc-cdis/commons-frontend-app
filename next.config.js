'use strict';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('./src/lib/plugins/index.js');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// Next configuration with support for rewrting API to existing common services
const nextConfig = {
  output: 'standalone',
  serverRuntimeConfig: {
    HOSTNAME: '0.0.0.0',
  },
  experimental: {
    largePageDataBytes: 300 * 100000,
  },
  reactStrictMode: true,
  pageExtensions: ['mdx', 'md', 'jsx', 'js', 'tsx', 'ts'],
  basePath: process.env.BASE_PATH || '',
  transpilePackages: ['@gen3/core', '@gen3/frontend'],
  webpack: (config) => {
    config.infrastructureLogging = {
      level: 'error',
    };

    // Add a custom resolver for .js files in @myst-theme/site
    const resolvePlugin = {
      apply: (resolver) => {
        const fs = require('fs');
        const path = require('path');

        // Hook into the 'resolve' step
        resolver.hooks.resolve.tapAsync('MystThemeResolver', (request, resolveContext, callback) => {
          // Only process imports from @myst-theme/site
          if (request.path && request.path.includes('@myst-theme/site/src')) {
            // Check if this is a .js file that doesn't exist
            if (request.request && request.request.endsWith('.js')) {
              // Try to resolve with .ts extension instead
              const tsPath = request.request.replace(/\.js$/, '.ts');
              const fullPath = path.resolve(request.path, tsPath);

              // Check if the .ts file exists
              if (fs.existsSync(fullPath)) {
                // Update the request to use the .ts file
                const newRequest = {
                  ...request,
                  request: tsPath
                };
                return resolver.doResolve(resolver.hooks.resolve, newRequest, null, resolveContext, callback);
              }
            }
          }

          // Continue with the normal resolution process
          callback();
        });
      }
    };

    // Add the plugin to the resolver
    config.resolve.plugins = config.resolve.plugins || [];
    config.resolve.plugins.push(resolvePlugin);

    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)?', // Matches all pages
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

module.exports = withMDX(nextConfig);
