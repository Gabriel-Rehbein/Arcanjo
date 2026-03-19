// Dashboard - Painel Principal

protectRoute();

const DASHBOARD_STORAGE_KEY_PREFIX = "arcanjo_projects_";
const COMMENTS_STORAGE_KEY_PREFIX = "project_comments_";
const MAX_STORAGE_BYTES = 15 * 1024 * 1024 * 1024; // 15 GB

let projects = [];
let currentUser = null;
let currentUserId = null;
let editingProjectId = null;
let currentProjectFiles = [];

// Elementos
let userDisplay;
let userMenuBtn;
let userMenu;
let logoutBtn;
let logoutBtnTop;
let settingsBtn;
let profileBtn;
let addProjectBtn;
let projectModal;
let closeModalBtn;
let projectForm;
let grid;
let searchInput;
let tagFilter;
let userWelcome;
let fileInput;
let uploadBtn;
let fileList;

document.addEventListener("DOMContentLoaded", async () => {
  initializeUser();
  injectAdminButtonIfNeeded();
  cacheElements();
  bindStaticEvents();
  injectProjectStyles();

  await loadProjects();
  renderProjects();
  updateTags();
  loadStorageIndicator();
});

function initializeUser() {
  currentUser = Auth.getCurrentUser();
  currentUserId = Auth.getCurrentUserId();

  console.log("Usuário:", currentUser);
  console.log("ID:", currentUserId);
}

function cacheElements() {
  userDisplay = document.getElementById("userDisplay");
  userMenuBtn = document.getElementById("userMenuBtn");
  userMenu = document.getElementById("userMenu");
  logoutBtn = document.getElementById("logoutBtn");
  logoutBtnTop = document.getElementById("logoutBtnTop");
  settingsBtn = document.getElementById("settingsBtn");
  profileBtn = document.getElementById("profileBtn");
  addProjectBtn = document.getElementById("addProject");
  projectModal = document.getElementById("projectModal");
  closeModalBtn = document.getElementById("closeModal");
  projectForm = document.getElementById("projectForm");
  grid = document.getElementById("grid");
  searchInput = document.getElementById("q");
  tagFilter = document.getElementById("tagFilter");
  userWelcome = document.getElementById("userWelcome");
  fileInput = document.getElementById("fileInput");
  uploadBtn = document.getElementById("uploadBtn");
  fileList = document.getElementById("fileList");

  if (userDisplay) {
    userDisplay.textContent = `👤 ${currentUser}`;
  }

  if (userWelcome) {
    userWelcome.textContent = currentUser;
  }
}

function bindStaticEvents() {
  if (userMenuBtn && userMenu) {
    userMenuBtn.addEventListener("click", () => {
      userMenu.classList.toggle("show");
    });
  }

  document.addEventListener("click", (e) => {
    if (userMenu && !e.target.closest(".menu-dropdown")) {
      userMenu.classList.remove("show");
    }
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  if (logoutBtnTop) {
    logoutBtnTop.addEventListener("click", handleLogout);
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      window.location.href = "settings.html";
    });
  }

  if (profileBtn) {
    profileBtn.addEventListener("click", () => {
      window.location.href = "profile.html";
    });
  }

  const diaryBtn = document.getElementById("diaryBtn");
  const calendarBtn = document.getElementById("calendarBtn");
  const chatBtn = document.getElementById("chatBtn");

  if (diaryBtn) {
    diaryBtn.addEventListener("click", () => {
      window.location.href = "diary.html";
    });
  }

  if (calendarBtn) {
    calendarBtn.addEventListener("click", () => {
      window.location.href = "calendar.html";
    });
  }

  if (chatBtn) {
    chatBtn.addEventListener("click", () => {
      window.location.href = "messages.html";
    });
  }

  if (addProjectBtn) {
    addProjectBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openProjectModal();
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeProjectModal);
  }

  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) {
        closeProjectModal();
      }
    });
  }

  if (projectForm) {
    projectForm.addEventListener("submit", handleProjectSubmit);
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderProjects);
  }

  if (tagFilter) {
    tagFilter.addEventListener("change", renderProjects);
  }

  if (uploadBtn) {
    uploadBtn.addEventListener("click", handleFileUpload);
  }
}

