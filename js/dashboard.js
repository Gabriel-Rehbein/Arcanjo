// Dashboard - Painel Principal

// Verificar autenticação
protectRoute();

let projects = [];
let currentUserId = null;

// Elementos (null no início)
let userDisplay, userMenuBtn, userMenu, logoutBtn, settingsBtn, profileBtn;
let addProjectBtn, projectModal, closeModalBtn, projectForm, grid, searchInput, tagFilter;
let logoutBtnTop;
let currentProjectFiles = []; // Arquivos do projeto atual

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Pegar usuário AGORA que a página já carregou
  const currentUser = Auth.getCurrentUser();
  currentUserId = Auth.getCurrentUserId();

  console.log('Usuário:', currentUser);
  console.log('ID:', currentUserId);

  // Verificar se é admin
  const isAdmin = localStorage.getItem(`is_admin_${currentUserId}`) === 'true';
  if (isAdmin) {
    // Adicionar botão de admin oculto no menu
    setTimeout(() => {
      const userMenu = document.getElementById('userMenu');
      if (userMenu) {
        const adminBtn = document.createElement('button');
        adminBtn.innerHTML = '🛡️ Admin Panel';
        adminBtn.style.cssText = 'background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; width: 100%; text-align: left; padding: 0.75rem;';
        adminBtn.onclick = () => {
          window.location.href = 'admin.html';
        };
        userMenu.insertBefore(adminBtn, userMenu.firstChild);
      }
    }, 100);
  }

  // Capturar elementos agora que o DOM está pronto
  userDisplay = document.getElementById('userDisplay');
  userMenuBtn = document.getElementById('userMenuBtn');
  userMenu = document.getElementById('userMenu');
  logoutBtn = document.getElementById('logoutBtn');
  settingsBtn = document.getElementById('settingsBtn');
  profileBtn = document.getElementById('profileBtn');
  addProjectBtn = document.getElementById('addProject');
  projectModal = document.getElementById('projectModal');
  closeModalBtn = document.getElementById('closeModal');
  projectForm = document.getElementById('projectForm');
  grid = document.getElementById('grid');
  searchInput = document.getElementById('q');
  tagFilter = document.getElementById('tagFilter');
  logoutBtnTop = document.getElementById('logoutBtnTop');

  // Upload de arquivos
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileList = document.getElementById('fileList');

  if (uploadBtn) {
    uploadBtn.addEventListener('click', async () => {
      const files = fileInput.files;
      if (files.length === 0) {
        alert('Selecione um arquivo primeiro!');
        return;
      }

      for (let file of files) {
        // Verificar limite de armazenamento
        const currentUsage = await getCurrentStorageUsage();
        if (currentUsage + file.size > 15 * 1024 * 1024 * 1024) { // 15GB
          alert('Limite de armazenamento excedido! Máximo 15GB.');
          return;
        }

        try {
          const filePath = `${currentUserId}/${Date.now()}_${file.name}`;
          await supabase.uploadFile('project-files', filePath, file);
          
          currentProjectFiles.push({
            name: file.name,
            size: file.size,
            path: filePath,
            uploaded_at: new Date().toISOString()
          });
          
          updateFileList();
        } catch (error) {
          console.error('Erro no upload:', error);
          alert('Erro ao fazer upload do arquivo.');
        }
      }
      
      fileInput.value = ''; // Limpar input
    });
  }

  // Mostrar informações do usuário
  if (userDisplay) {
    userDisplay.textContent = `👤 ${currentUser}`;
  }

  // Mostrar mensagem de boas-vindas
  const userWelcome = document.getElementById('userWelcome');
  if (userWelcome) {
    userWelcome.textContent = currentUser;
  }

  // Menu dropdown
  if (userMenuBtn) {
    userMenuBtn.addEventListener('click', () => {
      userMenu.classList.toggle('show');
    });
  }

  document.addEventListener('click', (e) => {
    if (userMenu && !e.target.closest('.menu-dropdown')) {
      userMenu.classList.remove('show');
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que quer sair?')) {
        Auth.logout();
      }
    });
  }

  // Logout (botão topo)
  if (logoutBtnTop) {
    logoutBtnTop.addEventListener('click', () => {
      if (confirm('Tem certeza que quer sair?')) {
        Auth.logout();
      }
    });
  }

  // Configurações e Perfil
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      window.location.href = 'settings.html';
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      window.location.href = 'profile.html';
    });
  }

  // Diário e Calendário
  const diaryBtn = document.getElementById('diaryBtn');
  const calendarBtn = document.getElementById('calendarBtn');

  if (diaryBtn) {
    diaryBtn.addEventListener('click', () => {
      window.location.href = 'diary.html';
    });
  }

  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      window.location.href = 'calendar.html';
    });
  }

  // Chat button
  const chatBtn = document.getElementById('chatBtn');
  if (chatBtn) {
    chatBtn.addEventListener('click', () => {
      window.location.href = 'messages.html';
    });
  }

  // Modal de Projeto
  if (addProjectBtn) {
    console.log('Botão adicionar projeto encontrado');
    addProjectBtn.addEventListener('click', (e) => {
      console.log('Botão clicado!');
      e.preventDefault();
      if (projectForm) {
        projectForm.reset();
      }
      if (document.getElementById('modalTitle')) {
        document.getElementById('modalTitle').textContent = 'Adicionar Projeto';
      }
      if (projectModal) {
        projectModal.classList.add('show');
        console.log('Modal aberto');
      }
    });
  } else {
    console.warn('Botão adicionar projeto NÃO encontrado');
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      if (projectModal) {
        projectModal.classList.remove('show');
      }
    });
  }

  if (projectModal) {
    projectModal.addEventListener('click', (e) => {
      if (e.target === projectModal) {
        projectModal.classList.remove('show');
      }
    });
  }

  // Salvar Projeto
  if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const project = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        tag: document.getElementById('tag').value,
        url: document.getElementById('url').value,
        usuario: currentUser,
        usuarioId: currentUserId,
        criado: new Date().toISOString(),
      };

      projects.push(project);
      saveProjects();
      renderProjects();
      projectModal.classList.remove('show');
      projectForm.reset();
      alert('Projeto adicionado com sucesso!');
    });
  }

  // Carregar projetos
  (async () => {
    await loadProjects();
  })();

  // Busca e Filtro
  if (searchInput) {
    searchInput.addEventListener('input', renderProjects);
  }
  if (tagFilter) {
    tagFilter.addEventListener('change', renderProjects);
  }

  // Funções que precisam de currentUser e currentUserId
  async function loadProjects() {
    try {
      const result = await supabase.select('projects', { user_id: currentUserId });
      // Mapear campos do banco para o formato usado no código
      projects = (result || []).map(p => ({
        titulo: p.title,
        descricao: p.description,
        tag: p.tag,
        createdAt: p.created_at,
        files: p.files || []
      }));
      renderProjects();
      updateTags();
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      // Fallback para localStorage se der erro
      const saved = localStorage.getItem(`arcanjo_projects_${currentUserId}`);
      projects = saved ? JSON.parse(saved) : [];
      renderProjects();
      updateTags();
    }
  }

  async function saveProjects() {
    // Salvar no Supabase
    try {
      // Primeiro, deletar projetos existentes do usuário
      await supabase.deleteByFilter('projects', { user_id: currentUserId });
      
      // Inserir projetos atualizados
      for (const project of projects) {
        await supabase.insert('projects', {
          user_id: currentUserId,
          title: project.titulo,
          description: project.descricao || '',
          tag: project.tag || '',
          files: project.files || [],
          created_at: project.createdAt || new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
      // Fallback para localStorage
      localStorage.setItem(`arcanjo_projects_${currentUserId}`, JSON.stringify(projects));
    }
  }

  function renderProjects() {
    if (!grid || !searchInput) return;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedTag = tagFilter.value;

    const filtered = projects.filter(p => {
      const matchSearch = p.titulo.toLowerCase().includes(searchTerm) ||
                         (p.descricao && p.descricao.toLowerCase().includes(searchTerm));
      const matchTag = !selectedTag || p.tag === selectedTag;
      return matchSearch && matchTag;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<p class="muted">Nenhum projeto encontrado. Comece criando um novo!</p>';
      return;
    }

    grid.innerHTML = filtered.map((p, i) => {
      const comments = JSON.parse(localStorage.getItem(`project_comments_${i}`) || '[]');
      return `
      <div class="card project-card">
        <div class="card-header">
          <h3>${p.titulo}</h3>
          <span class="tag tag-${p.tag}">${p.tag}</span>
        </div>
        <p class="muted small">${p.descricao || 'Sem descrição'}</p>
        ${p.url ? `<p class="muted small">🔗 <a href="${p.url}" target="_blank">${p.url}</a></p>` : ''}
        <p class="muted tiny">Por ${p.usuario}</p>
        
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(99, 102, 241, 0.2);">
          <div style="font-size: 0.85rem; color: #8ab4ff; margin-bottom: 0.5rem;">💬 Atividades (${comments.length})</div>
          <div style="max-height: 120px; overflow-y: auto; margin-bottom: 0.75rem;">
            ${comments.length > 0 ? comments.slice().reverse().map(c => `
              <div style="background: rgba(99, 102, 241, 0.1); padding: 0.5rem; border-radius: 0.3rem; margin-bottom: 0.3rem; font-size: 0.8rem;">
                <div style="color: #a5b4fc; font-weight: 600;">${c.date}</div>
                <div style="color: #e8eef7;">${c.text.substring(0, 100)}${c.text.length > 100 ? '...' : ''}</div>
              </div>
            `).join('') : '<div style="color: #6b7280; font-size: 0.8rem;">Sem atividades ainda</div>'}
          </div>
          <input type="text" class="comment-input" placeholder="Adicionar atividade..." id="comment-${i}" onkeypress="if(event.key==='Enter') addProjectComment(${i}, this.value, '${p.titulo}')" style="width: 100%; padding: 0.5rem; border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 0.3rem; background: rgba(11, 15, 20, 0.5); color: #e8eef7; font-size: 0.85rem; margin-bottom: 0.75rem;" />
        </div>
        
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm" onclick="editProject(${i})">✏️ Editar</button>
          <button class="btn btn-sm ghost" onclick="deleteProject(${i})">🗑️ Deletar</button>
        </div>
      </div>
    `;
    }).join('');
  }

  function updateTags() {
    if (!tagFilter) return;
    const tags = [...new Set(projects.map(p => p.tag).filter(Boolean))];
    const currentValue = tagFilter.value;

    const options = tagFilter.querySelectorAll('option:not(:first-child)');
    options.forEach(opt => opt.remove());

    tags.forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
      tagFilter.appendChild(option);
    });

    tagFilter.value = currentValue;
  }

  // Expor funções para o escopo global
  window.editProject = function(index) {
    const p = projects[index];
    document.getElementById('titulo').value = p.titulo;
    document.getElementById('descricao').value = p.descricao || '';
    document.getElementById('tag').value = p.tag || '';
    document.getElementById('url').value = p.url || '';
    document.getElementById('modalTitle').textContent = 'Editar Projeto';

    projectModal.classList.add('show');

    projectForm.onsubmit = (e) => {
      e.preventDefault();
      projects[index] = {
        ...p,
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        tag: document.getElementById('tag').value,
        url: document.getElementById('url').value,
      };
      saveProjects();
      renderProjects();
      projectModal.classList.remove('show');
      projectForm.onsubmit = null;
      alert('Projeto atualizado!');
    };
  };

  window.deleteProject = function(index) {
    if (confirm('Tem certeza que quer deletar este projeto?')) {
      projects.splice(index, 1);
      saveProjects();
      renderProjects();
    }
  };

  // CSS para cards de projeto
  const style = document.createElement('style');
  style.textContent = `
    .project-card {
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .project-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(99, 102, 241, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .tag-web { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
    .tag-mobile { background: rgba(34, 197, 94, 0.2); color: #86efac; }
    .tag-desktop { background: rgba(168, 85, 247, 0.2); color: #d8b4fe; }
    .tag-game { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
    .tag-ml { background: rgba(251, 146, 60, 0.2); color: #fdba74; }

    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    a {
      color: #60a5fa;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);

  // Adicionar comentário ao projeto
  window.addProjectComment = function(projectIndex, commentText, projectTitle) {
    if (commentText.trim().length === 0) return;

    const commentsKey = `project_comments_${projectIndex}`;
    let comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');

    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    comments.push({
      text: commentText.trim(),
      date: dateStr,
      addedAt: new Date().toISOString()
    });

    localStorage.setItem(commentsKey, JSON.stringify(comments));

    // Limpar input
    const inputEl = document.getElementById(`comment-${projectIndex}`);
    if (inputEl) inputEl.value = '';

    // Recarregar
    renderProjects();
  };

  // Carregar indicador de armazenamento
  loadStorageIndicator();
});

function loadStorageIndicator() {
  const MAX_STORAGE = 15 * 1024 * 1024; // 15GB em bytes
  let totalSize = 0;

  const keys = Object.keys(localStorage);
  const userKeys = keys.filter(key => key.includes(currentUserId));

  userKeys.forEach(key => {
    const value = localStorage.getItem(key);
    totalSize += new Blob([value]).size;
  });

  const percentage = (totalSize / MAX_STORAGE) * 100;
  const usedMB = (totalSize / 1024 / 1024).toFixed(2);
  const usedGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);

  const storageText = document.getElementById('storageText');
  const storageBar = document.getElementById('storageBar');
  const storageWarning = document.getElementById('storageWarning');

  storageText.textContent = `${usedGB} GB / 15 GB utilizado (${percentage.toFixed(1)}%)`;
  storageBar.style.width = Math.min(percentage, 100) + '%';

  if (percentage > 90) {
    storageWarning.style.display = 'block';
  } else {
    storageWarning.style.display = 'none';
  }

  // Atualizar cor baseado no percentual
  if (percentage > 100) {
    storageBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
    storageText.style.color = '#fca5a5';
  } else if (percentage > 90) {
    storageBar.style.background = 'linear-gradient(90deg, #f97316 0%, #ea580c 100%)';
  }
}
