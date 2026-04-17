protectRoute();

let currentUserId = null;
let currentUsername = null;

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = Auth.getCurrentUser();
  currentUserId = Auth.getCurrentUserId();
  currentUsername = currentUser;

  if (!currentUser || !currentUserId) {
    window.location.href = "login.html";
    return;
  }

  bindEvents();
  loadSettings();
});

function bindEvents() {
  byId("emailNotifications")?.addEventListener("click", toggleNotifications);
  byId("dailyNotifications")?.addEventListener("click", toggleDaily);
  byId("publicProfile")?.addEventListener("click", togglePublic);
  byId("showEmail")?.addEventListener("click", toggleShowEmail);
  byId("twoFactor")?.addEventListener("click", toggleTwoFactor);

  document.querySelectorAll(".color-option").forEach(color => {
    color.addEventListener("click", selectColor);
  });

  byId("saveEmailBtn")?.addEventListener("click", saveNotificationEmail);
  byId("notificationTime")?.addEventListener("change", saveNotificationTime);
  byId("themeSelect")?.addEventListener("change", saveTheme);
  byId("saveAllBtn")?.addEventListener("click", saveAllSettings);
  byId("downloadDataBtn")?.addEventListener("click", downloadData);
  byId("clearCacheBtn")?.addEventListener("click", clearCache);
  byId("changePasswordBtn")?.addEventListener("click", togglePasswordBox);
  byId("confirmPasswordChangeBtn")?.addEventListener("click", changePassword);
  byId("deleteAccountBtn")?.addEventListener("click", deleteAccount);
}

function byId(id) {
  return document.getElementById(id);
}

function getSettingsKey() {
  return `settings_${currentUserId}`;
}

function getSettings() {
  try {
    return JSON.parse(localStorage.getItem(getSettingsKey()) || "{}");
  } catch {
    return {};
  }
}

function setSettings(settings) {
  localStorage.setItem(getSettingsKey(), JSON.stringify(settings));
}

function loadSettings() {
  const settings = getSettings();

  setToggleState("emailNotifications", !!settings.emailNotifications);
  setToggleState("dailyNotifications", !!settings.dailyNotifications);
  setToggleState("publicProfile", !!settings.publicProfile);
  setToggleState("showEmail", !!settings.showEmail);
  setToggleState("twoFactor", !!settings.twoFactor);

  byId("notificationEmail").value = settings.notificationEmail || "";
  byId("notificationTime").value = settings.notificationTime || "08:00";
  byId("themeSelect").value = settings.theme || "dark";

  const backgroundColor = settings.backgroundColor || "#0b0f14";
  markSelectedColor(backgroundColor);
  applyBackgroundColor(backgroundColor);
  applyTheme(settings.theme || "dark");
  updateDependencies();
  syncProfilePrivacyToLocalProfile(settings);
}

function setToggleState(id, active) {
  const el = byId(id);
  if (!el) return;

  el.classList.toggle("active", !!active);
  el.setAttribute("aria-pressed", active ? "true" : "false");
}

function toggleNotifications() {
  const enabled = toggleButton("emailNotifications");

  if (!enabled) {
    setToggleState("dailyNotifications", false);
  }

  saveSettings();
  updateDependencies();
}

function toggleDaily() {
  const emailEnabled = byId("emailNotifications").classList.contains("active");

  if (!emailEnabled) {
    showErrorMessage("Ative as notificações por email antes do resumo diário.");
    return;
  }

  toggleButton("dailyNotifications");
  saveSettings();
  updateDependencies();
}

function togglePublic() {
  toggleButton("publicProfile");
  saveSettings();
}

function toggleShowEmail() {
  toggleButton("showEmail");
  saveSettings();
}

function toggleTwoFactor() {
  toggleButton("twoFactor");
  saveSettings();
  updateDependencies();
  showSuccessMessage("Configuração de 2FA atualizada!");
}

function toggleButton(id) {
  const btn = byId(id);
  if (!btn) return false;

  btn.classList.toggle("active");
  const active = btn.classList.contains("active");
  btn.setAttribute("aria-pressed", active ? "true" : "false");
  return active;
}

function updateDependencies() {
  const emailEnabled = byId("emailNotifications")?.classList.contains("active");
  const dailyBtn = byId("dailyNotifications");
  const emailInput = byId("notificationEmail");
  const timeInput = byId("notificationTime");
  const twoFactorStatus = byId("twoFactorStatus");
  const twoFactorEnabled = byId("twoFactor")?.classList.contains("active");

  if (dailyBtn) {
    dailyBtn.style.opacity = emailEnabled ? "1" : ".55";
  }

  if (emailInput) {
    emailInput.disabled = !emailEnabled;
  }

  if (timeInput) {
    timeInput.disabled = !emailEnabled || !dailyBtn?.classList.contains("active");
  }

  if (twoFactorStatus) {
    twoFactorStatus.textContent = twoFactorEnabled
      ? "2FA ativado para ações sensíveis"
      : "2FA desativado";
  }
}

