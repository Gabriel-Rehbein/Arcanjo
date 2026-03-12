// Página de Configurações

protectRoute();

let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Auth.getCurrentUser();
  currentUserId = Auth.getCurrentUserId();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Carregar configurações salvas
  loadSettings();

  // Listeners para toggles
  document.getElementById('emailNotifications').addEventListener('click', toggleNotifications);
  document.getElementById('dailyNotifications').addEventListener('click', toggleDaily);
  document.getElementById('publicProfile').addEventListener('click', togglePublic);
  document.getElementById('showEmail').addEventListener('click', toggleShowEmail);

  // Listeners para cores
  document.querySelectorAll('.color-option').forEach(color => {
    color.addEventListener('click', selectColor);
  });

  // Listeners para botões
  document.getElementById('saveEmailBtn').addEventListener('click', saveNotificationEmail);
  document.getElementById('notificationTime').addEventListener('change', saveNotificationTime);
  document.getElementById('themeSelect').addEventListener('change', saveTheme);
  document.getElementById('saveAllBtn').addEventListener('click', saveAllSettings);
  document.getElementById('downloadDataBtn').addEventListener('click', downloadData);
  document.getElementById('clearCacheBtn').addEventListener('click', clearCache);
  document.getElementById('changePasswordBtn').addEventListener('click', changePassword);
  document.getElementById('deleteAccountBtn').addEventListener('click', deleteAccount);
});

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem(`settings_${currentUserId}`) || '{}');

  // Notificações
  if (settings.emailNotifications) {
    document.getElementById('emailNotifications').classList.add('active');
  }
  if (settings.dailyNotifications) {
    document.getElementById('dailyNotifications').classList.add('active');
  }

  document.getElementById('notificationEmail').value = settings.notificationEmail || '';
  document.getElementById('notificationTime').value = settings.notificationTime || '08:00';

  // Privacidade
  if (settings.publicProfile) {
    document.getElementById('publicProfile').classList.add('active');
  }
  if (settings.showEmail) {
    document.getElementById('showEmail').classList.add('active');
  }

  // Tema
  document.getElementById('themeSelect').value = settings.theme || 'dark';

  // Cor de fundo
  const backgroundColor = settings.backgroundColor || '#0b0f14';
  document.querySelectorAll('.color-option').forEach(el => {
    if (el.getAttribute('data-color') === backgroundColor) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
  applyBackgroundColor(backgroundColor);
}

function toggleNotifications() {
  const btn = document.getElementById('emailNotifications');
  btn.classList.toggle('active');
  saveSettings();
}

function toggleDaily() {
  const btn = document.getElementById('dailyNotifications');
  btn.classList.toggle('active');
  saveSettings();
}

function togglePublic() {
  const btn = document.getElementById('publicProfile');
  btn.classList.toggle('active');
  saveSettings();
}

function toggleShowEmail() {
  const btn = document.getElementById('showEmail');
  btn.classList.toggle('active');
  saveSettings();
}

function selectColor(e) {
  const color = e.target.getAttribute('data-color');
  
  document.querySelectorAll('.color-option').forEach(el => {
    el.classList.remove('active');
  });
  e.target.classList.add('active');

  applyBackgroundColor(color);
  saveSettings();
}

function applyBackgroundColor(color) {
  document.documentElement.style.setProperty('--bg-color', color);
  document.body.style.backgroundColor = color;
}

function saveNotificationEmail() {
  const email = document.getElementById('notificationEmail').value;
  
  if (email && !validateEmail(email)) {
    alert('Por favor, insira um email válido!');
    return;
  }

  const settings = JSON.parse(localStorage.getItem(`settings_${currentUserId}`) || '{}');
  settings.notificationEmail = email;
  localStorage.setItem(`settings_${currentUserId}`, JSON.stringify(settings));

  showSuccessMessage();
  console.log('Email de notificação salvo:', email);
}

function saveNotificationTime() {
  saveSettings();
}

function saveTheme() {
  saveSettings();
}

function saveSettings() {
  const settings = {
    emailNotifications: document.getElementById('emailNotifications').classList.contains('active'),
    dailyNotifications: document.getElementById('dailyNotifications').classList.contains('active'),
    notificationEmail: document.getElementById('notificationEmail').value,
    notificationTime: document.getElementById('notificationTime').value,
    publicProfile: document.getElementById('publicProfile').classList.contains('active'),
    showEmail: document.getElementById('showEmail').classList.contains('active'),
    theme: document.getElementById('themeSelect').value,
    backgroundColor: document.querySelector('.color-option.active')?.getAttribute('data-color') || '#0b0f14',
    updated: new Date().toISOString()
  };

  localStorage.setItem(`settings_${currentUserId}`, JSON.stringify(settings));
  console.log('Configurações salvas:', settings);
}

function saveAllSettings() {
  saveSettings();
  showSuccessMessage();
}

function downloadData() {
  const settings = JSON.parse(localStorage.getItem(`settings_${currentUserId}`) || '{}');
  const profile = JSON.parse(localStorage.getItem(`profile_${currentUserId}`) || '{}');
  const projects = JSON.parse(localStorage.getItem(`arcanjo_projects_${currentUserId}`) || '[]');

  const allData = {
    settings,
    profile,
    projects,
    exportedAt: new Date().toISOString()
  };

  const dataStr = JSON.stringify(allData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `arcanjo-backup-${currentUserId}-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  showSuccessMessage('Dados baixados com sucesso!');
}

function clearCache() {
  if (confirm('Tem certeza que deseja limpar o cache? Isso não pode ser desfeito.')) {
    localStorage.clear();
    alert('Cache limpo! A página será recarregada...');
    window.location.href = 'login.html';
  }
}

function changePassword() {
  const newPassword = prompt('Digite a nova senha:');
  if (newPassword && newPassword.length >= 6) {
    const currentPassword = prompt('Digite a senha atual para confirmar:');
    // Aqui você verificaria a senha atual
    // Por enquanto, apenas simulamos
    alert('Senha alterada com sucesso!');
    console.log('Senha alterada');
  } else if (newPassword) {
    alert('A senha deve ter no mínimo 6 caracteres!');
  }
}

function deleteAccount() {
  if (confirm('Esta ação é IRREVERSÍVEL! Todos os seus dados serão deletados. Tem certeza?')) {
    const confirmDelete = prompt('Digite sua senha para confirmar a exclusão da conta:');
    if (confirmDelete) {
      alert('Sua conta foi deletada permanentemente.');
      Auth.logout();
    }
  }
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function showSuccessMessage(message = 'Configurações salvas com sucesso!') {
  const successMsg = document.getElementById('successMessage');
  if (successMsg) {
    successMsg.textContent = '✅ ' + message;
    successMsg.classList.add('show');
    setTimeout(() => {
      successMsg.classList.remove('show');
    }, 3000);
  }
}
