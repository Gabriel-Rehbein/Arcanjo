
export const TOKEN_KEY = 'arcanjo_token';
export const USER_KEY = 'arcanjo_user';

export function setToken(token) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setUser(username) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, username);
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
  }
}
