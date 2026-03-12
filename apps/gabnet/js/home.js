"use strict";

/* ========= Helpers ========= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/* ========= Config ========= */
const OMDB_KEY = "7cddb25c"; // sua key
const TMDB_KEY = "YOUR_TMDB_KEY"; // <— preencha
const TMDB_IMG = "https://image.tmdb.org/t/p/w92";

const SEED_IMDB_IDS = [
  "tt0133093","tt1375666","tt0816692","tt0468569","tt1392190","tt0120737","tt0167261","tt0167260",
  "tt2015381","tt1431045","tt0172495","tt4154796","tt0848228","tt2911666","tt1074638","tt0381061","tt4912910",
  "tt5052448","tt7784604","tt6644200","tt0078748","tt0070047","tt1396484","tt1457767",
  "tt0111161","tt0068646","tt0110912","tt0137523","tt6751668","tt7286456","tt0109830",
  "tt0107290","tt0245429","tt0910970","tt2096673","tt0126029","tt0120915"
];

/* ========= DOM ========= */
const results = $("#results");
const searchInput = $("#searchInput");
const searchBtn = $("#searchBtn");
const langSelect = $("#langSelect");
const profileChip = $("#profileChip");
const switchProfile = $("#switchProfile");
const clearFiltersBtn = $("#clearFilters");
const genreCheckboxes = $$(".genre-filter");

// Modal
const modal = $("#modal");
const modalClose = $("#modalClose");
const modalPoster = $("#modalPoster");
const modalTitle = $("#modalTitle");
const modalMeta = $("#modalMeta");
const modalBadges = $("#modalBadges");
const modalPlot = $("#modalPlot");
const kvDirector = $("#kvDirector");
const kvActors = $("#kvActors");
const kvRuntime = $("#kvRuntime");
const kvCountry = $("#kvCountry");
const langChips = $("#langChips");

// Provedores (seção "Onde assistir" precisa existir no HTML)
const provEmpty = $("#prov-empty");

/* ========= i18n (usa tua engine GN_*) ========= */
let currentLang = (window.GN_I18N_getLocale && window.GN_I18N_getLocale()) || "pt";
function T(key, vars) { return (window.GN_T ? GN_T(key, currentLang, vars) : key); }
function TP(key, count, vars) { return (window.GN_TP ? GN_TP(key, count, currentLang, vars) : `${count} ${key}`); }
function regionByLang() {
  return (window.GN_I18N_regionFromLang ? GN_I18N_regionFromLang(currentLang) : (currentLang === "en" ? "US" : currentLang === "es" ? "ES" : "BR"));
}
function applyI18n() {
  // Usa auto-aplicação se existir
  if (window.GN_I18N_apply) GN_I18N_apply(document, currentLang);

  // Placeholders e rótulos dinâmicos
  searchInput.placeholder = T("ui.searchPlaceholder");
  switchProfile.textContent = T("ui.switchProfile");
}

/* ========= Estado ========= */
let allItems = [];   // catálogo (OMDb detail)
let viewItems = [];  // itens exibidos
let searchAbort = null; // AbortController para buscas
const detailCache = new Map(); // cache leve para detalhes OMDb por imdbID

/* ========= Perfil ========= */
(function initProfile() {
  try {
    const act = JSON.parse(localStorage.getItem("gabnet_active_profile") || "null");
    const accounts = JSON.parse(localStorage.getItem("gabnet_accounts") || "[]");
    const acc = accounts.find(a => a.id === act?.accountId);
    const prof = acc?.profiles?.find(p => p.id === act?.profileId);
    if (!acc || !prof) { window.location.href = "profiles.html"; return; }
    profileChip.innerHTML = `
      <img src="${prof.avatar || `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(prof.name)}`}" alt="">
      <span>${prof.name}</span>
    `;
  } catch {
    window.location.href = "profiles.html";
  }
})();



/* ========= Busca ========= */
const debouncedSearch = debounce(runTextSearch, 350);

