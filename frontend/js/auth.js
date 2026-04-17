const LS_USER_SESSION = "arcanjo_user_session";
const LS_TOKEN = "arcanjo_token";

const Auth = {
  saveSession(user, token) {
    const session = {
      id: user.id,
      username: user.username,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(LS_USER_SESSION, JSON.stringify(session));
    localStorage.setItem(LS_TOKEN, token);
  },

  getSession() {
    try {
      return JSON.parse(localStorage.getItem(LS_USER_SESSION) || "null");
    } catch {
      return null;
    }
  },

  getCurrentUser() {
    return this.getSession()?.username || null;
  },

  getCurrentUserId() {
    return this.getSession()?.id || null;
  },

  getToken() {
    return localStorage.getItem(LS_TOKEN);
  },

  isAuthenticated() {
    return !!this.getToken() && !!this.getSession();
  },

  logout() {
    localStorage.removeItem(LS_USER_SESSION);
    localStorage.removeItem(LS_TOKEN);
    window.location.href = "login.html";
  }
};

function protectRoute() {
  if (!Auth.isAuthenticated()) {
    window.location.href = "login.html";
  }
}