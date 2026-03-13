// Sistema de mensagens entre usuários

protectRoute();

let currentUserId = null;
let currentUsername = null;
let selectedUsername = null;

// chave de armazenamento: messages_{user1}_{user2} (ordenados lexicograficamente por username)

function makeKey(username1, username2) {
  return [username1, username2].sort().join('_');
}

function saveMessage(toUsername, fromUsername, text) {
  const key = `messages_${makeKey(toUsername, fromUsername)}`;
  const msgs = JSON.parse(localStorage.getItem(key) || '[]');
  msgs.push({
    from: fromUsername,
    to: toUsername,
    text,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(msgs));
}

function loadMessages() {
  if (!selectedUsername) return;
  const key = `messages_${makeKey(currentUsername, selectedUsername)}`;
  const msgs = JSON.parse(localStorage.getItem(key) || '[]');
  const box = document.getElementById('chatBox');
  box.innerHTML = '';
  msgs.forEach(m => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(m.from === currentUsername ? 'self' : 'other');
    const meta = document.createElement('div');
    meta.classList.add('meta');
    meta.textContent = `${m.from === currentUsername ? 'Você' : m.from} • ${new Date(m.timestamp).toLocaleString('pt-BR')}`;
    const text = document.createElement('div');
    text.textContent = m.text;
    div.appendChild(meta);
    div.appendChild(text);
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

function isProfilePublic(userId) {
  const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}');
  return settings.publicProfile !== false; // padrão true se não definido
}

function populateUserList() {
  const select = document.getElementById('userSelect');
  select.innerHTML = '<option value="">-- escolha um usuário --</option>';
  const keys = Object.keys(localStorage);
  const usernames = new Set();
  keys.forEach(key => {
    if (key.startsWith('user_created_')) {
      const userId = key.replace('user_created_', '');
      if (userId !== currentUserId && isProfilePublic(userId)) {
        const username = getUsernameById(userId);
        if (username) {
          usernames.add(username);
        }
      }
    }
  });
  usernames.forEach(username => {
    if (username === currentUsername) return;
    const opt = document.createElement('option');
    opt.value = username;
    opt.textContent = username;
    select.appendChild(opt);
  });

  // verificar se foi passado usuário via query param
  const urlParams = new URLSearchParams(window.location.search);
  const paramTo = urlParams.get('to');
  if (paramTo && usernames.has(paramTo) && paramTo !== currentUsername) {
    select.value = paramTo;
    selectedUsername = paramTo;
    loadMessages();
  }

  select.addEventListener('change', () => {
    selectedUsername = select.value;
    loadMessages();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  currentUserId = Auth.getCurrentUserId();
  currentUsername = Auth.getCurrentUser();

  if (!currentUserId) {
    window.location.href = 'login.html';
    return;
  }

  populateUserList();

  document.getElementById('sendBtn').addEventListener('click', () => {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    if (!text || !selectedUsername) return;
    saveMessage(selectedUsername, currentUsername, text);
    input.value = '';
    loadMessages();
  });
});

// reusar função auxiliar de admin.js para obter nome
function getUsernameById(userId) {
  const sessionKey = Object.keys(localStorage).find(k => k.includes(userId) && k.includes('session'));
  if (sessionKey) {
    try {
      return JSON.parse(localStorage.getItem(sessionKey)).username;
    } catch (e) {}
  }
  const profile = localStorage.getItem(`profile_${userId}`);
  if (profile) {
    try { return JSON.parse(profile).username; } catch (e) {}
  }
  return null;
}