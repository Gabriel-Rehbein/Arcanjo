// Dashboard - Painel Principal

// Verificar autenticação
protectRoute();

let projects = [];

// Elementos (null no início)
let userDisplay, userMenuBtn, userMenu, logoutBtn, settingsBtn, profileBtn;
let addProjectBtn, projectModal, closeModalBtn, projectForm, grid, searchInput, tagFilter;
let logoutBtnTop;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  // Pegar usuário AGORA que a página já carregou
  const currentUser = Auth.getCurrentUser();
  const currentUserId = Auth.getCurrentUserId();

  console.log('Usuário:', currentUser);
  console.log('ID:', currentUserId);

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
      alert('Página de Configurações em desenvolvimento');
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener('click', () => {
      alert('Página de Perfil em desenvolvimento');
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
  loadProjects();

  // Busca e Filtro
  if (searchInput) {
    searchInput.addEventListener('input', renderProjects);
  }
  if (tagFilter) {
    tagFilter.addEventListener('change', renderProjects);
  }

  // Funções que precisam de currentUser e currentUserId
  function loadProjects() {
    const saved = localStorage.getItem(`arcanjo_projects_${currentUserId}`);
    projects = saved ? JSON.parse(saved) : [];
    renderProjects();
    updateTags();
  }

  function saveProjects() {
    localStorage.setItem(`arcanjo_projects_${currentUserId}`, JSON.stringify(projects));
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

    grid.innerHTML = filtered.map((p, i) => `
      <div class="card project-card">
        <div class="card-header">
          <h3>${p.titulo}</h3>
          <span class="tag tag-${p.tag}">${p.tag}</span>
        </div>
        <p class="muted small">${p.descricao || 'Sem descrição'}</p>
        ${p.url ? `<p class="muted small">🔗 <a href="${p.url}" target="_blank">${p.url}</a></p>` : ''}
        <p class="muted tiny">Por ${p.usuario}</p>
        <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
          <button class="btn btn-sm" onclick="editProject(${i})">✏️ Editar</button>
          <button class="btn btn-sm ghost" onclick="deleteProject(${i})">🗑️ Deletar</button>
        </div>
      </div>
    `).join('');
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
});