function injectAdminButtonIfNeeded() {
  const isAdmin = localStorage.getItem(`is_admin_${currentUserId}`) === "true";

  if (!isAdmin) return;

  setTimeout(() => {
    const menu = document.getElementById("userMenu");
    if (!menu || menu.querySelector(".admin-panel-btn")) return;

    const adminBtn = document.createElement("button");
    adminBtn.className = "admin-panel-btn";
    adminBtn.innerHTML = "🛡️ Admin Panel";
    adminBtn.style.cssText = `
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      width: 100%;
      text-align: left;
      padding: 0.75rem;
    `;
    adminBtn.addEventListener("click", () => {
      window.location.href = "admin.html";
    });

    menu.insertBefore(adminBtn, menu.firstChild);
  }, 100);
}

function handleLogout() {
  if (confirm("Tem certeza que quer sair?")) {
    Auth.logout();
  }
}

function getProjectsStorageKey() {
  return `${DASHBOARD_STORAGE_KEY_PREFIX}${currentUserId}`;
}

function getCommentsStorageKey(projectId) {
  return `${COMMENTS_STORAGE_KEY_PREFIX}${projectId}`;
}

function normalizeProject(project = {}) {
  return {
    id: project.id ?? crypto.randomUUID(),
    titulo: project.titulo ?? project.title ?? "Projeto sem título",
    descricao: project.descricao ?? project.description ?? "",
    tag: project.tag ?? project.type ?? "",
    url: project.url ?? project.demo ?? "",
    github: project.github ?? "#",
    image: project.image ?? "img/logoaba.png",
    usuario: project.usuario ?? project.author ?? currentUser ?? "Usuário",
    usuarioId: project.usuarioId ?? project.user_id ?? currentUserId,
    files: Array.isArray(project.files) ? project.files : [],
    criado: project.criado ?? project.created_at ?? new Date().toISOString(),
    atualizado: project.atualizado ?? project.updated_at ?? new Date().toISOString(),
    isPublic: project.isPublic ?? project.is_public ?? true
  };
}

async function loadProjects() {
  try {
    const result = await supabase.select("projects", { user_id: currentUserId });

    projects = Array.isArray(result)
      ? result.map(project => normalizeProject(project))
      : [];

    saveProjectsToLocalStorage();
  } catch (error) {
    console.error("Erro ao carregar projetos do Supabase:", error);
    loadProjectsFromLocalStorage();
  }
}

function loadProjectsFromLocalStorage() {
  const saved = localStorage.getItem(getProjectsStorageKey());

  try {
    const parsed = saved ? JSON.parse(saved) : [];
    projects = Array.isArray(parsed) ? parsed.map(normalizeProject) : [];
  } catch {
    projects = [];
  }
}

function saveProjectsToLocalStorage() {
  localStorage.setItem(getProjectsStorageKey(), JSON.stringify(projects));
}

async function syncProjectsToDatabase() {
  try {
    await supabase.deleteByFilter("projects", { user_id: currentUserId });

    for (const project of projects) {
      await supabase.insert("projects", {
        id: project.id,
        user_id: project.usuarioId,
        author: project.usuario,
        title: project.titulo,
        description: project.descricao,
        type: project.tag || "Projeto",
        tag: project.tag || "Projeto",
        demo: project.url || "#",
        github: project.github || "#",
        image: project.image || "img/logoaba.png",
        files: project.files || [],
        is_public: project.isPublic,
        created_at: project.criado,
        updated_at: project.atualizado
      });
    }
  } catch (error) {
    console.error("Erro ao sincronizar projetos no Supabase:", error);
    throw error;
  }
}

