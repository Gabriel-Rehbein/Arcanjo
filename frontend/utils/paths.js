export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/Arcanjo';

export function assetPath(path = '') {
  if (!path) return BASE_PATH;
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }

  return `${BASE_PATH}${path.startsWith('/') ? path : `/${path}`}`;
}
