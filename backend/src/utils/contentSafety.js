const allowedImageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"];
const imageHostsWithoutExtension = [
  "picsum.photos",
  "images.unsplash.com",
  "source.unsplash.com",
  "randomuser.me",
];

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

export function assertSafeUrl(value, fieldLabel = "Link") {
  const parsed = parseUrl(value, fieldLabel);
  if (!parsed) return "";

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
  void fields;
}

export function getGuidelineMessage() {
  return "";
}
