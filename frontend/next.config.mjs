import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const repo = 'Arcanjo';

const nextConfig = {
  reactStrictMode: true,

  output: 'export',

  images: {
    unoptimized: true,
  },

  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,

  trailingSlash: true,

  poweredByHeader: false,

  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
