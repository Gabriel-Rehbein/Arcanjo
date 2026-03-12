// Painel Administrativo

protectRoute();

let currentUserId = null;
let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Auth.getCurrentUser();
  currentUserId = Auth.getCurrentUserId();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Verificar se é admin
  const isAdmin = localStorage.getItem(`is_admin_${currentUserId}`);
  if (!isAdmin) {
    alert('❌ Acesso negado! Você não é administrador.');
    window.location.href = 'dashboard.html';
    return;
  }

  // Carregar dados
  loadUsers();
  loadStatistics();
  loadStorageChart();

  // Listener para busca
  document.getElementById('searchUsers').addEventListener('input', filterUsers);
});

function loadUsers() {
  // Obter todas as chaves de sessão para encontrar usuários
  const keys = Object.keys(localStorage);
  const userSessions = keys.filter(key => key.includes('user_created_'));
  
  allUsers = [];

  userSessions.forEach(sessionKey => {
    const userId = sessionKey.replace('user_created_', '');
    const sessionData = localStorage.getItem('arcanjo_user_session');
    
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        
        // Obter dados do usuário
        const profile = JSON.parse(localStorage.getItem(`profile_${userId}`) || '{}');
        const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}');
        const projects = JSON.parse(localStorage.getItem(`arcanjo_projects_${userId}`) || '[]');
        
        allUsers.push({
          id: userId,
          username: parsed.username || 'Desconhecido',
          createdAt: localStorage.getItem(sessionKey),
          profile: profile,
          settings: settings,
          projectsCount: projects.length,
          isAdmin: localStorage.getItem(`is_admin_${userId}`) === 'true'
        });
      } catch (e) {
        console.log('Erro ao carregar usuário:', e);
      }
    }
  });

  // Se não encontrou, tentar pelo padrão de chaves de perfil
  if (allUsers.length === 0) {
    keys.forEach(key => {
      if (key.startsWith('profile_')) {
        const userId = key.replace('profile_', '');
        const profile = JSON.parse(localStorage.getItem(key) || '{}');
        
        // Procurar dados na sessão
        const sessionKey = `user_created_${userId}`;
        const createdAt = localStorage.getItem(sessionKey);
        
        const settings = JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}');
        const projects = JSON.parse(localStorage.getItem(`arcanjo_projects_${userId}`) || '[]');
        
        // Obter username (se possível)
        let username = 'Usuário';
        const diaryKey = `diary_${userId}`;
        const diaryEntries = JSON.parse(localStorage.getItem(diaryKey) || '[]');
        
        allUsers.push({
          id: userId,
          username: username,
          createdAt: createdAt,
          profile: profile,
          settings: settings,
          projectsCount: projects.length,
          diariesCount: diaryEntries.length,
          isAdmin: localStorage.getItem(`is_admin_${userId}`) === 'true'
        });
      }
    });
  }

  displayUsers();
}