searchBtn?.addEventListener("click", () => runTextSearch());
searchInput?.addEventListener("keydown", (e) => { if (e.key === "Enter") runTextSearch(); });
searchInput?.addEventListener("input", () => {
  if ((searchInput.value || "").trim().length >= 3) debouncedSearch();
});

async function runTextSearch() {
  const q = (searchInput.value || "").trim();
  if (!q) return;

  // Cancelar anterior
  if (searchAbort) searchAbort.abort();
  searchAbort = new AbortController();

  showSkeleton();
  try {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", OMDB_KEY);
    url.searchParams.set("s", q);

    const res = await fetch(url, { signal: searchAbort.signal });
    const data = await res.json();
    if (data.Response === "False") {
      results.innerHTML = `<p class="muted" style="padding:18px">${T("ui.noResults")}</p>`;
      viewItems = [];
      return;
    }

    const ids = (data.Search || []).map(x => x.imdbID);
    const details = await fetchDetailsInChunks(ids, 10);
    viewItems = details;
    clearGenreFiltersUI();
    renderCards(viewItems);
  } catch (e) {
    if (e.name !== "AbortError") {
      console.error(e);
      results.innerHTML = `<p style="padding:18px;color:#ff9a9a">${T("messages.networkError")}</p>`;
    }
  } finally {
    searchAbort = null;
  }
}

/* ========= Catálogo inicial ========= */
window.addEventListener("DOMContentLoaded", async () => {
  showSkeleton(T("ui.loading"));
  allItems = await fetchDetailsInChunks(SEED_IMDB_IDS, 10);
  viewItems = [...allItems];
  renderCards(viewItems);
});

/* ========= OMDb utils ========= */
async function fetchDetailsInChunks(ids, chunkSize = 10) {
  const chunks = [];
  for (let i = 0; i < ids.length; i += chunkSize) chunks.push(ids.slice(i, i + chunkSize));

  const out = [];
  for (const c of chunks) {
    const promises = c.map(id => fetchDetail(id));
    const res = await Promise.all(promises);
    res.forEach(m => { if (m) out.push(m); });
    await sleep(150); // gentil com a API
  }

  // Dedup
  const map = new Map();
  out.forEach(m => map.set(m.imdbID, m));
  return Array.from(map.values());
}

async function fetchDetail(imdbID) {
  if (detailCache.has(imdbID)) return detailCache.get(imdbID);
  try {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", OMDB_KEY);
    url.searchParams.set("i", imdbID);
    url.searchParams.set("plot", "short");
    const r = await fetch(url);
    const m = await r.json();
    if (m?.Response === "False") return null;
    detailCache.set(imdbID, m);
    return m;
  } catch { return null; }
}

/* ========= Render ========= */
function showSkeleton(msg) {
  results.innerHTML = Array.from({ length: 12 }).map(() => `
    <article class="card skel">
      <div class="card-img-wrap"></div>
      <div class="card-body">
        <div class="skel" style="height:16px;width:80%;border-radius:8px;margin:6px 0;"></div>
        <div class="skel" style="height:12px;width:40%;border-radius:8px;"></div>
      </div>
    </article>
  `).join("") + (msg ? `<p class="muted" style="padding:10px">${msg}</p>` : "");
}

function renderCards(items) {
  const tpl = $("#cardTpl");
  results.innerHTML = "";
  if (!items.length) {
    results.innerHTML = `<p style="padding:18px" class="muted">${T("ui.noResults")}</p>`;
    return;
  }
  items.forEach(item => {
    const node = tpl.content.cloneNode(true);
    const img = $(".poster", node);
    const title = $(".title", node);
    const year = $(".year", node);
    const badge = $(".badge-type", node);

    img.src = (item.Poster && item.Poster !== "N/A") ? item.Poster : placeholderPoster();
    img.alt = item.Title || "";
    title.textContent = item.Title || "";
    year.textContent = item.Year || "";
    const isSeries = (item.Type || "").toLowerCase() === "series";
    badge.textContent = T(isSeries ? "types.series" : "types.movie");

    $(".card", node).addEventListener("click", () => openDetails(item.imdbID));
    results.appendChild(node);
  });
}