async function persistProjects() {
  saveProjectsToLocalStorage();

  try {
    await syncProjectsToDatabase();
  } catch (error) {
    console.warn("Fallback localStorage mantido por falha no banco.");
  }

  loadStorageIndicator();
}

function openProjectModal(project = null) {
  editingProjectId = project ? project.id : null;
  currentProjectFiles = project?.files ? [...project.files] : [];

  if (projectForm) {
    projectForm.reset();
  }

  setInputValue("titulo", project?.titulo ?? "");
  setInputValue("descricao", project?.descricao ?? "");
  setInputValue("tag", project?.tag ?? "");
  setInputValue("url", project?.url ?? "");

  const modalTitle = document.getElementById("modalTitle");
  if (modalTitle) {
    modalTitle.textContent = project ? "Editar Projeto" : "Adicionar Projeto";
  }

  updateFileList();

  if (projectModal) {
    projectModal.classList.add("show");
  }
}

function closeProjectModal() {
  editingProjectId = null;
  currentProjectFiles = [];

  if (projectModal) {
    projectModal.classList.remove("show");
  }

  if (projectForm) {
    projectForm.reset();
  }

  updateFileList();
}

function setInputValue(id, value) {
  const input = document.getElementById(id);
  if (input) input.value = value;
}

function getInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : "";
}

async function handleProjectSubmit(e) {
  e.preventDefault();

  const projectData = normalizeProject({
    id: editingProjectId || crypto.randomUUID(),
    titulo: getInputValue("titulo"),
    descricao: getInputValue("descricao"),
    tag: getInputValue("tag"),
    url: getInputValue("url"),
    github: "#",
    image: "img/logoaba.png",
    usuario: currentUser,
    usuarioId: currentUserId,
    files: [...currentProjectFiles],
    criado: editingProjectId
      ? findProjectById(editingProjectId)?.criado || new Date().toISOString()
      : new Date().toISOString(),
    atualizado: new Date().toISOString(),
    isPublic: true
  });

  if (!projectData.titulo) {
    alert("Informe o título do projeto.");
    return;
  }

  if (editingProjectId) {
    projects = projects.map(project =>
      project.id === editingProjectId ? projectData : project
    );
    alert("Projeto atualizado com sucesso!");
  } else {
    projects.push(projectData);
    alert("Projeto adicionado com sucesso!");
  }

  await persistProjects();
  renderProjects();
  updateTags();
  closeProjectModal();
}

function findProjectById(projectId) {
  return projects.find(project => project.id === projectId) || null;
}

function filterProjects() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const selectedTag = tagFilter ? tagFilter.value : "";

  return projects.filter(project => {
    const titulo = (project.titulo || "").toLowerCase();
    const descricao = (project.descricao || "").toLowerCase();
    const tag = project.tag || "";

    const matchSearch = titulo.includes(searchTerm) || descricao.includes(searchTerm);
    const matchTag = !selectedTag || tag === selectedTag;

    return matchSearch && matchTag;
  });
}

