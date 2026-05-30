export const GUIDELINE_MESSAGE = '';

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
const imageHostsWithoutExtension = [
  'picsum.photos',
  'images.unsplash.com',
  'source.unsplash.com',
  'randomuser.me',
];

function parseUrl(value, label) {
  const trimmed = String(value || '').trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return `${label} deve usar apenas http ou https.`;
    }

    if (parsed.username || parsed.password) {
      return `${label} nao pode conter usuario ou senha na URL.`;
    }

    return parsed;
  } catch {
    return `${label} invalido. Use uma URL completa com http ou https.`;
  }
}

export function validateSafeText(value, label) {
  void value;
  void label;

  return '';
}

export function validateSafeUrl(value, label) {
  const parsed = parseUrl(value, label);
  if (!parsed || typeof parsed === 'string') return parsed || '';

  return '';
}

export function validateSafeImageUrl(value, label) {
  const urlError = validateSafeUrl(value, label);
  if (urlError) return urlError;

  if (!value) return '';

  const parsed = new URL(value);
  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const hasAllowedExtension = allowedImageExtensions.some((ext) => pathname.endsWith(ext));
  const isKnownImageHost = imageHostsWithoutExtension.some((host) => hostname === host || hostname.endsWith(`.${host}`));

  if (!hasAllowedExtension && !isKnownImageHost) {
    return `${label} precisa ser um link direto para imagem JPG, PNG, GIF, WebP ou AVIF.`;
  }

  return '';
}
