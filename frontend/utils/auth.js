
export const TOKEN_KEY = 'arcanjo_token';
export const USER_KEY = 'arcanjo_user';

function setAuthCookie(key, value) {
  if (typeof document === 'undefined') return;

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${key}=${encodeURIComponent(value)}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
}

function clearAuthCookie(key) {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function setToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    setAuthCookie(TOKEN_KEY, token);
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setUser(username) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, username);
    setAuthCookie(USER_KEY, username);
  }
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_KEY);
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    clearAuthCookie(TOKEN_KEY);
    clearAuthCookie(USER_KEY);
  }
}
