const API_KEY = "7cddb25c";
const results = document.getElementById("results");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const langSelect = document.getElementById("langSelect");

// Modal refs
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalBadges = document.getElementById("modalBadges");
const modalPlot = document.getElementById("modalPlot");
const kvDirector = document.getElementById("kvDirector");
const kvActors = document.getElementById("kvActors");
const kvRuntime = document.getElementById("kvRuntime");
const kvCountry = document.getElementById("kvCountry");
const langChips = document.getElementById("langChips");

// i18n básico (UI)
const I18N = {
  pt: {
    searchPlaceholder: "Buscar filme ou série...",
    synopsis: "Sinopse",
    director: "Direção",
    actors: "Elenco",
    runtime: "Duração",
    country: "País",
    availableIn: "Disponível em (idiomas)",
    availabilityNote: "Nota: a OMDb não informa em quais plataformas está disponível; exibimos apenas os idiomas do título.",
    series: "Série",
    movie: "Filme",
    none: "Não informado",
  },
  en: {
    searchPlaceholder: "Search movie or series...",
    synopsis: "Synopsis",
    director: "Director",
    actors: "Cast",
    runtime: "Runtime",
    country: "Country",
    availableIn: "Available in (languages)",
    availabilityNote: "Note: OMDb does not provide platform availability; we only show the title's languages.",
    series: "Series",
    movie: "Movie",
    none: "Not available",
  },
  es: {
    searchPlaceholder: "Buscar película o serie...",
    synopsis: "Sinopsis",
    director: "Dirección",
    actors: "Elenco",
    runtime: "Duración",
    country: "País",
    availableIn: "Disponible en (idiomas)",
    availabilityNote: "Nota: OMDb no informa plataformas; mostramos solo los idiomas del título.",
    series: "Serie",
    movie: "Película",
    none: "No disponible",
  }
};

let currentLang = "pt";

// ---- Inicialização
(function init(){
  // auto por idioma do navegador
  const nav = navigator.language?.slice(0,2);
  if (["pt","en","es"].includes(nav)) {
    currentLang = nav;
    langSelect.value = nav;
  }
  applyI18n();
})();

langSelect.addEventListener("change", () => {
  currentLang = langSelect.value;
  applyI18n();
});

function t(key){ return I18N[currentLang][key]; }

function applyI18n(){
  // placeholders
  searchInput.placeholder = t("searchPlaceholder");
  // textos marcados com data-i18n
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if (I18N[currentLang][key]) el.textContent = t(key);
  });
}

// ---- Busca
searchBtn.addEventListener("click", () => searchMovies());
searchInput.addEventListener("keydown", e => { if (e.key === "Enter") searchMovies(); });

async function searchMovies() {
  const query = searchInput.value.trim();
  if (!query) return;

  results.innerHTML = `<p style="padding:18px" class="muted">Carregando...</p>`;

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`;
    const resp = await fetch(url);
    const data = await resp.json();

    if (data.Response === "False") {
      results.innerHTML = `<p style="padding:18px" class="muted">Nenhum resultado.</p>`;
      return;
    }

    renderCards(data.Search || []);
  } catch (e) {
    console.error(e);
    results.innerHTML = `<p style="padding:18px;color:#ff9999">Erro ao buscar.</p>`;
  }
}

function renderCards(items){
  results.innerHTML = "";
  const tpl = document.getElementById("cardTpl");

  items.forEach(item=>{
    const node = tpl.content.cloneNode(true);
    const img = node.querySelector(".poster");
    const title = node.querySelector(".title");
    const year = node.querySelector(".year");
    const badge = node.querySelector(".badge-type");

    img.src = (item.Poster && item.Poster !== "N/A")
      ? item.Poster
      : "https://via.placeholder.com/300x450?text=Sem+Imagem";
    img.alt = item.Title;
    title.textContent = item.Title;
    year.textContent = item.Year || "";
    badge.textContent = (item.Type === "series" ? t("series") : t("movie"));

    node.querySelector(".card").addEventListener("click", ()=> openDetails(item.imdbID));
    results.appendChild(node);
  });
}

// ---- Detalhes
async function openDetails(imdbID){
  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}&plot=full`;
    const resp = await fetch(url);
    const m = await resp.json();

    // Poster + título + meta
    modalPoster.src = (m.Poster && m.Poster !== "N/A") ? m.Poster : "https://via.placeholder.com/300x450?text=Sem+Imagem";
    modalTitle.textContent = `${m.Title || ""} ${m.Year ? `(${m.Year})` : ""}`;
    modalMeta.textContent = [m.Rated, m.Released, m.Type?.toUpperCase()].filter(Boolean).join(" • ");

    // Badges (nota IMDb, gênero)
    modalBadges.innerHTML = "";
    if (m.imdbRating && m.imdbRating !== "N/A") addBadge(`⭐ IMDb ${m.imdbRating}`, "star");
    if (m.Metascore && m.Metascore !== "N/A") addBadge(`Metascore ${m.Metascore}`);
    if (m.Genre && m.Genre !== "N/A") m.Genre.split(",").slice(0,4).forEach(g => addBadge(g.trim()));

    // Plot
    modalPlot.textContent = m.Plot && m.Plot !== "N/A" ? m.Plot : t("none");

    // KV
    kvDirector.textContent = (m.Director && m.Director !== "N/A") ? m.Director : t("none");
    kvActors.textContent   = (m.Actors   && m.Actors   !== "N/A") ? m.Actors   : t("none");
    kvRuntime.textContent  = (m.Runtime  && m.Runtime  !== "N/A") ? m.Runtime  : t("none");
    kvCountry.textContent  = (m.Country  && m.Country  !== "N/A") ? m.Country  : t("none");

    // Idiomas -> chips "Disponível em (idiomas)"
    langChips.innerHTML = "";
    const langsRaw = (m.Language && m.Language !== "N/A") ? m.Language : "";
    const langs = langsRaw.split(",").map(s=>s.trim()).filter(Boolean);
    if (langs.length) {
      langs.forEach(l => {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = l;
        langChips.appendChild(chip);
      });
    } else {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = t("none");
      langChips.appendChild(chip);
    }

    openModal();
  } catch (e) {
    console.error(e);
    alert("Erro ao carregar detalhes.");
  }
}

function addBadge(text, mode){
  const b = document.createElement("span");
  b.className = "badge" + (mode ? ` ${mode}` : "");
  b.textContent = text;
  modalBadges.appendChild(b);
}

// Modal controls
function openModal(){ modal.classList.remove("hidden"); }
function closeModal(){ modal.classList.add("hidden"); }
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=> { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", (e)=> { if (e.key === "Escape") closeModal(); });