function displayUsers() {
  const container = document.getElementById('usersContainer');
  
  if (allUsers.length === 0) {
    container.innerHTML = '<div class="no-users"><p>📝 Nenhum usuário encontrado no sistema.</p></div>';
    return;
  }

  const html = `
    <table class="users-table">
      <thead>
        <tr>
          <th>Usuário</th>
          <th>ID</th>
          <th>Projetos</th>
          <th>Entradas de Diário</th>
          <th>Data de Criação</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${allUsers.map(user => `
          <tr>
            <td>
              <strong>${user.username}</strong>
              ${user.profile.location ? `<br><span style="font-size: 0.8rem; color: #6b7280;">${user.profile.location}</span>` : ''}
            </td>
            <td><code style="background: rgba(99, 102, 241, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">${user.id.substring(0, 8)}...</code></td>
            <td>${user.projectsCount} projetos</td>
            <td>${user.diariesCount || 0} entradas</td>
            <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
            <td>
              ${user.isAdmin ? '<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5;">👑 Admin</span>' : '<span class="badge">👤 Usuário</span>'}
            </td>
            <td>
              <div class="user-actions">
                <button class="info" onclick="viewUserDetails('${user.id}')">👁️ Ver</button>
                <button class="info" onclick="viewUserData('${user.id}')">📦 Dados</button>
                <button onclick="deleteUser('${user.id}', '${user.username}')">🗑️ Deletar</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

function filterUsers() {
  const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
  
  const filtered = allUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm) ||
    user.id.toLowerCase().includes(searchTerm)
  );

  // Mostrar filtrados
  const container = document.getElementById('usersContainer');
  
  if (filtered.length === 0) {
    container.innerHTML = '<div class="no-users"><p>📝 Nenhum usuário encontrado com esse termo.</p></div>';
    return;
  }

  const html = `
    <table class="users-table">
      <thead>
        <tr>
          <th>Usuário</th>
          <th>ID</th>
          <th>Projetos</th>
          <th>Entradas de Diário</th>
          <th>Data de Criação</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(user => `
          <tr>
            <td>
              <strong>${user.username}</strong>
              ${user.profile.location ? `<br><span style="font-size: 0.8rem; color: #6b7280;">${user.profile.location}</span>` : ''}
            </td>
            <td><code style="background: rgba(99, 102, 241, 0.1); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">${user.id.substring(0, 8)}...</code></td>
            <td>${user.projectsCount} projetos</td>
            <td>${user.diariesCount || 0} entradas</td>
            <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '-'}</td>
            <td>
              ${user.isAdmin ? '<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5;">👑 Admin</span>' : '<span class="badge">👤 Usuário</span>'}
            </td>
            <td>
              <div class="user-actions">
                <button class="info" onclick="viewUserDetails('${user.id}')">👁️ Ver</button>
                <button class="info" onclick="viewUserData('${user.id}')">📦 Dados</button>
                <button onclick="deleteUser('${user.id}', '${user.username}')">🗑️ Deletar</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

function viewUserDetails(userId) {
  const user = allUsers.find(u => u.id === userId);
  if (!user) return;

  const details = `
📊 Detalhes do Usuário: ${user.username}

ID: ${user.id}
Data de Criação: ${user.createdAt ? new Date(user.createdAt).toLocaleString('pt-BR') : '-'}
Status: ${user.isAdmin ? '👑 Administrador' : '👤 Usuário Regular'}

📝 Perfil:
- Bio: ${user.profile.bio || 'Não preenchido'}
- Localização: ${user.profile.location || 'Não informada'}
- Profissão: ${user.profile.occupation || 'Não informada'}
- Website: ${user.profile.website || 'Não informado'}
- GitHub: ${user.profile.github || 'Não informado'}
- Email: ${user.profile.email || 'Não informado'}

📈 Estatísticas:
- Projetos: ${user.projectsCount}
- Entradas de Diário: ${user.diariesCount || 0}
  `;

  alert(details);
}