function renderProjects() {
  if (!grid) return;

  const filtered = filterProjects();

  if (!filtered.length) {
    grid.innerHTML = `
      <p class="muted">
        Nenhum projeto encontrado. Comece criando um novo!
      </p>
    `;
    return;
  }

  grid.innerHTML = filtered.map(project => {
    const comments = getProjectComments(project.id);

    return `
      <div class="card project-card">
        <div class="card-header">
          <h3>${escapeHtml(project.titulo)}</h3>
          <span class="tag tag-${escapeHtml((project.tag || "projeto").toLowerCase())}">
            ${escapeHtml(project.tag || "Projeto")}
          </span>
        </div>

        <p class="muted small">${escapeHtml(project.descricao || "Sem descrição")}</p>

        ${project.url ? `
          <p class="muted small">
            🔗 <a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">
              ${escapeHtml(project.url)}
            </a>
          </p>
        ` : ""}

        <p class="muted tiny">Por ${escapeHtml(project.usuario)}</p>

        <div class="project-activity-box">
          <div class="project-activity-title">💬 Atividades (${comments.length})</div>

          <div class="project-activity-list">
            ${
              comments.length
                ? comments.slice().reverse().map(comment => `
                  <div class="project-activity-item">
                    <div class="project-activity-date">${escapeHtml(comment.date)}</div>
                    <div class="project-activity-text">
                      ${escapeHtml(comment.text.substring(0, 100))}
                      ${comment.text.length > 100 ? "..." : ""}
                    </div>
                  </div>
                `).join("")
                : `<div class="project-activity-empty">Sem atividades ainda</div>`
            }
          </div>

          <input
            type="text"
            class="comment-input"
            placeholder="Adicionar atividade..."
            id="comment-${escapeHtml(project.id)}"
            onkeypress="if(event.key==='Enter') addProjectComment('${escapeHtml(project.id)}', this.value)"
          />
        </div>

        <div class="project-actions">
          <button class="btn btn-sm" onclick="editProject('${escapeHtml(project.id)}')">✏️ Editar</button>
          <button class="btn btn-sm ghost" onclick="deleteProject('${escapeHtml(project.id)}')">🗑️ Deletar</button>
        </div>
      </div>
    `;
  }).join("");
}

function updateTags() {
  if (!tagFilter) return;

  const tags = [...new Set(projects.map(project => project.tag).filter(Boolean))];
  const currentValue = tagFilter.value;

  const oldOptions = tagFilter.querySelectorAll("option:not(:first-child)");
  oldOptions.forEach(option => option.remove());

  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    tagFilter.appendChild(option);
  });

  tagFilter.value = currentValue;
}

function getProjectComments(projectId) {
  const saved = localStorage.getItem(getCommentsStorageKey(projectId));

  try {
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProjectComments(projectId, comments) {
  localStorage.setItem(getCommentsStorageKey(projectId), JSON.stringify(comments));
}

window.addProjectComment = function (projectId, commentText) {
  const text = (commentText || "").trim();
  if (!text) return;

  const comments = getProjectComments(projectId);

  const now = new Date();
  const dateStr =
    now.toLocaleDateString("pt-BR") +
    " " +
    now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    });

  comments.push({
    text,
    date: dateStr,
    addedAt: now.toISOString()
  });

  saveProjectComments(projectId, comments);

  const inputEl = document.getElementById(`comment-${projectId}`);
  if (inputEl) {
    inputEl.value = "";
  }

  renderProjects();
};

window.editProject = function (projectId) {
  const project = findProjectById(projectId);
  if (!project) return;

  openProjectModal(project);
};

window.deleteProject = async function (projectId) {
  const project = findProjectById(projectId);
  if (!project) return;

  if (!confirm(`Tem certeza que quer deletar o projeto "${project.titulo}"?`)) {
    return;
  }

  projects = projects.filter(item => item.id !== projectId);

  try {
    await persistProjects();
    localStorage.removeItem(getCommentsStorageKey(projectId));
    renderProjects();
    updateTags();
    alert("Projeto deletado com sucesso!");
  } catch (error) {
    console.error(error);
    alert("Erro ao deletar projeto.");
  }
};

async function handleFileUpload() {
  if (!fileInput || !fileInput.files?.length) {
    alert("Selecione um arquivo primeiro!");
    return;
  }

  for (const file of fileInput.files) {
    const currentUsage = await getCurrentStorageUsageSafe();

    if (currentUsage + file.size > MAX_STORAGE_BYTES) {
      alert("Limite de armazenamento excedido! Máximo 15 GB.");
      return;
    }

    try {
      const filePath = `${currentUserId}/${Date.now()}_${file.name}`;
      await supabase.uploadFile("project-files", filePath, file);

      currentProjectFiles.push({
        name: file.name,
        size: file.size,
        path: filePath,
        uploaded_at: new Date().toISOString()
      });

      updateFileList();
    } catch (error) {
      console.error("Erro no upload:", error);
      alert(`Erro ao fazer upload do arquivo: ${file.name}`);
    }
  }

  fileInput.value = "";
}

