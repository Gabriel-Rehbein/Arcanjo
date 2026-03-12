// Sistema de mensagens entre usuários

protectRoute();

let currentUserId = null;
let currentUsername = null;
let selectedUserId = null;
let selectedUsername = null;

// chave de armazenamento: messages_{user1}_{user2} (ordenados lexicograficamente)

function makeKey(id1, id2) {
  return [id1, id2].sort().join('_');
}

function saveMessage(toId, fromId, text) {
  const key = `messages_${makeKey(toId, fromId)}`;
  const msgs = JSON.parse(localStorage.getItem(key) || '[]');
  msgs.push({
    from: fromId,
    to: toId,
    text,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(key, JSON.stringify(msgs));
}

function loadMessages() {
  if (!selectedUserId) return;
  const key = `messages_${makeKey(currentUserId, selectedUserId)}`;
  const msgs = JSON.parse(localStorage.getItem(key) || '[]');
  const box = document.getElementById('chatBox');
  box.innerHTML = '';
  msgs.forEach(m => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(m.from === currentUserId ? 'self' : 'other');
    const meta = document.createElement('div');
    meta.classList.add('meta');
    meta.textContent = `${m.from === currentUserId ? 'Você' : selectedUsername} • ${new Date(m.timestamp).toLocaleString('pt-BR')}`;
    const text = document.createElement('div');
    text.textContent = m.text;
    div.appendChild(meta);
    div.appendChild(text);
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
}

function populateUserList() {
  const select = document.getElementById('userSelect');
  select.innerHTML = '<option value="">-- escolha um usuário --</option>';
  const keys = Object.keys(localStorage);
  const userIds = new Set();
  keys.forEach(key => {
    if (key.startsWith('user_created_')) {
      userIds.add(key.replace('user_created_', ''));
    }
  });
  userIds.forEach(id => {
    if (id === currentUserId) return;
    const opt = document.createElement('option');
    opt.value = id;
    opt.textContent = getUsernameById(id) || id;
    select.appendChild(opt);
  });

  // verificar se foi passado usuário via query param
  const urlParams = new URLSearchParams(window.location.search);
  const paramTo = urlParams.get('to');
  if (paramTo && userIds.has(paramTo) && paramTo !== currentUserId) {
    select.value = paramTo;
    selectedUserId = paramTo;
    selectedUsername = getUsernameById(paramTo) || '';
    loadMessages();
  }

  select.addEventListener('change', () => {
    selectedUserId = select.value;
    selectedUsername = getUsernameById(selectedUserId) || '';
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
    if (!text || !selectedUserId) return;
    saveMessage(selectedUserId, currentUserId, text);
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