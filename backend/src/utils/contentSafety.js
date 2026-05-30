const GUIDELINE_MESSAGE =
  "Este conteudo viola as diretrizes da comunidade. Nao publique links, imagens ou textos ofensivos, sexuais, ilegais ou que ataquem outras pessoas.";

const blockedTerms = [
  "porn",
  "porno",
  "pornografia",
  "nude",
  "nudes",
  "sexo",
  "sexual",
  "sex",
  "xxx",
  "hentai",
  "onlyfans",
  "escort",
  "prostitu",
  "estupro",
  "racista",
  "racismo",
  "nazismo",
  "terrorismo",
  "pedof",
  "child porn",
  "morte",
  "ameaca",
  "humilhar",
  "idiota",
  "burro",
  "lixo",
];

const suspiciousUrlTerms = [
  "porn",
  "porno",
  "nude",
  "nudes",
  "xxx",
  "hentai",
  "onlyfans",
  "escort",
  "sex",
  "warez",
  "crack",
  "piracy",
  "pirata",
  "malware",
  "phishing",
];

const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
const imageHostsWithoutExtension = [
  "picsum.photos",
  "images.unsplash.com",
  "source.unsplash.com",
  "randomuser.me",
];

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function hasBlockedTerm(value, terms = blockedTerms) {
  const normalized = normalize(value);
  return terms.some((term) => normalized.includes(normalize(term)));
}

function parseUrl(value, fieldLabel) {
  const trimmed = String(value || "").trim();

  if (!trimmed) return null;

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw {
      status: 400,
      message: `${fieldLabel} invalido. Use uma URL completa com http ou https.`,
    };
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw {
      status: 400,
      message: `${fieldLabel} deve usar apenas http ou https.`,
    };
  }

  if (parsed.username || parsed.password) {
    throw {
      status: 400,
      message: `${fieldLabel} nao pode conter usuario ou senha na URL.`,
    };
  }

  return parsed;
}

function assertSafeText(value, fieldLabel) {
  if (!value) return;

  if (hasBlockedTerm(value)) {
    throw {
      status: 400,
      message: `${GUIDELINE_MESSAGE} Campo bloqueado: ${fieldLabel}.`,
    };
  }
}

export function assertSafeUrl(value, fieldLabel = "Link") {
  const parsed = parseUrl(value, fieldLabel);
  if (!parsed) return "";

  const combined = `${parsed.hostname} ${parsed.pathname} ${parsed.search}`;
  if (hasBlockedTerm(combined, suspiciousUrlTerms)) {
    throw {
      status: 400,
      message: `${GUIDELINE_MESSAGE} Link bloqueado: ${fieldLabel}.`,
    };
  }

  return parsed.toString();
}

export function assertSafeImageUrl(value, fieldLabel = "Imagem") {
  const parsed = parseUrl(value, fieldLabel);
  if (!parsed) return "";

  const safeUrl = assertSafeUrl(value, fieldLabel);
  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const hasAllowedExtension = allowedImageExtensions.some((ext) => pathname.endsWith(ext));
  const isKnownImageHost = imageHostsWithoutExtension.some((host) => hostname === host || hostname.endsWith(`.${host}`));

  if (!hasAllowedExtension && !isKnownImageHost) {
    throw {
      status: 400,
      message: `${fieldLabel} precisa ser um link direto para imagem JPG, PNG, GIF, WebP ou AVIF.`,
    };
  }

  return safeUrl;
}

export function assertSafeContent(fields) {
  Object.entries(fields || {}).forEach(([fieldLabel, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => assertSafeText(item, fieldLabel));
      return;
    }

    assertSafeText(value, fieldLabel);
  });
}

export function getGuidelineMessage() {
  return GUIDELINE_MESSAGE;
}