function placeholderPoster(w = 300, h = 450) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
    <rect width='100%' height='100%' fill='%2322232a'/>
    <text x='50%' y='50%' fill='%23a0a4ad' font-family='Inter,Arial' font-size='16' text-anchor='middle' dominant-baseline='middle'>${T("types.none")}</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/* ========= Modal Detalhes ========= */
async function openDetails(id) {
  try {
    const url = new URL("https://www.omdbapi.com/");
    url.searchParams.set("apikey", OMDB_KEY);
    url.searchParams.set("i", id);
    url.searchParams.set("plot", "full");
    const r = await fetch(url);
    const m = await r.json();

    modalPoster.src = (m.Poster && m.Poster !== "N/A") ? m.Poster : placeholderPoster();
    modalTitle.textContent = `${m.Title || ""} ${m.Year ? `(${m.Year})` : ""}`;
    modalMeta.textContent = [m.Rated, m.Released, (m.Type || "").toUpperCase()].filter(Boolean).join(" • ");

    // badges
    modalBadges.innerHTML = "";
    if (m.imdbRating && m.imdbRating !== "N/A") addBadge(`⭐ IMDb ${m.imdbRating}`, "star");
    if (m.Metascore && m.Metascore !== "N/A") addBadge(`Metascore ${m.Metascore}`);
    if (m.Genre && m.Genre !== "N/A") m.Genre.split(",").slice(0, 4).forEach(g => addBadge(g.trim()));

    // campos
    modalPlot.textContent  = (m.Plot    && m.Plot    !== "N/A") ? m.Plot    : T("types.none");
    kvDirector.textContent = (m.Director&& m.Director!== "N/A") ? m.Director: T("types.none");
    kvActors.textContent   = (m.Actors  && m.Actors  !== "N/A") ? m.Actors  : T("types.none");
    kvRuntime.textContent  = (m.Runtime && m.Runtime !== "N/A") ? m.Runtime : T("types.none");
    kvCountry.textContent  = (m.Country && m.Country !== "N/A") ? m.Country : T("types.none");

    // idiomas
    langChips.innerHTML = "";
    const langs = (m.Language && m.Language !== "N/A") ? m.Language.split(",").map(s => s.trim()) : [];
    if (langs.length) langs.forEach(l => { const c = document.createElement("span"); c.className = "chip"; c.textContent = l; langChips.appendChild(c); });
    else { const c = document.createElement("span"); c.className = "chip"; c.textContent = T("types.none"); langChips.appendChild(c); }

    // Onde assistir (TMDB)
    await renderProviders(m.imdbID, (m.Type || "").toLowerCase());

    openModal();
  } catch (e) {
    console.error(e);
    alert(T("messages.networkError"));
  }
}

function addBadge(text, mode) {
  const b = document.createElement("span");
  b.className = "badge" + (mode ? ` ${mode}` : "");
  b.textContent = text;
  modalBadges.appendChild(b);
}

function openModal() { modal.classList.remove("hidden"); }
function closeModal() { modal.classList.add("hidden"); }
modalClose?.addEventListener("click", closeModal);
modal?.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ========= Filtros por gênero ========= */
genreCheckboxes.forEach(cb => cb.addEventListener("change", applyGenreFilters));
clearFiltersBtn?.addEventListener("click", () => {
  clearGenreFiltersUI();
  viewItems = [...allItems];
  renderCards(viewItems);
  if (searchInput) searchInput.value = "";
});

function clearGenreFiltersUI() { genreCheckboxes.forEach(cb => cb.checked = false); }

function applyGenreFilters() {
  const selected = genreCheckboxes.filter(cb => cb.checked).map(cb => cb.value);
  if (!selected.length) {
    viewItems = [...allItems];
    renderCards(viewItems);
    return;
  }
  viewItems = allItems.filter(m => {
    const genres = (m.Genre || "").split(",").map(s => s.trim());
    return genres.some(g => selected.includes(g));
  });
  renderCards(viewItems);
}

