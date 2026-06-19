import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const repo = process.env.GITHUB_PAGES_REPO || 'Arcanjo';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || `/${repo}`;

const nextConfig = {
  reactStrictMode: true,

  output: 'export',

  images: {
    unoptimized: true,
  },

  basePath,
  assetPrefix: `${basePath}/`,

  trailingSlash: true,

  poweredByHeader: false,

  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
