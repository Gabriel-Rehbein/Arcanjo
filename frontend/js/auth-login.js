const tabButtons = document.querySelectorAll(".tab-btn");
const authPanels = document.querySelectorAll(".auth-panel");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginError = document.getElementById("loginError");
const signupError = document.getElementById("signupError");
const signupSuccess = document.getElementById("signupSuccess");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const tab = btn.getAttribute("data-tab");
    switchTab(tab);
  });
});

function switchTab(tab) {
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  authPanels.forEach((panel) => panel.classList.remove("active"));

  document.querySelector(`[data-tab="${tab}"]`)?.classList.add("active");
  document.getElementById(tab)?.classList.add("active");

  loginError?.classList.remove("show");
  signupError?.classList.remove("show");
  signupSuccess?.classList.remove("show");
}

loginForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  loginError?.classList.remove("show");

  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!username || !password) {
    return showError(loginError, "Preencha todos os campos");
  }

  try {
    loginForm.classList.add("loading");

    const result = await Api.post("/auth/login", {
      username,
      password
    });

    const payload = parseJwt(result.token);

    Auth.saveSession(
      {
        id: payload.id,
        username
      },
      result.token
    );

    window.location.href = "feed.html";
  } catch (err) {
    showError(loginError, err.message);
  } finally {
    loginForm.classList.remove("loading");
  }
});

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  signupError?.classList.remove("show");
  signupSuccess?.classList.remove("show");

  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const passwordConfirm = document.getElementById("signupPasswordConfirm").value;

  if (!username || !password || !passwordConfirm) {
    return showError(signupError, "Preencha todos os campos");
  }

  if (password !== passwordConfirm) {
    return showError(signupError, "As senhas não conferem");
  }

  if (password.length < 6) {
    return showError(signupError, "A senha deve ter no mínimo 6 caracteres");
  }

  if (username.length < 3) {
    return showError(signupError, "O usuário deve ter no mínimo 3 caracteres");
  }

  try {
    signupForm.classList.add("loading");

    await Api.post("/auth/register", {
      username,
      password
    });

    showSuccess(signupSuccess, "Conta criada com sucesso! Faça login para continuar.");
    signupForm.reset();

    setTimeout(() => {
      switchTab("login");
    }, 1500);
  } catch (err) {
    showError(signupError, err.message);
  } finally {
    signupForm.classList.remove("loading");
  }
});

function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
}

function showSuccess(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
}

function parseJwt(token) {
  const base64 = token.split(".")[1];
  const json = atob(base64);
  return JSON.parse(json);
}