function selectColor(e) {
  const color = e.currentTarget.getAttribute("data-color");
  markSelectedColor(color);
  applyBackgroundColor(color);
  saveSettings();
}

function markSelectedColor(color) {
  document.querySelectorAll(".color-option").forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-color") === color);
  });
}

function applyBackgroundColor(color) {
  document.documentElement.style.setProperty("--bg-color", color);
  document.body.style.background = color;
  document.body.style.backgroundColor = color;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);

  if (theme === "light") {
    document.body.style.color = "#111827";
  } else {
    document.body.style.color = "#e8eef7";
  }
}

function saveNotificationEmail() {
  const email = byId("notificationEmail").value.trim();

  if (email && !validateEmail(email)) {
    showErrorMessage("Por favor, insira um email válido.");
    return;
  }

  saveSettings();
  showSuccessMessage("Email de notificação salvo com sucesso!");
}

function saveNotificationTime() {
  saveSettings();
  showSuccessMessage("Horário salvo com sucesso!");
}

function saveTheme() {
  const theme = byId("themeSelect").value;
  applyTheme(theme);
  saveSettings();
  showSuccessMessage("Tema atualizado com sucesso!");
}

function buildSettingsObject() {
  return {
    emailNotifications: byId("emailNotifications").classList.contains("active"),
    dailyNotifications: byId("dailyNotifications").classList.contains("active"),
    notificationEmail: byId("notificationEmail").value.trim(),
    notificationTime: byId("notificationTime").value,
    publicProfile: byId("publicProfile").classList.contains("active"),
    showEmail: byId("showEmail").classList.contains("active"),
    twoFactor: byId("twoFactor").classList.contains("active"),
    theme: byId("themeSelect").value,
    backgroundColor: document.querySelector(".color-option.active")?.getAttribute("data-color") || "#0b0f14",
    updated: new Date().toISOString()
  };
}

function saveSettings() {
  const settings = buildSettingsObject();

  if (settings.emailNotifications && settings.notificationEmail && !validateEmail(settings.notificationEmail)) {
    showErrorMessage("O email de notificação informado é inválido.");
    return false;
  }

  if (!settings.emailNotifications) {
    settings.dailyNotifications = false;
    setToggleState("dailyNotifications", false);
  }

  setSettings(settings);
  applyBackgroundColor(settings.backgroundColor);
  applyTheme(settings.theme);
  syncProfilePrivacyToLocalProfile(settings);
  updateDependencies();
  return true;
}

function saveAllSettings() {
  const ok = saveSettings();
  if (!ok) return;
  showSuccessMessage();
}

function syncProfilePrivacyToLocalProfile(settings) {
  const profileKey = `profile_${currentUserId}`;
  let profile = {};

  try {
    profile = JSON.parse(localStorage.getItem(profileKey) || "{}");
  } catch {
    profile = {};
  }

  profile.publicProfile = !!settings.publicProfile;
  profile.showEmail = !!settings.showEmail;
  profile.notificationEmail = settings.notificationEmail || profile.notificationEmail || "";
  profile.updatedAt = new Date().toISOString();

  localStorage.setItem(profileKey, JSON.stringify(profile));
}

