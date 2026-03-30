protectRoute();

const DASHBOARD_STORAGE_KEY_PREFIX = "arcanjo_projects_";
const COMMENTS_STORAGE_KEY_PREFIX = "project_comments_";
const FAVORITES_STORAGE_KEY_PREFIX = "arcanjo_favorites_";
const MAX_STORAGE_BYTES = 15 * 1024 * 1024 * 1024;

let projects = [];
let currentUser = null;
let currentUserId = null;
let editingProjectId = null;
let currentProjectFiles = [];

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
let featuredGrid;
let searchInput;
let quickSearch;
let tagFilter;
let sortFilter;
let visibilityFilter;
let ownershipFilter;
let clearFiltersBtn;
let userWelcome;
let fileInput;
let uploadBtn;
let fileList;
let statsContainer;
let recentActivityContainer;
let heroProjectsCount;
let heroLikesCount;
let heroFavoritesCount;
let heroViewsCount;
let projectsCountLabel;
let heroCreateBtn;
let heroFeaturedBtn;

document.addEventListener("DOMContentLoaded", async () => {
  initializeUser();
  cacheElements();
  bindStaticEvents();
  injectAdminButtonIfNeeded();

  await loadProjects();
  renderAll();
  await loadStorageIndicator();
});

function initializeUser() {
  currentUser = Auth.getCurrentUser() || "Usuário";
  currentUserId = Auth.getCurrentUserId() || "anon";
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
  featuredGrid = document.getElementById("featuredGrid");
  searchInput = document.getElementById("q");
  quickSearch = document.getElementById("quickSearch");
  tagFilter = document.getElementById("tagFilter");
  sortFilter = document.getElementById("sortFilter");
  visibilityFilter = document.getElementById("visibilityFilter");
  ownershipFilter = document.getElementById("ownershipFilter");
  clearFiltersBtn = document.getElementById("clearFiltersBtn");
  userWelcome = document.getElementById("userWelcome");
  fileInput = document.getElementById("fileInput");
  uploadBtn = document.getElementById("uploadBtn");
  fileList = document.getElementById("fileList");
  statsContainer = document.getElementById("stats");
  recentActivityContainer = document.getElementById("recentActivity");
  heroProjectsCount = document.getElementById("heroProjectsCount");
  heroLikesCount = document.getElementById("heroLikesCount");
  heroFavoritesCount = document.getElementById("heroFavoritesCount");
  heroViewsCount = document.getElementById("heroViewsCount");
  projectsCountLabel = document.getElementById("projectsCountLabel");
  heroCreateBtn = document.getElementById("heroCreateBtn");
  heroFeaturedBtn = document.getElementById("heroFeaturedBtn");

  if (userDisplay) userDisplay.textContent = `👤 ${currentUser}`;
  if (userWelcome) userWelcome.textContent = currentUser;
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

  if (logoutBtn) logoutBtn.addEventListener("click", handleLogout);
  if (logoutBtnTop) logoutBtnTop.addEventListener("click", handleLogout);

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

  if (heroCreateBtn) {
    heroCreateBtn.addEventListener("click", openProjectModal);
  }

  if (heroFeaturedBtn) {
    heroFeaturedBtn.addEventListener("click", () => {
      const target = document.getElementById("featuredGrid");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
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

  [searchInput, quickSearch].forEach((input) => {
    if (input) input.addEventListener("input", renderAll);
  });

  [tagFilter, sortFilter, visibilityFilter, ownershipFilter].forEach((input) => {
    if (input) input.addEventListener("change", renderAll);
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearFilters);
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

function getFavoritesStorageKey() {
  return `${FAVORITES_STORAGE_KEY_PREFIX}${currentUserId}`;
}

function getFavoriteIds() {
  try {
    const data = JSON.parse(localStorage.getItem(getFavoritesStorageKey()) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveFavoriteIds(ids) {
  localStorage.setItem(getFavoritesStorageKey(), JSON.stringify(ids));
}

function normalizeProject(project = {}) {
  return {
    id: project.id ?? crypto.randomUUID(),
    titulo: project.titulo ?? project.title ?? "Projeto sem título",
    descricao: project.descricao ?? project.description ?? "",
    tag: project.tag ?? project.type ?? "",
    url: project.url ?? project.demo ?? "",
    github: project.github ?? "",
    image: project.image ?? "img/logoaba.png",
    usuario: project.usuario ?? project.author ?? currentUser ?? "Usuário",
    usuarioId: project.usuarioId ?? project.user_id ?? currentUserId,
    files: Array.isArray(project.files) ? project.files : [],
    techs: Array.isArray(project.techs)
      ? project.techs
      : String(project.techs || "")
          .split(",")
          .map(item => item.trim())
          .filter(Boolean),
    criado: project.criado ?? project.created_at ?? new Date().toISOString(),
    atualizado: project.atualizado ?? project.updated_at ?? new Date().toISOString(),
    isPublic: project.isPublic ?? project.is_public ?? true,
    isFeatured: project.isFeatured ?? false,
    likes: Number(project.likes ?? 0),
    views: Number(project.views ?? 0)
  };
}

function makeProjectPayload(project) {
  return {
    id: project.id,
    user_id: project.usuarioId,
    author: project.usuario,
    title: project.titulo,
    description: project.descricao,
    type: project.tag || "Projeto",
    tag: project.tag || "Projeto",
    demo: project.url || "",
    github: project.github || "",
    image: project.image || "img/logoaba.png",
    files: Array.isArray(project.files) ? project.files : [],
    is_public: !!project.isPublic,
    created_at: project.criado,
    updated_at: project.atualizado
  };
}

async function loadProjects() {
  loadProjectsFromLocalStorage();

  try {
    const result = await supabase.select("projects", { user_id: currentUserId });

    if (Array.isArray(result) && result.length > 0) {
      projects = result.map(normalizeProject);
      saveProjectsToLocalStorage();
      return;
    }

    console.warn("Banco retornou vazio. Mantendo projetos do localStorage.");
  } catch (error) {
    console.error("Erro ao carregar projetos do banco:", error);
    console.warn("Usando localStorage como fallback.");
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

async function persistProjectsLocalOnly() {
  saveProjectsToLocalStorage();
  await loadStorageIndicator();
}

async function saveProjectToDatabase(project) {
  try {
    const payload = makeProjectPayload(project);
    const existing = await supabase.select("projects", { id: project.id });

    if (Array.isArray(existing) && existing.length > 0) {
      await supabase.update("projects", project.id, payload);
    } else {
      await supabase.insert("projects", payload);
    }

    return true;
  } catch (error) {
    console.error("Erro detalhado ao salvar no banco:", error);
    alert("Erro ao sincronizar no banco: " + error.message);
    throw error;
  }
}

async function deleteProjectFromDatabase(projectId) {
  try {
    await supabase.delete("projects", projectId);
  } catch (error) {
    console.error("Erro ao deletar projeto no banco:", error);
    throw error;
  }
}

function openProjectModal(project = null) {
  editingProjectId = project ? project.id : null;
  currentProjectFiles = project?.files ? [...project.files] : [];

  if (projectForm) projectForm.reset();

  setInputValue("titulo", project?.titulo ?? "");
  setInputValue("descricao", project?.descricao ?? "");
  setInputValue("tag", project?.tag ?? "");
  setInputValue("url", project?.url ?? "");
  setInputValue("github", project?.github ?? "");
  setInputValue("image", project?.image && project.image !== "img/logoaba.png" ? project.image : "");
  setInputValue("techs", Array.isArray(project?.techs) ? project.techs.join(", ") : "");

  const isPublic = document.getElementById("isPublic");
  const isFeatured = document.getElementById("isFeatured");

  if (isPublic) isPublic.checked = project ? !!project.isPublic : true;
  if (isFeatured) isFeatured.checked = project ? !!project.isFeatured : false;

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

  if (projectModal) projectModal.classList.remove("show");
  if (projectForm) projectForm.reset();

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

  const oldProject = editingProjectId ? findProjectById(editingProjectId) : null;

  const projectData = normalizeProject({
    id: editingProjectId || crypto.randomUUID(),
    titulo: getInputValue("titulo"),
    descricao: getInputValue("descricao"),
    tag: getInputValue("tag"),
    url: getInputValue("url"),
    github: getInputValue("github"),
    image: getInputValue("image") || "img/logoaba.png",
    usuario: currentUser,
    usuarioId: currentUserId,
    files: [...currentProjectFiles],
    techs: getInputValue("techs"),
    criado: oldProject?.criado || new Date().toISOString(),
    atualizado: new Date().toISOString(),
    isPublic: document.getElementById("isPublic")?.checked ?? true,
    isFeatured: document.getElementById("isFeatured")?.checked ?? false,
    likes: oldProject?.likes || 0,
    views: oldProject?.views || 0
  });

  if (!projectData.titulo) {
    alert("Informe o título do projeto.");
    return;
  }

  if (editingProjectId) {
    const index = projects.findIndex(project => project.id === editingProjectId);
    if (index !== -1) {
      projects[index] = projectData;
    }
  } else {
    projects.unshift(projectData);
  }

  await persistProjectsLocalOnly();

  try {
    await saveProjectToDatabase(projectData);
    alert(editingProjectId ? "Projeto atualizado com sucesso!" : "Projeto adicionado com sucesso!");
  } catch (error) {
    console.error(error);
    alert("Projeto salvo localmente, mas não sincronizou no banco.");
  }

  closeProjectModal();
  renderAll();
}

function findProjectById(projectId) {
  return projects.find(project => project.id === projectId) || null;
}

function filterProjects() {
  const textA = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const textB = quickSearch ? quickSearch.value.toLowerCase().trim() : "";
  const searchTerms = [textA, textB].filter(Boolean);

  const selectedTag = tagFilter ? tagFilter.value : "";
  const visibility = visibilityFilter ? visibilityFilter.value : "";
  const ownership = ownershipFilter ? ownershipFilter.value : "all";
  const order = sortFilter ? sortFilter.value : "recent";

  let filtered = projects.filter(project => {
    const searchable = [
      project.titulo || "",
      project.descricao || "",
      project.tag || "",
      Array.isArray(project.techs) ? project.techs.join(" ") : ""
    ].join(" ").toLowerCase();

    const matchSearch = searchTerms.every(term => searchable.includes(term));
    const matchTag = !selectedTag || project.tag === selectedTag;

    const matchVisibility =
      !visibility ||
      (visibility === "public" && project.isPublic) ||
      (visibility === "private" && !project.isPublic) ||
      (visibility === "featured" && project.isFeatured);

    const matchOwnership =
      ownership === "all" ||
      (ownership === "withFiles" && project.files.length > 0) ||
      (ownership === "withoutFiles" && project.files.length === 0);

    return matchSearch && matchTag && matchVisibility && matchOwnership;
  });

  filtered.sort((a, b) => {
    if (order === "likes") return b.likes - a.likes;
    if (order === "views") return b.views - a.views;
    if (order === "title") return a.titulo.localeCompare(b.titulo, "pt-BR");
    return new Date(b.atualizado) - new Date(a.atualizado);
  });

  return filtered;
}

function renderAll() {
  renderStats();
  renderHeroStats();
  updateTags();
  renderFeaturedProjects();
  renderProjects();
  renderRecentActivity();
}

function renderStats() {
  if (!statsContainer) return;

  const totalProjects = projects.length;
  const publicProjects = projects.filter(project => project.isPublic).length;
  const featuredProjects = projects.filter(project => project.isFeatured).length;
  const totalFiles = projects.reduce((acc, project) => acc + project.files.length, 0);

  statsContainer.innerHTML = `
    <div class="card">
      <p class="muted small">Projetos publicados</p>
      <h3>${totalProjects}</h3>
    </div>
    <div class="card">
      <p class="muted small">Projetos públicos</p>
      <h3>${publicProjects}</h3>
    </div>
    <div class="card">
      <p class="muted small">Projetos em destaque</p>
      <h3>${featuredProjects}</h3>
    </div>
    <div class="card">
      <p class="muted small">Arquivos enviados</p>
      <h3>${totalFiles}</h3>
    </div>
  `;
}

function renderHeroStats() {
  const favorites = getFavoriteIds();
  const likes = projects.reduce((acc, project) => acc + Number(project.likes || 0), 0);
  const views = projects.reduce((acc, project) => acc + Number(project.views || 0), 0);

  if (heroProjectsCount) heroProjectsCount.textContent = String(projects.length);
  if (heroLikesCount) heroLikesCount.textContent = String(likes);
  if (heroFavoritesCount) heroFavoritesCount.textContent = String(favorites.length);
  if (heroViewsCount) heroViewsCount.textContent = String(views);
}

function renderFeaturedProjects() {
  if (!featuredGrid) return;

  const featured = [...projects]
    .filter(project => project.isFeatured)
    .sort((a, b) => b.likes - a.likes || b.views - a.views)
    .slice(0, 4);

  if (!featured.length) {
    featuredGrid.innerHTML = `
      <div class="empty-state">
        <h3>Sem destaques ainda</h3>
        <p class="muted">Marque um projeto como destaque para ele aparecer aqui.</p>
      </div>
    `;
    return;
  }

  featuredGrid.innerHTML = featured.map(project => createProjectCard(project, true)).join("");
}

function renderProjects() {
  if (!grid) return;

  const filtered = filterProjects();

  if (projectsCountLabel) {
    projectsCountLabel.textContent = `${filtered.length} projeto${filtered.length !== 1 ? "s" : ""}`;
  }

  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <h3>Nenhum projeto encontrado</h3>
        <p class="muted">Tente mudar os filtros ou publique um novo projeto.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(project => createProjectCard(project)).join("");
}

function createProjectCard(project, compact = false) {
  const comments = getProjectComments(project.id);
  const favorites = getFavoriteIds();
  const isFavorite = favorites.includes(project.id);
  const filesCount = project.files?.length || 0;
  const techs = Array.isArray(project.techs) ? project.techs.slice(0, 5) : [];
  const visibilityLabel = project.isPublic ? "🌍 Público" : "🔒 Privado";

  return `
    <article class="card project-card">
      <img
        class="project-cover"
        src="${escapeHtml(project.image || "img/logoaba.png")}"
        alt="${escapeHtml(project.titulo)}"
        onerror="this.src='img/logoaba.png'"
      />

      <div class="project-top">
        <div>
          <h3 class="project-title">${escapeHtml(project.titulo)}</h3>
          <p class="muted tiny">Por ${escapeHtml(project.usuario)}</p>
        </div>
        <span class="tag">${escapeHtml(project.tag || "Projeto")}</span>
      </div>

      <p class="project-desc">${escapeHtml(project.descricao || "Sem descrição")}</p>

      ${
        techs.length
          ? `<div class="project-techs">${techs.map(tech => `<span class="tech-pill">${escapeHtml(tech)}</span>`).join("")}</div>`
          : ""
      }

      <div class="project-links">
        ${project.url ? `<a href="${escapeHtml(project.url)}" target="_blank" rel="noopener noreferrer">🔗 Demo</a>` : ""}
        ${project.github ? `<a href="${escapeHtml(project.github)}" target="_blank" rel="noopener noreferrer">💻 GitHub</a>` : ""}
      </div>

      <div class="project-stats-line">
        <span>❤️ ${project.likes || 0}</span>
        <span>👁️ ${project.views || 0}</span>
        <span>📁 ${filesCount}</span>
        <span>${visibilityLabel}</span>
        ${project.isFeatured ? `<span>⭐ Destaque</span>` : ""}
      </div>

      ${
        compact
          ? `
            <div class="project-actions">
              <button class="btn btn-sm" onclick="viewProject('${escapeHtml(project.id)}')">Abrir</button>
              <button class="btn btn-sm ghost" onclick="toggleLikeProject('${escapeHtml(project.id)}')">❤️ Curtir</button>
            </div>
          `
          : `
            <div class="project-activity-box">
              <div class="project-activity-title">💬 Atividades (${comments.length})</div>
              <div class="project-activity-list">
                ${
                  comments.length
                    ? comments.slice().reverse().slice(0, 5).map(comment => `
                      <div class="project-activity-item">
                        <div class="project-activity-date">${escapeHtml(comment.date)}</div>
                        <div>${escapeHtml(comment.text.substring(0, 100))}${comment.text.length > 100 ? "..." : ""}</div>
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
              <button class="btn btn-sm" onclick="viewProject('${escapeHtml(project.id)}')">👁️ Ver</button>
              <button class="btn btn-sm ghost" onclick="toggleLikeProject('${escapeHtml(project.id)}')">❤️ Curtir</button>
              <button class="btn btn-sm ghost" onclick="toggleFavoriteProject('${escapeHtml(project.id)}')">${isFavorite ? "★ Favorito" : "☆ Favoritar"}</button>
              <button class="btn btn-sm ghost" onclick="shareProject('${escapeHtml(project.id)}')">🔗 Compartilhar</button>
              <button class="btn btn-sm ghost" onclick="editProject('${escapeHtml(project.id)}')">✏️ Editar</button>
              <button class="btn btn-sm danger" onclick="deleteProject('${escapeHtml(project.id)}')">🗑️ Excluir</button>
            </div>
          `
      }
    </article>
  `;
}

function renderRecentActivity() {
  if (!recentActivityContainer) return;

  const recent = [];

  projects.forEach(project => {
    recent.push({
      date: project.atualizado,
      text: `Projeto "${project.titulo}" atualizado`
    });

    const comments = getProjectComments(project.id);
    comments.forEach(comment => {
      recent.push({
        date: comment.addedAt,
        text: `Nova atividade em "${project.titulo}": ${comment.text}`
      });
    });
  });

  recent.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (!recent.length) {
    recentActivityContainer.innerHTML = `<p class="muted">Nenhuma atividade recente.</p>`;
    return;
  }

  recentActivityContainer.innerHTML = recent.slice(0, 8).map(item => `
    <div class="recent-item">
      <div>${escapeHtml(item.text)}</div>
      <div class="muted tiny">${formatDate(item.date)}</div>
    </div>
  `).join("");
}

function updateTags() {
  if (!tagFilter) return;

  const tags = [...new Set(projects.map(project => project.tag).filter(Boolean))];
  const currentValue = tagFilter.value;

  tagFilter.innerHTML = `<option value="">Todas as tags</option>`;

  tags.forEach(tag => {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    tagFilter.appendChild(option);
  });

  tagFilter.value = currentValue;
}

function clearFilters() {
  if (searchInput) searchInput.value = "";
  if (quickSearch) quickSearch.value = "";
  if (tagFilter) tagFilter.value = "";
  if (sortFilter) sortFilter.value = "recent";
  if (visibilityFilter) visibilityFilter.value = "";
  if (ownershipFilter) ownershipFilter.value = "all";
  renderAll();
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

  comments.push({
    text,
    date: now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }),
    addedAt: now.toISOString()
  });

  saveProjectComments(projectId, comments);

  const input = document.getElementById(`comment-${projectId}`);
  if (input) input.value = "";

  renderAll();
};

window.viewProject = async function (projectId) {
  const project = findProjectById(projectId);
  if (!project) return;

  project.views = Number(project.views || 0) + 1;
  project.atualizado = new Date().toISOString();

  try {
    await persistProjectsLocalOnly();
    await saveProjectToDatabase(project);
  } catch (error) {
    console.error("Erro ao registrar visualização:", error);
  }

  renderAll();

  let text = `Projeto: ${project.titulo}\n\n${project.descricao || "Sem descrição"}`;
  if (project.url) text += `\n\nDemo: ${project.url}`;
  if (project.github) text += `\nGitHub: ${project.github}`;

  alert(text);
};

window.toggleLikeProject = async function (projectId) {
  const project = findProjectById(projectId);
  if (!project) return;

  project.likes = Number(project.likes || 0) + 1;
  project.atualizado = new Date().toISOString();

  try {
    await persistProjectsLocalOnly();
    await saveProjectToDatabase(project);
  } catch (error) {
    console.error("Erro ao curtir projeto:", error);
  }

  renderAll();
};

window.toggleFavoriteProject = function (projectId) {
  const favorites = getFavoriteIds();
  const exists = favorites.includes(projectId);

  const updated = exists
    ? favorites.filter(id => id !== projectId)
    : [...favorites, projectId];

  saveFavoriteIds(updated);
  renderAll();
};

window.shareProject = async function (projectId) {
  const project = findProjectById(projectId);
  if (!project) return;

  const shareText = `${project.titulo} - ${project.url || project.github || "Projeto no Arcanjo"}`;

  try {
    await navigator.clipboard.writeText(shareText);
    alert("Link copiado para a área de transferência!");
  } catch {
    alert(shareText);
  }
};

window.editProject = function (projectId) {
  const project = findProjectById(projectId);
  if (!project) return;
  openProjectModal(project);
};

window.deleteProject = async function (projectId) {
  const project = findProjectById(projectId);
  if (!project) return;

  if (!confirm(`Tem certeza que quer excluir "${project.titulo}"?`)) return;

  projects = projects.filter(item => item.id !== projectId);
  saveProjectsToLocalStorage();
  localStorage.removeItem(getCommentsStorageKey(projectId));

  try {
    await deleteProjectFromDatabase(projectId);
    renderAll();
    await loadStorageIndicator();
    alert("Projeto excluído com sucesso!");
  } catch (error) {
    console.error(error);
    renderAll();
    alert("Projeto removido localmente, mas houve erro ao excluir no banco.");
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
  let totalSize = 0;

  projects.forEach(project => {
    if (Array.isArray(project.files)) {
      project.files.forEach(file => {
        totalSize += Number(file.size || 0);
      });
    }
  });

  const keys = Object.keys(localStorage).filter(key => key.includes(currentUserId));
  keys.forEach(key => {
    const value = localStorage.getItem(key) || "";
    totalSize += new Blob([value]).size;
  });

  return totalSize;
}

async function loadStorageIndicator() {
  const storageText = document.getElementById("storageText");
  const storageBar = document.getElementById("storageBar");
  const storageWarning = document.getElementById("storageWarning");

  if (!storageText || !storageBar || !storageWarning) return;

  const totalSize = await getCurrentStorageUsageSafe();
  const percentage = (totalSize / MAX_STORAGE_BYTES) * 100;
  const usedGB = (totalSize / 1024 / 1024 / 1024).toFixed(2);

  storageText.textContent = `${usedGB} GB / 15 GB utilizado (${percentage.toFixed(2)}%)`;
  storageBar.style.width = `${Math.min(percentage, 100)}%`;
  storageWarning.style.display = percentage > 90 ? "block" : "none";
}

function formatDate(date) {
  try {
    return new Date(date).toLocaleString("pt-BR");
  } catch {
    return String(date);
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}