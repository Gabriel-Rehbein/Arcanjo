// Troque a senha aqui:
const ARCANJO_PASSWORD = "1234";

// Páginas protegidas
const PROTECTED_PAGES = ["dashboard.html"];

function isLogged() {
  return localStorage.getItem("arcanjo_auth") === "ok";
}

function requireAuth() {
  const page = location.pathname.split("/").pop();
  if (PROTECTED_PAGES.includes(page) && !isLogged()) {
    location.href = "index.html";
  }
}

function logout() {
  localStorage.removeItem("arcanjo_auth");
  location.href = "index.html";
}

// Se estiver em página protegida, força login
requireAuth();

// Login form (só roda se existir)
const form = document.getElementById("loginForm");
if (form) {
  const msg = document.getElementById("msg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.getElementById("password").value;

    if (pass === ARCANJO_PASSWORD) {
      localStorage.setItem("arcanjo_auth", "ok");
      location.href = "dashboard.html";
    } else {
      msg.textContent = "Senha incorreta.";
    }
  });
}

// Logout button (só roda se existir)
const logoutBtn = document.getElementById("logout");
if (logoutBtn) logoutBtn.addEventListener("click", logout);