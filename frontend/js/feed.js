const DEFAULT_AVATAR = "img/logoaba.png";
const DEFAULT_POST_IMAGE = "img/logoaba.png";
const FEED_STORAGE_KEY = "arcanjo_feed_posts";

const feedList = document.getElementById("feedList");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const orderFilter = document.getElementById("orderFilter");
const feedStats = document.getElementById("feedStats");
const projectPreviewModal = document.getElementById("projectPreviewModal");
const projectPreviewContent = document.getElementById("projectPreviewContent");
const closePreviewModal = document.getElementById("closePreviewModal");

const currentUser = {
  id: localStorage.getItem("arcanjo_current_user_id") || "user_logado",
  name: localStorage.getItem("arcanjo_current_username") || "Usuário",
  avatar: localStorage.getItem("arcanjo_current_avatar") || DEFAULT_AVATAR
};

let allFeedPosts = [];

const defaultPosts = [
  {
    id: 1,
    title: "Sistema de Biblioteca",
    author: "Gabriel",
    authorId: "gabriel_1",
    authorAvatar: "",
    type: "Projeto",
    description: "Sistema para cadastro, busca e organização de livros com interface moderna.",
    technologies: ["HTML", "CSS", "JavaScript", "PHP"],
    image: "",
    likes: 24,
    likedBy: [],
    comments: [
      { id: 1, user: "Marina", text: "Projeto muito bem organizado!" }
    ],
    shares: 3,
    saves: 4,
    savedBy: [],
    blockedBy: [],
    reports: 0,
    github: "#",
    demo: "#",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Dashboard de Vendas",
    author: "Marina",
    authorId: "marina_2",
    authorAvatar: "",
    type: "Trabalho Acadêmico",
    description: "Painel administrativo com gráficos, métricas e visualização de desempenho.",
    technologies: ["Python", "MySQL", "HTML", "CSS"],
    image: "",
    likes: 18,
    likedBy: [],
    comments: [],
    shares: 1,
    saves: 2,
    savedBy: [],
    blockedBy: [],
    reports: 0,
    github: "#",
    demo: "#",
    createdAt: new Date().toISOString()
  }
];

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function normalizeComment(comment = {}) {
  return {
    id: comment.id ?? Date.now(),
    user: comment.user ?? "Usuário",
    text: comment.text ?? ""
  };
}

function normalizePost(post = {}) {
  return {
    id: Number(post.id ?? Date.now()),
    title: post.title ?? "Projeto sem título",
    author: post.author ?? "Usuário",
    authorId: post.authorId ?? `user_${post.id ?? Date.now()}`,
    authorAvatar: post.authorAvatar ?? "",
    type: post.type ?? "Projeto",
    description: post.description ?? "",
    technologies: Array.isArray(post.technologies)
      ? post.technologies
      : Array.isArray(post.techs)
        ? post.techs
        : [],
    image: post.image ?? "",
    likes: Number(post.likes ?? 0),
    likedBy: Array.isArray(post.likedBy) ? post.likedBy : [],
    comments: Array.isArray(post.comments) ? post.comments.map(normalizeComment) : [],
    shares: Number(post.shares ?? 0),
    saves: Number(post.saves ?? 0),
    savedBy: Array.isArray(post.savedBy) ? post.savedBy : [],
    blockedBy: Array.isArray(post.blockedBy) ? post.blockedBy : [],
    reports: Number(post.reports ?? 0),
    github: post.github ?? "#",
    demo: post.demo ?? "#",
    createdAt: post.createdAt ?? new Date().toISOString()
  };
}

function mapDbPostToFeed(post = {}) {
  return normalizePost({
    id: post.id,
    title: post.title,
    author: post.author,
    authorId: post.user_id,
    authorAvatar: post.author_avatar || DEFAULT_AVATAR,
    type: post.type || post.tag || "Projeto",
    description: post.description,
    technologies: Array.isArray(post.techs)
      ? post.techs
      : Array.isArray(post.technologies)
        ? post.technologies
        : [],
    image: post.image || DEFAULT_POST_IMAGE,
    likes: post.likes || post.likes_count || 0,
    likedBy: [],
    comments: [],
    shares: post.shares || post.shares_count || 0,
    saves: post.saves || post.saves_count || 0,
    savedBy: [],
    blockedBy: [],
    reports: post.reports || post.reports_count || 0,
    github: post.github || "#",
    demo: post.demo || "#",
    createdAt: post.created_at || new Date().toISOString()
  });
}

function getPostsFromLocalStorage() {
  const saved = localStorage.getItem(FEED_STORAGE_KEY);

  if (!saved) {
    return defaultPosts.map(normalizePost);
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed)
      ? parsed.map(normalizePost)
      : defaultPosts.map(normalizePost);
  } catch {
    return defaultPosts.map(normalizePost);
  }
}

