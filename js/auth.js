// Gerenciamento de Sessão do Usuário

const LS_USER_SESSION = 'arcanjo_user_session';

class Auth {
  static getSession() {
    const session = localStorage.getItem(LS_USER_SESSION);
    return session ? JSON.parse(session) : null;
  }

  static isAuthenticated() {
    return !!this.getSession();
  }

  static getCurrentUser() {
    const session = this.getSession();
    return session ? session.username : null;
  }

  static getCurrentUserId() {
    const session = this.getSession();
    return session ? session.id : null;
  }

  static logout() {
    localStorage.removeItem(LS_USER_SESSION);
    window.location.href = 'login.html';
  }

  static requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
    }
  }
}

// Verificar autenticação em páginas protegidas
function protectRoute() {
  if (!Auth.isAuthenticated()) {
    window.location.href = 'login.html';
  }
}