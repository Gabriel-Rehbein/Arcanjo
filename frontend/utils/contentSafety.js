export const GUIDELINE_MESSAGE =
  'Este conteudo viola as diretrizes da comunidade. Nao publique links, imagens ou textos ofensivos, sexuais, ilegais ou que ataquem outras pessoas.';

const blockedTerms = [
  'porn',
  'porno',
  'pornografia',
  'nude',
  'nudes',
  'sexo',
  'sexual',
  'sex',
  'xxx',
  'hentai',
  'onlyfans',
  'escort',
  'prostitu',
  'estupro',
  'racista',
  'racismo',
  'nazismo',
  'terrorismo',
  'pedof',
  'child porn',
  'ameaca',
  'humilhar',
  'idiota',
  'burro',
  'lixo',
];

const suspiciousUrlTerms = [
  'porn',
  'porno',
  'nude',
  'nudes',
  'xxx',
  'hentai',
  'onlyfans',
  'escort',
  'sex',
  'warez',
  'crack',
  'piracy',
  'pirata',
  'malware',
  'phishing',
];

const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'];
const imageHostsWithoutExtension = [
  'picsum.photos',
  'images.unsplash.com',
  'source.unsplash.com',
  'randomuser.me',
];

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function includesBlockedTerm(value, terms = blockedTerms) {
  const normalized = normalize(value);
  return terms.some((term) => normalized.includes(normalize(term)));
}

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
  if (value && includesBlockedTerm(value)) {
    return `${GUIDELINE_MESSAGE} Campo bloqueado: ${label}.`;
  }

  return '';
}

export function validateSafeUrl(value, label) {
  const parsed = parseUrl(value, label);
  if (!parsed || typeof parsed === 'string') return parsed || '';

  const combined = `${parsed.hostname} ${parsed.pathname} ${parsed.search}`;
  if (includesBlockedTerm(combined, suspiciousUrlTerms)) {
    return `${GUIDELINE_MESSAGE} Link bloqueado: ${label}.`;
  }

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
