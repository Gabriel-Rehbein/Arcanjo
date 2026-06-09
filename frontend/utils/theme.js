// Tema padrão do app. Para alterar o tema padrão, mude este valor
// para um dos `value` presentes em `THEMES`, por exemplo: "light", "dark", "suave".
export const DEFAULT_THEME = "suave";

export const THEMES = [
  {
    value: "dark",
    label: "Escuro",
    description: "Fundo escuro com azul vivo.",
    colors: ["#020617", "#0f172a", "#38bdf8"],
  },
  {
    value: "light",
    label: "Claro",
    description: "Interface clara e limpa.",
    colors: ["#f8fafc", "#ffffff", "#6366f1"],
  },
  {
    value: "midnight",
    label: "Meia-noite",
    description: "Mais contraste para usar à noite.",
    colors: ["#030712", "#111827", "#22d3ee"],
  },
  {
    value: "forest",
    label: "Floresta",
    description: "Verdes calmos para foco.",
    colors: ["#052e16", "#064e3b", "#34d399"],
  },
  {
    value: "sunset",
    label: "Pôr do sol",
    description: "Tons quentes com fundo confortável.",
    colors: ["#451a03", "#7c2d12", "#fb923c"],
  },
  {
    value: "rose",
    label: "Rosa",
    description: "Visual suave com destaque vibrante.",
    colors: ["#4a044e", "#831843", "#f472b6"],
  },
  {
    value: "suave",
    label: "Suave",
    description: "Tons neutros e suaves para descanso visual.",
    colors: ["#f5f7f5", "#ffffff", "#5b8c85"],
  },
];

export function getStoredTheme() {
  if (typeof window === "undefined") return DEFAULT_THEME;

  const stored = localStorage.getItem("arcanjo_theme");
  return THEMES.some((theme) => theme.value === stored) ? stored : DEFAULT_THEME;
}

export function applyTheme(themeValue) {
  if (typeof document === "undefined") return DEFAULT_THEME;

  const nextTheme = THEMES.some((theme) => theme.value === themeValue)
    ? themeValue
    : DEFAULT_THEME;

  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme === "light" ? "light" : "dark";

  if (typeof window !== "undefined") {
    localStorage.setItem("arcanjo_theme", nextTheme);
  }

  return nextTheme;
}