function savePostsToLocalStorage(posts) {
  localStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts.map(normalizePost)));
}

function getBlockedUsers() {
  const key = `arcanjo_blocked_users_${currentUser.id}`;
  const saved = localStorage.getItem(key);

  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBlockedUsers(users) {
  const key = `arcanjo_blocked_users_${currentUser.id}`;
  localStorage.setItem(key, JSON.stringify(users));
}

function closeAllMenus() {
  document.querySelectorAll(".post-dropdown").forEach(menu => {
    menu.classList.remove("show");
  });
}

function getPostImage(post) {
  return post.image?.trim() ? post.image : DEFAULT_POST_IMAGE;
}

function getAuthorAvatar(post) {
  return post.authorAvatar?.trim() ? post.authorAvatar : DEFAULT_AVATAR;
}

function formatRelativeDate(date) {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now - target;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "agora";
  if (diffMinutes < 60) return `${diffMinutes} min atrás`;
  if (diffHours < 24) return `${diffHours} h atrás`;
  if (diffDays < 7) return `${diffDays} d atrás`;

  return target.toLocaleDateString("pt-BR");
}

function renderStats(posts) {
  if (!feedStats) return;

  const totalPosts = posts.length;
  const totalLikes = posts.reduce((acc, post) => acc + Number(post.likes || 0), 0);
  const totalComments = posts.reduce((acc, post) => acc + post.comments.length, 0);
  const totalSaves = posts.reduce((acc, post) => acc + Number(post.saves || 0), 0);

  feedStats.innerHTML = `
    <div class="card">
      <p class="muted small">Projetos no feed</p>
      <h3>${totalPosts}</h3>
    </div>
    <div class="card">
      <p class="muted small">Curtidas</p>
      <h3>${totalLikes}</h3>
    </div>
    <div class="card">
      <p class="muted small">Comentários</p>
      <h3>${totalComments}</h3>
    </div>
    <div class="card">
      <p class="muted small">Salvos</p>
      <h3>${totalSaves}</h3>
    </div>
  `;
}

function renderEmptyState(title, description) {
  if (!feedList) return;

  feedList.innerHTML = `
    <div class="empty-feed">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

function buildPostHtml(post) {
  const liked = post.likedBy.includes(currentUser.id);
  const saved = post.savedBy.includes(currentUser.id);
  const avatar = getAuthorAvatar(post);
  const image = getPostImage(post);
  const commentsCount = post.comments.length;
  const savesCount = post.saves || 0;
  const relativeDate = formatRelativeDate(post.createdAt);

  return `
    <article class="portfolio-post">
      <div class="post-media">
        <img src="${escapeHtml(image)}" alt="${escapeHtml(post.title)}">
      </div>

      <div class="post-body">
        <div class="post-author-box">
          <div class="post-author-left">
            <img class="author-avatar" src="${escapeHtml(avatar)}" alt="${escapeHtml(post.author)}">
            <div>
              <strong>${escapeHtml(post.author)}</strong>
              <div class="post-type-line">${escapeHtml(post.type)} • ${escapeHtml(relativeDate)}</div>
            </div>
          </div>

          <div class="post-menu">
            <button class="btn ghost menu-toggle" data-id="${post.id}" type="button">⋯</button>
            <div class="post-dropdown" id="menu-${post.id}">
              <button class="preview-btn" data-id="${post.id}" type="button">Visualizar</button>
              <button class="share-btn" data-id="${post.id}" type="button">Compartilhar</button>
              <button class="save-btn" data-id="${post.id}" type="button">
                ${saved ? "Remover dos salvos" : "Salvar"}
              </button>
              <button class="report-btn" data-id="${post.id}" type="button">Denunciar</button>
              <button class="block-btn danger" data-author-id="${escapeHtml(post.authorId)}" type="button">
                Bloquear usuário
              </button>
            </div>
          </div>
        </div>

        <h2>${escapeHtml(post.title)}</h2>
        <p class="post-description">${escapeHtml(post.description)}</p>

        <div class="tech-tags">
          ${post.technologies.map(tech => `<span>${escapeHtml(tech)}</span>`).join("")}
        </div>

        <div class="post-actions">
          <button class="btn like-btn ${liked ? "active-like" : ""}" data-id="${post.id}" type="button">
            ❤ ${post.likes}
          </button>

          <button class="btn ghost comment-toggle-btn" data-id="${post.id}" type="button">
            💬 ${commentsCount}
          </button>

          <button class="btn ghost share-btn" data-id="${post.id}" type="button">
            ↗ ${post.shares}
          </button>

          <button class="btn ghost save-btn" data-id="${post.id}" type="button">
            ${saved ? "★ Salvo" : "☆ Salvar"}
          </button>

          <button class="btn ghost preview-btn" data-id="${post.id}" type="button">
            👁️ Ver
          </button>
        </div>

        <div class="post-links">
          <a href="${escapeHtml(post.demo)}" class="btn ghost" target="_blank" rel="noopener noreferrer">Ver projeto</a>
          <a href="${escapeHtml(post.github)}" class="btn ghost" target="_blank" rel="noopener noreferrer">GitHub</a>
        </div>

        <div class="post-stats">
          <span>📁 ${escapeHtml(post.type)}</span>
          <span>❤️ ${post.likes} curtidas</span>
          <span>💬 ${commentsCount} comentários</span>
          <span>🔖 ${savesCount} salvos</span>
        </div>

        <div class="comments-box" id="comments-${post.id}">
          <div class="comments-list">
            ${commentsCount
      ? post.comments.map(comment => `
                  <div class="comment-item">
                    <strong>${escapeHtml(comment.user)}:</strong>
                    <span>${escapeHtml(comment.text)}</span>
                  </div>
                `).join("")
      : `<p class="no-comments">Ainda não há comentários.</p>`
    }
          </div>

          <div class="comment-form">
            <input
              type="text"
              class="input comment-input"
              id="comment-input-${post.id}"
              placeholder="Escreva um comentário profissional..."
            />
            <button class="btn add-comment-btn" data-id="${post.id}" type="button">Comentar</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderPosts(posts) {
  if (!feedList) return;

  const blockedUsers = getBlockedUsers();
  const visiblePosts = posts.filter(post => !blockedUsers.includes(post.authorId));

  renderStats(visiblePosts);

  if (!visiblePosts.length) {
    renderEmptyState(
      "Nenhum projeto encontrado",
      "Tente buscar outro termo ou desbloquear usuários bloqueados."
    );
    return;
  }

  feedList.innerHTML = visiblePosts.map(buildPostHtml).join("");
  bindEvents();
}

function updatePostLocally(postId, updater) {
  allFeedPosts = allFeedPosts.map(post => {
    if (post.id !== postId) return post;
    return normalizePost(updater({ ...post }));
  });

  savePostsToLocalStorage(allFeedPosts);
  applyFilters();
}

function toggleLike(postId) {
  updatePostLocally(postId, post => {
    const alreadyLiked = post.likedBy.includes(currentUser.id);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id !== currentUser.id);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(currentUser.id);
      post.likes += 1;
    }

    return post;
  });
}

