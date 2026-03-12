"use strict";

/**
 * i18n do GabNet — escalável e seguro
 * - Fallback automático por cadeia (lang -> pt -> chave)
 * - Placeholders com {{nome}}
 * - Pluralização simples (zero/one/other)
 * - Auto-apply em elementos com [data-i18n]
 * - Suporte a atributos via [data-i18n-attr="placeholder,title"]
 * - Region mapping por idioma (útil para provedores TMDB)
 */

(function initI18N (w) {
  const DEFAULT_LANG = "pt";

  /** Região padrão por idioma (ajuste à vontade) */
  const REGION_BY_LANG = {
    pt: "BR",
    en: "US",
    es: "ES",
  };

  /** Dicionário principal */
  const DICT = {
    pt: {
      ui: {
        searchPlaceholder: "Buscar filme ou série...",
        switchProfile: "Trocar perfil",
        clearFilters: "Limpar filtros",
        close: "Fechar",
        loading: "Carregando...",
        noResults: "Nenhum resultado encontrado",
      },
      labels: {
        synopsis: "Sinopse",
        director: "Direção",
        actors: "Elenco",
        runtime: "Duração",
        country: "País",
        availableIn: "Disponível em (idiomas)",
        whereToWatch: "Onde assistir",
      },
      messages: {
        availabilityNote: "Nota: a OMDb não informa plataformas; exibimos apenas os idiomas do título.",
        networkError: "Erro ao carregar dados. Verifique sua conexão.",
        missingData: "Informação não disponível.",
        searchHint: "Digite pelo menos 3 caracteres para buscar.",
        welcome: "Bem-vindo(a), {{name}}!",
        watchNote: "As disponibilidades variam por região e mudam com frequência.",
        watchNone: "Não encontramos plataformas para este título na sua região.",
        resultsCount_zero: "Nenhum resultado",
        resultsCount_one: "1 resultado",
        resultsCount_other: "{{count}} resultados",
      },
      watch: {
        subscription: "Assinatura",
        rent: "Aluguel",
        buy: "Compra",
        free: "Gratuito",
        ads: "Com anúncios",
        none: "Não encontramos plataformas para este título na sua região.",
        note: "As disponibilidades variam por região e mudam com frequência.",
      },
      types: { series: "Série", movie: "Filme", none: "Não informado" },
      _meta: { dir: "ltr", locale: "pt-BR" },
    },

    en: {
      ui: {
        searchPlaceholder: "Search movie or series...",
        switchProfile: "Switch profile",
        clearFilters: "Clear filters",
        close: "Close",
        loading: "Loading...",
        noResults: "No results found",
      },
      labels: {
        synopsis: "Synopsis",
        director: "Director",
        actors: "Cast",
        runtime: "Runtime",
        country: "Country",
        availableIn: "Available in (languages)",
        whereToWatch: "Where to watch",
      },
      messages: {
        availabilityNote: "Note: OMDb does not provide platform availability; we only show the title's languages.",
        networkError: "Failed to load data. Please check your connection.",
        missingData: "Information not available.",
        searchHint: "Type at least 3 characters to search.",
        welcome: "Welcome, {{name}}!",
        watchNote: "Availability varies by region and changes frequently.",
        watchNone: "We couldn't find providers for this title in your region.",
        resultsCount_zero: "No results",
        resultsCount_one: "1 result",
        resultsCount_other: "{{count}} results",
      },
      watch: {
        subscription: "Subscription",
        rent: "Rent",
        buy: "Buy",
        free: "Free",
        ads: "With ads",
        none: "We couldn't find providers for this title in your region.",
        note: "Availability varies by region and changes frequently.",
      },
      types: { series: "Series", movie: "Movie", none: "Not available" },
      _meta: { dir: "ltr", locale: "en-US" },
    },

    es: {
      ui: {
        searchPlaceholder: "Buscar película o serie...",
        switchProfile: "Cambiar perfil",
        clearFilters: "Limpiar filtros",
        close: "Cerrar",
        loading: "Cargando...",
        noResults: "No se encontraron resultados",
      },
      labels: {
        synopsis: "Sinopsis",
        director: "Dirección",
        actors: "Elenco",
        runtime: "Duración",
        country: "País",
        availableIn: "Disponible en (idiomas)",
        whereToWatch: "Dónde ver",
      },
      messages: {
        availabilityNote: "Nota: OMDb no informa plataformas; mostramos solo los idiomas del título.",
        networkError: "Error al cargar datos. Verifique su conexión.",
        missingData: "Información no disponible.",
        searchHint: "Escriba al menos 3 caracteres para buscar.",
        welcome: "¡Bienvenido, {{name}}!",
        watchNote: "La disponibilidad varía por región y cambia con frecuencia.",
        watchNone: "No encontramos plataformas para este título en tu región.",
        resultsCount_zero: "Ningún resultado",
        resultsCount_one: "1 resultado",
        resultsCount_other: "{{count}} resultados",
      },
      watch: {
        subscription: "Suscripción",
        rent: "Alquiler",
        buy: "Compra",
        free: "Gratis",
        ads: "Con anuncios",
        none: "No encontramos plataformas para este título en tu región.",
        note: "La disponibilidad varía por región y cambia con frecuencia.",
      },
      types: { series: "Serie", movie: "Película", none: "No disponible" },
      _meta: { dir: "ltr", locale: "es-ES" },
    },
  };

  let currentLang = DEFAULT_LANG;

  /** Utils */
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  const deepMerge = (base, extra) => {
    const out = { ...base };
    for (const k in extra) {
      if (isObj(extra[k]) && isObj(base[k])) out[k] = deepMerge(base[k], extra[k]);
      else out[k] = extra[k];
    }
    return out;
  };

  const getPath = (obj, path) =>
    path.split(".").reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);

  /** Sanitiza valores para placeholders (básico) */
  const sanitize = (v) => String(v).replace(/[<>]/g, (m) => ({ "<": "&lt;", ">": "&gt;" }[m]));

  /** Render de placeholders {{var}} */
  const renderTpl = (str, vars = {}) =>
    String(str).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => sanitize(getPath(vars, k) ?? ""));

  /** Fallback chain: lang -> pt -> key literal */
  const resolveKey = (key, lang) => {
    const fromLang = getPath(DICT[lang], key);
    if (fromLang !== undefined) return fromLang;
    const fromPt = getPath(DICT[DEFAULT_LANG], key);
    if (fromPt !== undefined) return fromPt;
    return undefined; // para diferenciar “não encontrado”
  };

  /** Tradução simples */
  function T(key, lang = currentLang, vars = {}) {
    const val = resolveKey(key, lang);
    if (val === undefined) return key; // mostra a chave quando não há tradução
    return typeof val === "string" ? renderTpl(val, vars) : val;
  }

  /**
   * Pluralização simples
   * Usa sufixos: key_zero | key_one | key_other
   * Ex.: TPL("messages.resultsCount", 0|1|n, lang, {count:n})
   */
  function TP(baseKey, count, lang = currentLang, vars = {}) {
    const sel = count === 0 ? "zero" : count === 1 ? "one" : "other";
    const key = `${baseKey}_${sel}`;
    return T(key, lang, { ...vars, count });
  }

  /** Define/obtém idioma atual e aplica metadados (dir, lang) */
  function setLocale(lang) {
    if (!DICT[lang]) lang = DEFAULT_LANG;
    currentLang = lang;
    const meta = DICT[lang]._meta || {};
    document.documentElement.setAttribute("lang", meta.locale || lang);
    document.documentElement.setAttribute("dir", meta.dir || "ltr");
    return currentLang;
  }

  function getLocale() {
    return currentLang;
  }

  /** Aplica traduções em elementos com [data-i18n] */
  function applyI18n(root = document, lang = currentLang) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const attrs = (el.getAttribute("data-i18n-attr") || "").split(",").map((s) => s.trim()).filter(Boolean);
      const txt = T(key, lang);
      if (attrs.length) {
        attrs.forEach((a) => {
          if (a === "text") el.textContent = txt;
          else el.setAttribute(a, txt);
        });
      } else {
        el.textContent = txt;
      }
    });
  }

  /** Mescla/estende dicionário no idioma */
  function extendDict(lang, partial) {
    if (!DICT[lang]) DICT[lang] = {};
    DICT[lang] = deepMerge(DICT[lang], partial || {});
  }

  /** Regiões helper */
  function regionFromLang(lang = currentLang) {
    return REGION_BY_LANG[lang] || REGION_BY_LANG[DEFAULT_LANG];
  }

  /** Expondo na window */
  w.GN_I18N = DICT;
  w.GN_T = T;
  w.GN_TP = TP;
  w.GN_I18N_setLocale = setLocale;
  w.GN_I18N_getLocale = getLocale;
  w.GN_I18N_apply = applyI18n;
  w.GN_I18N_extend = extendDict;
  w.GN_I18N_regionFromLang = regionFromLang;

  // Inicializa com DEFAULT_LANG e aplica se já houver nós marcados
  setLocale(currentLang);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applyI18n());
  } else {
    applyI18n();
  }
})(window);
