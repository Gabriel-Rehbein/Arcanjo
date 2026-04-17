protectRoute();

const MESSAGE_LIMIT = 1000;
const LAST_CHAT_KEY = "arcanjo_last_chat_user";

let currentUserId = null;
let currentUsername = null;
let selectedUsername = null;

function makeKey(username1, username2) {
  return [username1, username2].sort((a, b) => a.localeCompare(b, "pt-BR")).join("_");
}

function getConversationKey(userA, userB) {
  return `messages_${makeKey(userA, userB)}`;
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeMessageText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, MESSAGE_LIMIT);
}

function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function isProfilePublic(userId) {
  const settings = safeJsonParse(localStorage.getItem(`settings_${userId}`), {});
  return settings?.publicProfile !== false;
}

function getUsernameById(userId) {
  const profile = safeJsonParse(localStorage.getItem(`profile_${userId}`), null);
  if (profile?.username) return profile.username;

  const createdUser = safeJsonParse(localStorage.getItem(`user_created_${userId}`), null);
  if (createdUser?.username) return createdUser.username;

  const keys = Object.keys(localStorage);
  const sessionKey = keys.find((k) => k.includes(userId) && k.includes("session"));
  if (sessionKey) {
    const session = safeJsonParse(localStorage.getItem(sessionKey), null);
    if (session?.username) return session.username;
  }

  return null;
}

function getAllUsers() {
  const keys = Object.keys(localStorage);
  const usernames = new Set();

  keys.forEach((key) => {
    if (!key.startsWith("user_created_")) return;

    const userId = key.replace("user_created_", "");
    if (userId === currentUserId) return;
    if (!isProfilePublic(userId)) return;

    const username = getUsernameById(userId);
    if (username && username !== currentUsername) {
      usernames.add(username);
    }
  });

  return [...usernames].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function getMessages(userA, userB) {
  const key = getConversationKey(userA, userB);
  return safeJsonParse(localStorage.getItem(key), []) || [];
}

function saveMessages(userA, userB, messages) {
  const key = getConversationKey(userA, userB);
  localStorage.setItem(key, JSON.stringify(messages));
}

function saveMessage(toUsername, fromUsername, text) {
  const cleanText = normalizeMessageText(text);
  if (!cleanText) return false;

  const msgs = getMessages(toUsername, fromUsername);
  msgs.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`,
    from: fromUsername,
    to: toUsername,
    text: cleanText,
    timestamp: new Date().toISOString(),
    read: false
  });

  saveMessages(toUsername, fromUsername, msgs);
  return true;
}

function formatDateTime(iso) {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function renderEmptyState(message) {
  const box = document.getElementById("chatBox");
  box.innerHTML = `<div class="chat-empty">${escapeHTML(message)}</div>`;
}

function loadMessages() {
  const box = document.getElementById("chatBox");

  if (!selectedUsername) {
    renderEmptyState("Selecione um usuário para começar a conversar.");
    return;
  }

  const msgs = getMessages(currentUsername, selectedUsername);
  box.innerHTML = "";

  if (!msgs.length) {
    renderEmptyState(`Nenhuma mensagem com ${selectedUsername} ainda. Envie a primeira.`);
    return;
  }

  msgs.forEach((m) => {
    const div = document.createElement("div");
    div.classList.add("message", m.from === currentUsername ? "self" : "other");

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${m.from === currentUsername ? "Você" : m.from} • ${formatDateTime(m.timestamp)}`;

    const text = document.createElement("div");
    text.className = "text";
    text.textContent = m.text;

    div.appendChild(meta);
    div.appendChild(text);
    box.appendChild(div);
  });

  box.scrollTop = box.scrollHeight;
}

function updateInputState() {
  const input = document.getElementById("messageInput");
  const button = document.getElementById("sendBtn");

  const enabled = Boolean(selectedUsername);
  input.disabled = !enabled;
  button.disabled = !enabled;

  if (!enabled) {
    input.value = "";
  } else {
    input.focus();
  }
}

function persistSelectedChat() {
  if (selectedUsername) {
    localStorage.setItem(`${LAST_CHAT_KEY}_${currentUsername}`, selectedUsername);
  }
}

function restoreSelectedChat(availableUsers) {
  const urlParams = new URLSearchParams(window.location.search);
  const paramTo = urlParams.get("to");
  const savedChat = localStorage.getItem(`${LAST_CHAT_KEY}_${currentUsername}`);

  if (paramTo && availableUsers.includes(paramTo) && paramTo !== currentUsername) {
    return paramTo;
  }

  if (savedChat && availableUsers.includes(savedChat) && savedChat !== currentUsername) {
    return savedChat;
  }

  return "";
}

function populateUserList() {
  const select = document.getElementById("userSelect");
  const usernames = getAllUsers();

  select.innerHTML = '<option value="">-- escolha um usuário --</option>';

  usernames.forEach((username) => {
    const opt = document.createElement("option");
    opt.value = username;
    opt.textContent = username;
    select.appendChild(opt);
  });

  const restored = restoreSelectedChat(usernames);
  if (restored) {
    select.value = restored;
    selectedUsername = restored;
  }

  updateInputState();
  loadMessages();

  select.addEventListener("change", () => {
    selectedUsername = select.value || null;
    persistSelectedChat();
    updateInputState();
    loadMessages();
  });
}

function autoResizeTextarea() {
  const textarea = document.getElementById("messageInput");
  textarea.style.height = "auto";
  textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
}

function handleSendMessage() {
  const input = document.getElementById("messageInput");
  const text = normalizeMessageText(input.value);

  if (!selectedUsername || !text) return;

  const saved = saveMessage(selectedUsername, currentUsername, text);
  if (!saved) return;

  input.value = "";
  input.style.height = "auto";
  loadMessages();
}

function bindEvents() {
  const input = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendBtn");

  sendBtn.addEventListener("click", handleSendMessage);

  input.addEventListener("input", autoResizeTextarea);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  window.addEventListener("storage", (event) => {
    if (!selectedUsername) return;

    const activeKey = getConversationKey(currentUsername, selectedUsername);
    if (event.key === activeKey) {
      loadMessages();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    currentUserId = Auth.getCurrentUserId();
    currentUsername = Auth.getCurrentUser();

    if (!currentUserId || !currentUsername) {
      window.location.href = "login.html";
      return;
    }

    populateUserList();
    bindEvents();
  } catch (error) {
    console.error("Erro ao iniciar chat:", error);
    renderEmptyState("Erro ao carregar o chat.");
  }
});