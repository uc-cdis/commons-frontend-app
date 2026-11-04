// @ts-check

"use strict";
const path = require("path");
const fs = require("fs");

/**
 * npm hoists workspace deps to the repo root, so a package sits here or two levels up.
 * @param {string} name
 * @returns {string}
 */
const pkgDir = (name) => {
  const dir = ["node_modules", "../../node_modules"]
    .map((base) => path.resolve(__dirname, base, name))
    .find(fs.existsSync);
  if (!dir) throw new Error(`Cannot locate ${name} in node_modules`);
  return dir;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const dns = require("dns");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withJupyterWorkspaces } = require("@gen3/workspaces/server");

dns.setDefaultResultOrder("ipv4first");

const basePath = process.env.BASE_PATH || "";

const isDev = process.env.NODE_ENV === "development";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withMDX = require("@next/mdx")({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

// Workspace packages are compiled from src so edits hot-reload without a tsc --watch step.
// services_ui is always aliased (the root build never produces its dist); chat only in dev,
// where prod keeps using its built dist. Keep in sync with "paths" in tsconfig.json.
const workspaceSources = {
  "@gen3/services_ui": "../../packages/services_ui/src/index.ts",
  ...(isDev && {
    "@gen3/chat": "../../packages/chat/src/index.ts",
    "@gen3/chat/ui": "../../packages/chat/src/ui/index.ts",
    "@gen3/chat/server": "../../packages/chat/src/server/index.ts",
    "@gen3/chat/styles.css": "../../packages/chat/src/styles.css",
  }),
};

// get the version of the frontend package
const packageJson = require(path.join(pkgDir("@gen3/frontend"), "package.json"));

// Next configuration with support for writing API to existing common services
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  env: {
    version: process.env.npm_package_version,
    NEXT_PUBLIC_GEN3_VERSION: packageJson.version,
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  reactStrictMode: true,
  pageExtensions: ["mdx", "md", "jsx", "js", "tsx", "ts"],
  productionBrowserSourceMaps: true,
  basePath: basePath,
  // Both are barrel files - importing one name otherwise compiles the whole package.
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "@gen3/frontend"],
    // Off by default because of our webpack() hook; frees the compiler's memory before page data
    webpackBuildWorker: true,
    // Docker builds cap page-data workers: the default 7 ran an 8 GB builder out of memory
    ...(process.env.NEXT_BUILD_WORKERS && {
      cpus: Number(process.env.NEXT_BUILD_WORKERS),
    }),
  },
  // Turbopack ignores the webpack() hook, so kill the CopilotKit stylesheet here too.
  turbopack: {
    resolveAlias: {
      "@copilotkit/react-core/dist/v2/index.css": "./empty.css",
      ...workspaceSources,
    },
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  webpack: (config) => {
    config.infrastructureLogging = {
      level: "error",
    };
    // @copilotkit/react-core/v2 side-imports an 87KB Tailwind 4 stylesheet for
    // CopilotKit's own React components. We render none of them - the chat UI is
    // Mantine throughout - and Tailwind 3's PostCSS plugin dies on its bare
    // `@layer base` ("no matching @tailwind base directive"). Resolve it to nothing.
    config.resolve.alias = {
      ...config.resolve.alias,
      [path.join(pkgDir("@copilotkit/react-core"), "dist/v2/index.css")]: false,
      ...Object.fromEntries(
        Object.entries(workspaceSources).map(([spec, file]) => [
          `${spec}$`,
          path.resolve(__dirname, file),
        ]),
      ),
    };
    return config;
  },
  async rewrites() {
    const workspaceApiRewrite = [
      {
        source: "/workspace-api/:path*",
        destination: "/api/:path*",
      },
      {
        source:
          "/lw-workspace/proxy/jeg-proxy/kernelspecs/python_tf_kubernetes/logo-64x64.png",
        destination: "/icons/kernels/logo-64.png",
      },
    ];

    // The revproxy gives /api/ to sheepdog, so a browser cannot reach /api/chat-runtime.
    // Next still requires the route file to live under pages/api, hence the rewrite.
    const chatRuntimeRewrite = [
      {
        source: "/chat-runtime",
        destination: "/api/chat-runtime",
      },
      // same reason: the RNA-seq embeddings proxy (src/pages/api/inference.ts)
      {
        source: "/inference-runtime",
        destination: "/api/inference",
      },
      {
        source: "/chat-models",
        destination: "/api/chat-models",
      },
      // the agent writes its download links as /download/<kind>/<handle>; serve them here.
      // known limits (see packages/chat/README.md): BASE_PATH or an agent --root-path breaks this
      {
        source: "/download/:kind/:handle",
        destination: "/api/chat-download/:kind/:handle",
      },
    ];

    if (isDev) {
      const GEN3_TARGET =
        process.env.NEXT_PUBLIC_GEN3_API_TARGET || "https://localhost";

      return [
        ...workspaceApiRewrite,
        ...chatRuntimeRewrite,
        { source: "/_status", destination: `${GEN3_TARGET}/_status` },
        { source: "/user/:path*", destination: `${GEN3_TARGET}/user/:path*` },
        {
          source: "/guppy/:path*",
          destination: `${GEN3_TARGET}/guppy/:path*`,
        },
        { source: "/mds/:path*", destination: `${GEN3_TARGET}/mds/:path*` },
        {
          source: "/ai-search/:path*",
          destination: `${GEN3_TARGET}/ai-search/:path*`,
        },
        {
          source: "/authz/:path*",
          destination: `${GEN3_TARGET}/authz/:path*`,
        },
        {
          source: "/lw-workspace/:path*",
          destination: `${GEN3_TARGET}/lw-workspace/:path*`,
        },
        {
          source: "/api/v0/submission/:path*",
          destination: `${GEN3_TARGET}/api/v0/submission/:path*`,
        },
        { source: "/wts/:path*", destination: `${GEN3_TARGET}/wts/:path*` },
        {
          source: "/library/lists/:path*",
          destination: `${GEN3_TARGET}/library/lists/:path*`,
        },
        { source: "/job/:path*", destination: `${GEN3_TARGET}/job/:path*` },
        {
          source: "/manifests/:path*",
          destination: `${GEN3_TARGET}/manifests/:path*`,
        },
        {
          source: "/requestor/:path*",
          destination: `${GEN3_TARGET}/requestor/:path*`,
        },
        {
          source: "/index/:path*",
          destination: `${GEN3_TARGET}/index/:path*`,
        },
        {
          source: "/login",
          destination: `${GEN3_TARGET}/login`,
        },
        {
          source: "/ai/:path*",
          destination: `${GEN3_TARGET}/ai/:path*`,
        }
      ];
    } else {
      return [...workspaceApiRewrite, ...chatRuntimeRewrite];
    }
  },
  async headers() {
    return [
      {
        source: "/(.*)?", // Matches all pages
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
      {
        source: "/Workspaces/(.*)?",
        headers: [
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            // 'credentialless' is less strict than 'require-corp' — allows
            // cross-origin iframes without CORP headers, needed in dev when
            // the remote Jupyter server doesn't send COEP headers.
            value: isDev ? "credentialless" : "require-corp",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

// IMPORTANT: actually export your config (wrapped by plugins)
module.exports = withMDX(withJupyterWorkspaces(nextConfig));
