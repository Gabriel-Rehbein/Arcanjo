const grid = document.getElementById("grid");
const q = document.getElementById("q");
const tagFilter = document.getElementById("tagFilter");
const addProjectBtn = document.getElementById("addProject");
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const projectForm = document.getElementById("projectForm");
const tituloInput = document.getElementById("titulo");
const descInput = document.getElementById("desc");
const tagInput = document.getElementById("tag");
const urlInput = document.getElementById("url");
const cancelBtn = document.getElementById("cancelBtn");

const stats = document.getElementById("stats");

function renderStats() {
  if (!stats) return;
  const total = APPS.length;
  const tags = {};
  APPS.forEach(app => {
    tags[app.tag] = (tags[app.tag] || 0) + 1;
  });
  const uniqueTags = Object.keys(tags).length;

  stats.innerHTML = `
    <div class="stat">
      <h4>Total de Projetos</h4>
      <p>${total}</p>
    </div>
    <div class="stat">
      <h4>Tags Únicas</h4>
      <p>${uniqueTags}</p>
    </div>
  `;
}

function populateTagFilter() {
  if (!tagFilter) return;
  const tags = [...new Set(APPS.map(app => app.tag))];
  tagFilter.innerHTML = '<option value="">Todas as Tags</option>';
  tags.forEach(tag => {
    const option = document.createElement('option');
    option.value = tag;
    option.textContent = tag;
    tagFilter.appendChild(option);
  });
}

function cardTemplate(app, index) {
  const hasModal = !!modal;
  return `
    <article class="app" role="button" tabindex="0" data-url="${app.url}" data-index="${index}">
      <div class="appTop">
        <h3>${app.titulo}</h3>
        <span class="chip">${app.tag}</span>
      </div>
      <p class="muted">${app.desc}</p>
      <div class="appBottom">
        <span class="go">Abrir →</span>
        ${hasModal ? `<div class="actions">
          <button class="btn small edit-btn" data-index="${index}">Editar</button>
          <button class="btn small delete-btn" data-index="${index}">Deletar</button>
        </div>` : ''}
      </div>
    </article>
  `;
}

function getFilteredApps() {
  let filtered = APPS;
  const term = q.value.trim().toLowerCase();
  const selectedTag = tagFilter.value;

  if (term) {
    filtered = filtered.filter(a =>
      (a.titulo + " " + a.desc + " " + a.tag).toLowerCase().includes(term)
    );
  }

  if (selectedTag) {
    filtered = filtered.filter(a => a.tag === selectedTag);
  }

  return filtered;
}

function render() {
  const list = getFilteredApps();
  grid.innerHTML = list.map((app, index) => cardTemplate(app, APPS.indexOf(app))).join("");
  grid.querySelectorAll(".app").forEach((el) => {
    const index = parseInt(el.dataset.index);
    const open = () => (location.href = el.dataset.url);
    el.addEventListener("click", (e) => {
      if (!e.target.classList.contains('edit-btn') && !e.target.classList.contains('delete-btn')) {
        open();
      }
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") open();
    });
  });

  // Event listeners para editar e deletar
  if (modal) {
    grid.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        editProject(index);
      });
    });

    grid.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        deleteProject(index);
      });
    });
  }
}

populateTagFilter();
renderStats();
render();

if (q) q.addEventListener("input", render);
if (tagFilter) tagFilter.addEventListener("change", render);

// Funções do modal
function openModal(isEdit = false, index = -1) {
  if (!modal || !modalTitle || !tituloInput || !descInput || !tagInput || !urlInput || !projectForm) return;
  editingIndex = index;
  modalTitle.textContent = isEdit ? "Editar Projeto" : "Adicionar Projeto";
  if (isEdit) {
    const app = APPS[index];
    tituloInput.value = app.titulo;
    descInput.value = app.desc;
    tagInput.value = app.tag;
    urlInput.value = app.url;
  } else {
    projectForm.reset();
  }
  modal.style.display = "flex";
}

function closeModal() {
  if (!modal) return;
  modal.style.display = "none";
  editingIndex = -1;
}

function addProject() {
  if (!tituloInput || !descInput || !tagInput || !urlInput) return;
  const newApp = {
    id: Date.now().toString(),
    titulo: tituloInput.value,
    desc: descInput.value,
    tag: tagInput.value,
    url: urlInput.value
  };
  APPS.push(newApp);
  saveApps();
  populateTagFilter();
  renderStats();
  render();
  closeModal();
}

function editProject(index) {
  openModal(true, index);
}

function updateProject() {
  if (editingIndex >= 0 && tituloInput && descInput && tagInput && urlInput) {
    APPS[editingIndex] = {
      ...APPS[editingIndex],
      titulo: tituloInput.value,
      desc: descInput.value,
      tag: tagInput.value,
      url: urlInput.value
    };
    saveApps();
    populateTagFilter();
    renderStats();
    render();
    closeModal();
  }
}

function deleteProject(index) {
  if (confirm("Tem certeza que deseja deletar este projeto?")) {
    APPS.splice(index, 1);
    saveApps();
    populateTagFilter();
    renderStats();
    render();
  }
}

// Event listeners
if (addProjectBtn) addProjectBtn.addEventListener("click", () => openModal());

if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

if (projectForm) projectForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (editingIndex >= 0) {
    updateProject();
  } else {
    addProject();
  }
});

// Fechar modal ao clicar fora
if (modal) modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

// Dados de armazenamento (em MB)
const STORAGE_DATA = {
  'apps': 30.38,
  'img': 3.61,
  'css': 0.01,
  'js': 0.01
};

// Cores para o gráfico
const STORAGE_COLORS = [
  '#8ab4ff',
  '#ff6b6b',
  '#ffd93d',
  '#6bcf7f'
];

function renderStorageChart() {
  const canvas = document.getElementById('storageChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const labels = Object.keys(STORAGE_DATA);
  const data = Object.values(STORAGE_DATA);
  const total = data.reduce((a, b) => a + b, 0);

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.map(l => l.toUpperCase()),
      datasets: [{
        data: data,
        backgroundColor: STORAGE_COLORS,
        borderColor: '#0b0f14',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#a6b3c4',
            font: { size: 12 },
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#e8eef7',
          bodyColor: '#8ab4ff',
          borderColor: '#8ab4ff',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(context) {
              const value = context.parsed;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${value.toFixed(2)} MB (${percentage}%)`;
            }
          }
        }
      }
    }
  });

  // Renderizar informações detalhadas
  const storageInfo = document.getElementById('storageInfo');
  if (storageInfo) {
    let infoHTML = `<div class="storage-info-item"><strong>Tamanho Total: ${total.toFixed(2)} MB (${(total / 1024).toFixed(2)} GB)</strong></div>`;
    labels.forEach((label, index) => {
      const value = data[index];
      const percentage = ((value / total) * 100).toFixed(1);
      infoHTML += `
        <div class="storage-info-item">
          <div class="storage-color-box" style="background-color: ${STORAGE_COLORS[index]}"></div>
          <span class="storage-info-label">${label.toUpperCase()}:</span>
          <span class="storage-info-value">${value.toFixed(2)} MB (${percentage}%)</span>
        </div>
      `;
    });
    storageInfo.innerHTML = infoHTML;
  }
}

// Renderizar o gráfico ao carregar
renderStorageChart();