function viewUserData(userId) {
  const userData = {
    profile: JSON.parse(localStorage.getItem(`profile_${userId}`) || '{}'),
    settings: JSON.parse(localStorage.getItem(`settings_${userId}`) || '{}'),
    projects: JSON.parse(localStorage.getItem(`arcanjo_projects_${userId}`) || '[]'),
    diary: JSON.parse(localStorage.getItem(`diary_${userId}`) || '[]')
  };

  const dataStr = JSON.stringify(userData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `user-data-${userId}.json`;
  link.click();
  URL.revokeObjectURL(url);

  showSuccessMessage('📥 Dados do usuário exportados!');
}

function deleteUser(userId, username) {
  if (!confirm(`⚠️ Tem certeza que deseja deletar o usuário "${username}"? Esta ação é IRREVERSÍVEL!`)) return;
  if (!confirm('🚨 CONFIRMAÇÃO FINAL: Este usuário será deletado permanentemente junto com TODOS os seus dados!')) return;

  // Encontrar todas as chaves do usuário
  const keys = Object.keys(localStorage);
  const userKeys = keys.filter(key => key.includes(userId));

  userKeys.forEach(key => {
    localStorage.removeItem(key);
  });

  // Também remover variações
  localStorage.removeItem(`profile_${userId}`);
  localStorage.removeItem(`settings_${userId}`);
  localStorage.removeItem(`arcanjo_projects_${userId}`);
  localStorage.removeItem(`diary_${userId}`);
  localStorage.removeItem(`is_admin_${userId}`);
  localStorage.removeItem(`user_created_${userId}`);

  showSuccessMessage(`🗑️ Usuário "${username}" deletado com sucesso!`);
  loadUsers();
}

function loadStatistics() {
  let totalProjects = 0;
  let totalDiaries = 0;
  let totalTasks = 0;

  const keys = Object.keys(localStorage);

  // Contar projetos
  keys.forEach(key => {
    if (key.startsWith('arcanjo_projects_')) {
      const projects = JSON.parse(localStorage.getItem(key) || '[]');
      totalProjects += projects.length;
    }
  });

  // Contar entradas de diário
  keys.forEach(key => {
    if (key.startsWith('diary_')) {
      const entries = JSON.parse(localStorage.getItem(key) || '[]');
      totalDiaries += entries.length;
    }
  });

  // Contar tarefas
  keys.forEach(key => {
    if (key.startsWith('tasks_')) {
      const tasks = JSON.parse(localStorage.getItem(key) || '[]');
      totalTasks += tasks.length;
    }
  });

  document.getElementById('totalUsers').textContent = allUsers.length;
  document.getElementById('totalProjects').textContent = totalProjects;
  document.getElementById('totalDiaries').textContent = totalDiaries;
  document.getElementById('totalTasks').textContent = totalTasks;
}

function exportData() {
  const allData = {};
  const keys = Object.keys(localStorage);

  keys.forEach(key => {
    try {
      allData[key] = JSON.parse(localStorage.getItem(key));
    } catch (e) {
      allData[key] = localStorage.getItem(key);
    }
  });

  const dataStr = JSON.stringify(allData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `arcanjo-admin-backup-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);

  showSuccessMessage('📥 Backup do sistema exportado!');
}

function clearAllCache() {
  if (!confirm('⚠️ Tem certeza que deseja limpar TODA a cache do sistema? Isso afetará todos os usuários!')) return;
  if (!confirm('🚨 CONFIRMAÇÃO FINAL: Todos os dados locais serão apagados!')) return;

  localStorage.clear();
  showSuccessMessage('🗑️ Cache do sistema limpo!');
  
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 2000);
}

function rebuildDatabase() {
  alert('🔨 Funcionalidade em desenvolvimento.\n\nEsta ferramenta permitirá reconstruir o banco de dados do sistema.');
}

function viewSystemLogs() {
  const keys = Object.keys(localStorage);
  const summary = `
📊 RELATÓRIO DO SISTEMA ARCANJO

⏰ Gerado em: ${new Date().toLocaleString('pt-BR')}

📦 Dados Armazenados:
- Total de chaves: ${keys.length}
- Tamanho aproximado: ${(new Blob([JSON.stringify(localStorage)]).size / 1024).toFixed(2)} KB

📈 Chaves por Tipo:
- Sessions: ${keys.filter(k => k.includes('session')).length}
- Perfis: ${keys.filter(k => k.includes('profile')).length}
- Configurações: ${keys.filter(k => k.includes('settings')).length}
- Projetos: ${keys.filter(k => k.includes('projects')).length}
- Diários: ${keys.filter(k => k.includes('diary')).length}
- Tarefas: ${keys.filter(k => k.includes('tasks')).length}
- Comentários: ${keys.filter(k => k.includes('comment')).length}

👥 Usuários:
${keys.filter(k => k.includes('user_created')).map(k => `- ${k}`).join('\n')}

🔑 Primeiras Chaves:
${keys.slice(0, 10).map(k => `- ${k}`).join('\n')}
  `;

  alert(summary);
}

function showSuccessMessage(message) {
  const msg = document.getElementById('successMessage');
  msg.textContent = message;
  msg.classList.add('show');
  setTimeout(() => {
    msg.classList.remove('show');
  }, 3000);
}
// Calcular armazenamento de um usuário
function calculateUserStorage(userId) {
  const MAX_STORAGE = 15 * 1024 * 1024; // 15GB em bytes
  let totalSize = 0;

  const keys = Object.keys(localStorage);
  const userKeys = keys.filter(key => key.includes(userId));

  userKeys.forEach(key => {
    const value = localStorage.getItem(key);
    totalSize += new Blob([value]).size;
  });

  return {
    used: totalSize,
    max: MAX_STORAGE,
    percentage: (totalSize / MAX_STORAGE) * 100,
    usedMB: (totalSize / 1024 / 1024).toFixed(2),
    maxGB: 15
  };
}

// Carregar gráfico de armazenamento
function loadStorageChart() {
  const container = document.getElementById('storageChartContainer');
  if (!container) return;

  const keys = Object.keys(localStorage);
  const userIds = new Set();

  // Encontrar todos os usuários
  keys.forEach(key => {
    if (key.includes('user_created_')) {
      const userId = key.replace('user_created_', '');
      userIds.add(userId);
    }
  });

  let html = `
    <div style="margin-top: 1.5rem;">
      <h3 style="color: #e8eef7; margin-bottom: 1rem;">📊 Armazenamento por Usuário</h3>
      <div style="display: grid; gap: 1.5rem;">
  `;

  userIds.forEach(userId => {
    const storage = calculateUserStorage(userId);
    const userName = getUsernameById(userId) || `Usuário ${userId.substring(0, 8)}`;
    const percentage = Math.min(storage.percentage, 100);
    const statusColor = percentage > 90 ? '#ef4444' : percentage > 75 ? '#f97316' : '#10b981';
    const statusText = percentage > 100 ? '🚨 LIMITE EXCEDIDO' : percentage > 90 ? '⚠️ AVISO' : '✅ OK';

    html += `
      <div style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 0.75rem; border: 1px solid rgba(99, 102, 241, 0.2);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <strong style="color: #e8eef7;">${userName}</strong>
          <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.9rem; color: #a5b4fc; margin-bottom: 0.5rem;">
          <span>${storage.usedMB} MB / ${storage.maxGB} GB</span>
          <span style="color: ${statusColor};">${percentage.toFixed(1)}%</span>
        </div>
        <div style="width: 100%; height: 8px; background: rgba(99, 102, 241, 0.2); border-radius: 4px; overflow: hidden;">
          <div style="width: ${Math.min(percentage, 100)}%; height: 100%; background: linear-gradient(90deg, #10b981 0%, #f97316 75%, #ef4444 100%); transition: width 0.3s;"></div>
        </div>
        ${percentage > 100 ? `<p style="color: #ef4444; margin-top: 0.5rem; font-size: 0.85rem;">⚠️ Usuário precisa assinar um plano premium</p>` : ''}
      </div>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
}

// Obter username pelo ID
function getUsernameById(userId) {
  const keys = Object.keys(localStorage);
  
  // Procurar na sessão
  const sessionKey = keys.find(k => k.includes(userId) && k.includes('session'));
  if (sessionKey) {
    try {
      const session = JSON.parse(localStorage.getItem(sessionKey));
      return session.username;
    } catch (e) {}
  }

  // Procurar no perfil
  const profileKey = `profile_${userId}`;
  if (localStorage.getItem(profileKey)) {
    try {
      const profile = JSON.parse(localStorage.getItem(profileKey));
      return profile.username;
    } catch (e) {}
  }

  return null;
}