function toggleSave(postId) {
  updatePostLocally(postId, post => {
    const alreadySaved = post.savedBy.includes(currentUser.id);

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter(id => id !== currentUser.id);
      post.saves = Math.max(0, post.saves - 1);
    } else {
      post.savedBy.push(currentUser.id);
      post.saves += 1;
    }

    return post;
  });
}

function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  updatePostLocally(postId, post => {
    post.comments.push({
      id: Date.now(),
      user: currentUser.name,
      text
    });
    return post;
  });
}

async function sharePost(postId) {
  updatePostLocally(postId, post => {
    post.shares += 1;
    return post;
  });

  const postUrl = `${window.location.origin}${window.location.pathname}?post=${postId}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: "Arcanjo - Projeto",
        text: "Confira este projeto no Arcanjo",
        url: postUrl
      });
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(postUrl);
      alert("Link copiado para a área de transferência!");
      return;
    }

    prompt("Copie o link do projeto:", postUrl);
  } catch {
    //
  }
}

function reportPost(postId) {
  updatePostLocally(postId, post => {
    post.reports += 1;
    return post;
  });

  alert("Post denunciado com sucesso.");
}

function blockUser(authorId) {
  const blockedUsers = getBlockedUsers();

  if (!blockedUsers.includes(authorId)) {
    blockedUsers.push(authorId);
    saveBlockedUsers(blockedUsers);
  }

  alert("Usuário bloqueado. Os posts dele não aparecerão mais para você.");
  applyFilters();
}

function toggleComments(postId) {
  const box = document.getElementById(`comments-${postId}`);
  if (box) {
    box.classList.toggle("show-comments");
  }
}

function openPreviewModal(postId) {
  const post = allFeedPosts.find(item => item.id === postId);
  if (!post || !projectPreviewContent || !projectPreviewModal) return;

  projectPreviewContent.innerHTML = `
    <div class="preview-cover">
      <img src="${escapeHtml(getPostImage(post))}" alt="${escapeHtml(post.title)}">
    </div>

    <div class="preview-body">
      <div class="preview-author">
        <img src="${escapeHtml(getAuthorAvatar(post))}" alt="${escapeHtml(post.author)}">
        <div>
          <strong>${escapeHtml(post.author)}</strong>
          <div class="muted small">${escapeHtml(post.type)} • ${escapeHtml(formatRelativeDate(post.createdAt))}</div>
        </div>
      </div>

      <h2>${escapeHtml(post.title)}</h2>
      <p>${escapeHtml(post.description)}</p>

      <div class="tech-tags">
        ${post.technologies.map(tech => `<span>${escapeHtml(tech)}</span>`).join("")}
      </div>

      <div class="post-stats">
        <span>❤️ ${post.likes} curtidas</span>
        <span>💬 ${post.comments.length} comentários</span>
        <span>🔖 ${post.saves} salvos</span>
        <span>↗ ${post.shares} compartilhamentos</span>
      </div>

      <div class="post-links" style="margin-top: 1rem;">
        <a href="${escapeHtml(post.demo)}" class="btn ghost" target="_blank" rel="noopener noreferrer">Abrir projeto</a>
        <a href="${escapeHtml(post.github)}" class="btn ghost" target="_blank" rel="noopener noreferrer">Abrir GitHub</a>
      </div>
    </div>
  `;

  projectPreviewModal.classList.add("show");
}

function closePreview() {
  if (projectPreviewModal) {
    projectPreviewModal.classList.remove("show");
  }
}

function bindEvents() {
  document.querySelectorAll(".like-btn").forEach(button => {
    button.onclick = () => toggleLike(Number(button.dataset.id));
  });

  document.querySelectorAll(".save-btn").forEach(button => {
    button.onclick = () => toggleSave(Number(button.dataset.id));
  });

  document.querySelectorAll(".add-comment-btn").forEach(button => {
    button.onclick = () => addComment(Number(button.dataset.id));
  });

  document.querySelectorAll(".comment-toggle-btn").forEach(button => {
    button.onclick = () => toggleComments(Number(button.dataset.id));
  });

  document.querySelectorAll(".share-btn").forEach(button => {
    button.onclick = () => sharePost(Number(button.dataset.id));
  });

  document.querySelectorAll(".report-btn").forEach(button => {
    button.onclick = () => reportPost(Number(button.dataset.id));
  });

  document.querySelectorAll(".block-btn").forEach(button => {
    button.onclick = () => blockUser(button.dataset.authorId);
  });

  document.querySelectorAll(".preview-btn").forEach(button => {
    button.onclick = () => openPreviewModal(Number(button.dataset.id));
  });

  document.querySelectorAll(".menu-toggle").forEach(button => {
    button.onclick = (e) => {
      e.stopPropagation();

      const menu = document.getElementById(`menu-${button.dataset.id}`);
      const isOpen = menu?.classList.contains("show");

      closeAllMenus();

      if (menu && !isOpen) {
        menu.classList.add("show");
      }
    };
  });
}

function applyFilters() {
  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const type = typeFilter ? typeFilter.value : "";
  const order = orderFilter ? orderFilter.value : "recent";

  let filtered = allFeedPosts.filter(post => {
    const searchTarget = [
      post.title,
      post.author,
      post.description,
      post.technologies.join(" ")
    ].join(" ").toLowerCase();

    const matchesSearch = searchTarget.includes(search);
    const matchesType = !type || post.type === type;

    return matchesSearch && matchesType;
  });

  if (order === "liked") {
    filtered.sort((a, b) => b.likes - a.likes);
  } else if (order === "comments") {
    filtered.sort((a, b) => b.comments.length - a.comments.length);
  } else if (order === "saved") {
    filtered.sort((a, b) => b.saves - a.saves);
  } else {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  renderPosts(filtered);
}

async function loadFeedFromDatabase() {
  try {
    if (typeof getPublicProjects !== "function") {
      throw new Error("Função getPublicProjects não encontrada.");
    }

    const posts = await getPublicProjects();

    allFeedPosts = Array.isArray(posts)
      ? posts.map(mapDbPostToFeed)
      : [];

    if (!allFeedPosts.length) {
      allFeedPosts = getPostsFromLocalStorage();
    }

    savePostsToLocalStorage(allFeedPosts);
    applyFilters();
  } catch (error) {
    console.error("Erro ao carregar feed do banco:", error);

    allFeedPosts = getPostsFromLocalStorage();
    savePostsToLocalStorage(allFeedPosts);
    applyFilters();
  }
}

function initializeFeed() {
  if (!localStorage.getItem(FEED_STORAGE_KEY)) {
    savePostsToLocalStorage(defaultPosts);
  }

  allFeedPosts = getPostsFromLocalStorage();

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (typeFilter) {
    typeFilter.addEventListener("change", applyFilters);
  }

  if (orderFilter) {
    orderFilter.addEventListener("change", applyFilters);
  }

  if (closePreviewModal) {
    closePreviewModal.addEventListener("click", closePreview);
  }

  if (projectPreviewModal) {
    projectPreviewModal.addEventListener("click", (e) => {
      if (e.target === projectPreviewModal) {
        closePreview();
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".post-menu")) {
      closeAllMenus();
    }
  });

  loadFeedFromDatabase();
}

initializeFeed();