function updateFileList() {
  if (!fileList) return;

  if (!currentProjectFiles.length) {
    fileList.innerHTML = `<p class="muted small">Nenhum arquivo enviado.</p>`;
    return;
  }

  fileList.innerHTML = currentProjectFiles.map((file, index) => `
    <div class="uploaded-file-item">
      <span>${escapeHtml(file.name)} (${formatBytes(file.size)})</span>
      <button type="button" class="btn btn-sm ghost" onclick="removeCurrentProjectFile(${index})">Remover</button>
    </div>
  `).join("");
}

window.removeCurrentProjectFile = function (index) {
  currentProjectFiles.splice(index, 1);
  updateFileList();
};

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

async function getCurrentStorageUsageSafe() {
  try {
    if (typeof getCurrentStorageUsage === "function") {
      const usage = await getCurrentStorageUsage();
      return Number(usage || 0);
    }
  } catch (error) {
    console.warn("Falha ao obter armazenamento do backend:", error);
  }

  let totalSize = 0;
  const keys = Object.keys(localStorage).filter(key => key.includes(currentUserId));

  keys.forEach(key => {
    const value = localStorage.getItem(key) || "";
    totalSize += new Blob([value]).size;
  });

  return totalSize;
}

function loadStorageIndicator() {
  const storageText = document.getElementById("storageText");
  const storageBar = document.getElementById("storageBar");
  const storageWarning = document.getElementById("storageWarning");

  if (!storageText || !storageBar || !storageWarning) return;

  let totalSize = 0;
  const keys = Object.keys(localStorage).filter(key => key.includes(currentUserId));

  keys.forEach(key => {
    const value = localStorage.getItem(key) || "";
    totalSize += new Blob([value]).size;
  });

  const percentage = (totalSize / MAX_STORAGE_BYTES) * 100;
  const usedGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);

  storageText.textContent = `${usedGB} GB / 15 GB utilizado (${percentage.toFixed(1)}%)`;
  storageBar.style.width = `${Math.min(percentage, 100)}%`;

  if (percentage > 90) {
    storageWarning.style.display = "block";
  } else {
    storageWarning.style.display = "none";
  }

  if (percentage > 100) {
    storageBar.style.background = "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)";
    storageText.style.color = "#fca5a5";
  } else if (percentage > 90) {
    storageBar.style.background = "linear-gradient(90deg, #f97316 0%, #ea580c 100%)";
    storageText.style.color = "";
  } else {
    storageBar.style.background = "";
    storageText.style.color = "";
  }
}

function injectProjectStyles() {
  if (document.getElementById("dashboard-project-styles")) return;

  const style = document.createElement("style");
  style.id = "dashboard-project-styles";
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
      gap: .75rem;
      margin-bottom: 0.5rem;
    }

    .tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
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

    .project-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .project-activity-box {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(99, 102, 241, 0.2);
    }

    .project-activity-title {
      font-size: 0.85rem;
      color: #8ab4ff;
      margin-bottom: 0.5rem;
    }

    .project-activity-list {
      max-height: 120px;
      overflow-y: auto;
      margin-bottom: 0.75rem;
    }

    .project-activity-item {
      background: rgba(99, 102, 241, 0.1);
      padding: 0.5rem;
      border-radius: 0.3rem;
      margin-bottom: 0.3rem;
      font-size: 0.8rem;
    }

    .project-activity-date {
      color: #a5b4fc;
      font-weight: 600;
    }

    .project-activity-text {
      color: #e8eef7;
    }

    .project-activity-empty {
      color: #6b7280;
      font-size: 0.8rem;
    }

    .comment-input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 0.3rem;
      background: rgba(11, 15, 20, 0.5);
      color: #e8eef7;
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }

    .uploaded-file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: .75rem;
      padding: .6rem 0;
      border-bottom: 1px solid rgba(99, 102, 241, 0.15);
    }

    a {
      color: #60a5fa;
      text-decoration: none;
      word-break: break-all;
    }

    a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}