const LS_KEY = "gabnet_accounts";
const LS_SESSION = "gabnet_session";

const email = document.getElementById("email");
const pass = document.getElementById("pass");
const nEmail = document.getElementById("nEmail");
const nPass = document.getElementById("nPass");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

function loadAccounts() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
}
function saveAccounts(list) { localStorage.setItem(LS_KEY, JSON.stringify(list)); }
function setSession(accountId) {
    localStorage.setItem(LS_SESSION, JSON.stringify({ accountId }));
    window.location.href = "profiles.html";
}

loginBtn?.addEventListener("click", () => {
    const list = loadAccounts();
    const acc = list.find(a => a.email === email.value && a.pass === pass.value);
    if (!acc) return alert("Conta não encontrada.");
    setSession(acc.id);
});

signupBtn?.addEventListener("click", () => {
    if (!nEmail.value || !nPass.value) return alert("Preencha os campos.");
    const list = loadAccounts();
    if (list.some(a => a.email === nEmail.value)) return alert("Email já cadastrado.");
    const id = "acc_" + Date.now();
    list.push({ id, email: nEmail.value, pass: nPass.value, profiles: [] });
    saveAccounts(list);
    alert("Conta criada! Entre com seu email e senha.");
});