function downloadData() {
  const settings = getSettings();
  const profile = readJson(`profile_${currentUserId}`, {});
  const projects = readJson(`arcanjo_projects_${currentUserId}`, []);
  const favorites = readJson(`arcanjo_favorites_${currentUserId}`, []);
  const blockedUsers = readJson(`arcanjo_blocked_users_${currentUserId}`, []);

  const allData = {
    user: {
      id: currentUserId,
      username: currentUsername
    },
    settings,
    profile,
    projects,
    favorites,
    blockedUsers,
    exportedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(allData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `arcanjo-backup-${currentUserId}-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
  showSuccessMessage("Dados baixados com sucesso!");
}

function clearCache() {
  const confirmed = confirm(
    "Tem certeza que deseja limpar apenas o cache local do seu usuário? Seus dados no navegador serão removidos."
  );

  if (!confirmed) return;

  const keysToRemove = [
    `settings_${currentUserId}`,
    `profile_${currentUserId}`,
    `arcanjo_projects_${currentUserId}`,
    `arcanjo_favorites_${currentUserId}`,
    `arcanjo_blocked_users_${currentUserId}`,
    `is_admin_${currentUserId}`
  ];

  keysToRemove.forEach(key => localStorage.removeItem(key));

  showSuccessMessage("Cache local do usuário limpo com sucesso!");

  setTimeout(() => {
    window.location.reload();
  }, 900);
}

function togglePasswordBox() {
  const box = byId("passwordBox");
  if (!box) return;
  box.classList.toggle("show");
}

function changePassword() {
  const currentPassword = byId("currentPassword").value.trim();
  const newPassword = byId("newPassword").value.trim();
  const confirmPassword = byId("confirmPassword").value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    showErrorMessage("Preencha todos os campos de senha.");
    return;
  }

  if (newPassword.length < 6) {
    showErrorMessage("A nova senha deve ter no mínimo 6 caracteres.");
    return;
  }

  if (newPassword !== confirmPassword) {
    showErrorMessage("A confirmação da nova senha não confere.");
    return;
  }

  const userUpdated = updateUserPassword(currentUserId, currentPassword, newPassword);

  if (!userUpdated) {
    showErrorMessage("Senha atual incorreta ou usuário não encontrado.");
    return;
  }

  byId("currentPassword").value = "";
  byId("newPassword").value = "";
  byId("confirmPassword").value = "";
  byId("passwordBox").classList.remove("show");

  showSuccessMessage("Senha alterada com sucesso!");
}

function updateUserPassword(userId, currentPassword, newPassword) {
  const possibleKeys = ["arcanjo_users", "users", "usuarios"];
  let updated = false;

  for (const key of possibleKeys) {
    let users;

    try {
      users = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      users = [];
    }

    if (!Array.isArray(users) || !users.length) continue;

    const index = users.findIndex(user => {
      const sameId = String(user.id ?? user.userId ?? "") === String(userId);
      const samePassword =
        String(user.password ?? user.senha ?? "") === String(currentPassword);
      return sameId && samePassword;
    });

    if (index !== -1) {
      if ("password" in users[index]) users[index].password = newPassword;
      if ("senha" in users[index]) users[index].senha = newPassword;
      if (!("password" in users[index]) && !("senha" in users[index])) {
        users[index].password = newPassword;
      }

      users[index].updatedAt = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(users));
      updated = true;
      break;
    }
  }

  return updated;
}

function deleteAccount() {
  const confirmed = confirm(
    "Esta ação é irreversível. Todos os seus dados locais serão removidos. Deseja continuar?"
  );

  if (!confirmed) return;

  const password = prompt("Digite sua senha atual para confirmar a exclusão da conta:");
  if (!password) return;

  const valid = validateCurrentPassword(currentUserId, password);
  if (!valid) {
    showErrorMessage("Senha incorreta. Conta não deletada.");
    return;
  }

  removeUserFromLocalLists(currentUserId);
  removeUserScopedData(currentUserId);

  showSuccessMessage("Sua conta foi deletada com sucesso.");

  setTimeout(() => {
    Auth.logout();
  }, 900);
}

function validateCurrentPassword(userId, password) {
  const possibleKeys = ["arcanjo_users", "users", "usuarios"];

  for (const key of possibleKeys) {
    let users;

    try {
      users = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      users = [];
    }

    if (!Array.isArray(users) || !users.length) continue;

    const found = users.find(user => {
      const sameId = String(user.id ?? user.userId ?? "") === String(userId);
      const samePassword =
        String(user.password ?? user.senha ?? "") === String(password);
      return sameId && samePassword;
    });

    if (found) return true;
  }

  return false;
}

function removeUserFromLocalLists(userId) {
  const possibleKeys = ["arcanjo_users", "users", "usuarios"];

  for (const key of possibleKeys) {
    let users;

    try {
      users = JSON.parse(localStorage.getItem(key) || "[]");
    } catch {
      users = [];
    }

    if (!Array.isArray(users) || !users.length) continue;

    const filtered = users.filter(user => String(user.id ?? user.userId ?? "") !== String(userId));
    localStorage.setItem(key, JSON.stringify(filtered));
  }
}

function removeUserScopedData(userId) {
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    if (
      key.includes(userId) ||
      key === "arcanjo_feed_posts" ||
      key === "arcanjo_current_user_id" ||
      key === "arcanjo_current_username" ||
      key === "arcanjo_current_avatar"
    ) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showSuccessMessage(message = "Configurações salvas com sucesso!") {
  const successMsg = byId("successMessage");
  const errorMsg = byId("errorMessage");

  if (errorMsg) errorMsg.classList.remove("show");

  if (successMsg) {
    successMsg.textContent = "✅ " + message;
    successMsg.classList.add("show");
    setTimeout(() => {
      successMsg.classList.remove("show");
    }, 3000);
  }
}

function showErrorMessage(message = "Ocorreu um erro.") {
  const successMsg = byId("successMessage");
  const errorMsg = byId("errorMessage");

  if (successMsg) successMsg.classList.remove("show");

  if (errorMsg) {
    errorMsg.textContent = "❌ " + message;
    errorMsg.classList.add("show");
    setTimeout(() => {
      errorMsg.classList.remove("show");
    }, 3500);
  }
}