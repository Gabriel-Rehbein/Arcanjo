const API_BASE_URL =
  process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator === -1) return cookies;

    const key = item.slice(0, separator).trim();
    const value = item.slice(separator + 1).trim();

    if (key) {
      cookies[key] = decodeURIComponent(value);
    }

    return cookies;
  }, {});
}

export function getServerAuth(req) {
  const cookies = parseCookies(req?.headers?.cookie);

  return {
    token: cookies.arcanjo_token || null,
    username: cookies.arcanjo_user || null,
  };
}

export async function serverApiFetch(endpoint, { token } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : await response.text();

    if (!response.ok) {
      const error = new Error(
        body?.error?.message ||
          body?.message ||
          body?.error ||
          `Erro na requisicao (${response.status})`
      );
      error.status = response.status;
      throw error;
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

export function redirectToLogin() {
  return {
    redirect: {
      destination: '/',
      permanent: false,
    },
  };
}
