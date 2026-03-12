const grid = document.getElementById("grid");
const q = document.getElementById("q");

function render() {
  const list = APPS;
  const term = q ? q.value.trim().toLowerCase() : "";

  let filtered = list;
  if (term) {
    filtered = list.filter(a =>
      (a.titulo + " " + a.desc + " " + a.tag).toLowerCase().includes(term)
    );
  }

  grid.innerHTML = filtered.map((app, index) => `
    <article class="app" role="button" tabindex="0" data-url="${app.url}">
      <div class="appTop">
        <h3>${app.titulo}</h3>
        <span class="chip">${app.tag}</span>
      </div>
      <p class="muted">${app.desc}</p>
      <div class="appBottom">
        <span class="go">Abrir →</span>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".app").forEach((el) => {
    el.addEventListener("click", () => {
      location.href = el.dataset.url;
    });
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        location.href = el.dataset.url;
      }
    });
  });
}

// Renderizar ao carregar
render();

// Busca ao digitar
if (q) {
  q.addEventListener("input", render);
}