// Sistema de Autenticação com Supabase
const LS_USER_SESSION = 'arcanjo_user_session';

// Elementos DOM
const tabButtons = document.querySelectorAll('.tab-btn');
const authPanels = document.querySelectorAll('.auth-panel');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const signupSuccess = document.getElementById('signupSuccess');

// Tabs
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.getAttribute('data-tab');
    switchTab(tab);
  });
});

function switchTab(tab) {
  tabButtons.forEach(btn => btn.classList.remove('active'));
  authPanels.forEach(panel => panel.classList.remove('active'));

  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
  document.getElementById(tab).classList.add('active');

  // Limpar mensagens
  loginError.classList.remove('show');
  signupError.classList.remove('show');
  signupSuccess.classList.remove('show');
}

// Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showError(loginError, 'Preencha todos os campos');
    return;
  }

  try {
    loginForm.classList.add('loading');

    // Buscar usuário no Supabase
    const users = await supabase.select('users', { username });

    if (users.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const user = users[0];

    // Verificar senha (em produção, use bcrypt no backend!)
    if (user.password !== password) {
      throw new Error('Senha incorreta');
    }

    // Salvar sessão
    saveSession(user, password);

    // Redirecionar
    window.location.href = 'dashboard.html';
  } catch (err) {
    showError(loginError, err.message);
  } finally {
    loginForm.classList.remove('loading');
  }
});

// Signup
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupError.classList.remove('show');
  signupSuccess.classList.remove('show');

  const username = document.getElementById('signupUsername').value.trim();
  const password = document.getElementById('signupPassword').value;
  const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

  if (!username || !password || !passwordConfirm) {
    showError(signupError, 'Preencha todos os campos');
    return;
  }

  if (password !== passwordConfirm) {
    showError(signupError, 'As senhas não conferem');
    return;
  }

  if (password.length < 6) {
    showError(signupError, 'A senha deve ter no mínimo 6 caracteres');
    return;
  }

  if (username.length < 3) {
    showError(signupError, 'O usuário deve ter no mínimo 3 caracteres');
    return;
  }

  try {
    signupForm.classList.add('loading');

    // Verificar se usuário já existe
    const existingUsers = await supabase.select('users', { username });

    if (existingUsers.length > 0) {
      throw new Error('Este usuário já existe');
    }

    // Criar novo usuário
    const result = await supabase.insert('users', {
      username,
      password, // Em produção, criptografe!
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    showSuccess(signupSuccess, 'Conta criada com sucesso! Faça login para continuar.');

    // Limpar formulário
    signupForm.reset();

    // Redirecionar para login após 2s
    setTimeout(() => {
      switchTab('login');
    }, 2000);
  } catch (err) {
    showError(signupError, err.message);
  } finally {
    signupForm.classList.remove('loading');
  }
});

// Funções auxiliares
function showError(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

function showSuccess(element, message) {
  element.textContent = message;
  element.classList.add('show');
}

function saveSession(user, password) {
  const session = {
    id: user.id,
    username: user.username,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(LS_USER_SESSION, JSON.stringify(session));

  // Verificar se é admin (usuário especial)
  const isAdmin = (user.username === 'admin' && password === 'Admin@2024');
  if (isAdmin) {
    localStorage.setItem(`is_admin_${user.id}`, 'true');
  }

  // Guardar data de criação para novos usuários
  if (!localStorage.getItem(`user_created_${user.id}`)) {
    localStorage.setItem(`user_created_${user.id}`, new Date().toISOString());
  }
}

// Verificar se já está logado
function checkSession() {
  const session = localStorage.getItem(LS_USER_SESSION);
  if (session) {
    window.location.href = 'dashboard.html';
  }
}

// Executar ao carregar
checkSession();