/* ============================================================
   === PROVEDORES (ONDE ASSISTIR) — COM LINKS E ÍCONES ===
   ============================================================ */

async function renderProviders(imdbID, omdbType) {
  // Limpa UI
  ["flatrate", "rent", "buy", "free", "ads"].forEach(k => {
    const list = document.getElementById(`prov-${k}`);
    if (list) list.innerHTML = "";
    const group = document.querySelector(`.providers-group[data-group="${k}"]`);
    if (group) group.hidden = true;
  });
  if (provEmpty) provEmpty.style.display = "none";

  try {
    const mediaType = omdbType === "series" ? "tv" : "movie";
    const tmdbId = await findTmdbIdByImdb(imdbID, mediaType);
    if (!tmdbId) { if (provEmpty) provEmpty.style.display = ""; return; }

    const region = regionByLang();
    const prov = await fetchWatchProviders(mediaType, tmdbId, region);
    if (!prov) { if (provEmpty) provEmpty.style.display = ""; return; }

    const anyGroup =
      renderProviderGroup("flatrate", prov.flatrate, prov.link) |
      renderProviderGroup("rent", prov.rent,   prov.link) |
      renderProviderGroup("buy",  prov.buy,    prov.link) |
      renderProviderGroup("free", prov.free,   prov.link) |
      renderProviderGroup("ads",  prov.ads,    prov.link);

    if (!anyGroup && provEmpty) provEmpty.style.display = "";
  } catch (err) {
    console.error("providers error", err);
    if (provEmpty) provEmpty.style.display = "";
  }
}

function renderProviderGroup(groupKey, arr, linkBase) {
  const group = document.querySelector(`.providers-group[data-group="${groupKey}"]`);
  const list = document.getElementById(`prov-${groupKey}`);
  if (!group || !list) return 0;

  if (!Array.isArray(arr) || arr.length === 0) { group.hidden = true; return 0; }

  group.hidden = false;
  for (const p of arr) {
    const url = linkBase || p.link || null; // TMDB às vezes entrega link geral (JustWatch)
    const el = document.createElement(url ? "a" : "span");
    el.className = "provider";
    if (url) { el.href = url; el.target = "_blank"; el.rel = "noopener noreferrer"; }
    el.title = p.provider_name || "";

    const img = document.createElement("img");
    img.src = p.logo_path ? `${TMDB_IMG}${p.logo_path}` : providerPlaceholderIcon();
    img.alt = p.provider_name || "";

    const name = document.createElement("span");
    name.textContent = p.provider_name || "";

    el.append(img, name);
    list.appendChild(el);
  }
  return 1;
}

async function findTmdbIdByImdb(imdbID, mediaType) {
  const url = new URL(`https://api.themoviedb.org/3/find/${imdbID}`);
  url.searchParams.set("api_key", TMDB_KEY);
  url.searchParams.set("external_source", "imdb_id");
  const r = await fetch(url);
  const data = await r.json();
  if (mediaType === "tv") return data.tv_results?.[0]?.id || null;
  return data.movie_results?.[0]?.id || null;
}

async function fetchWatchProviders(mediaType, tmdbId, region = "BR") {
  const url = new URL(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}/watch/providers`);
  url.searchParams.set("api_key", TMDB_KEY);
  const r = await fetch(url);
  const data = await r.json();
  const res = data.results?.[region];
  if (!res) return null;
  return {
    flatrate: res.flatrate || [],
    rent: res.rent || [],
    buy: res.buy || [],
    free: res.free || [],
    ads: res.ads || [],
    link: res.link || null
  };
}

function providerPlaceholderIcon() {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'>
    <rect width='100%' height='100%' rx='6' ry='6' fill='%2322232a'/>
    <path d='M8 6h6v10H8z' fill='%234b4f5c'/>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/* ========= Utils ========= */
function debounce(fn, ms = 300) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
