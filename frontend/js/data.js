// Dados padrão
const DEFAULT_APPS = [
  {
    id: "jogo",
    titulo: "Friv do Gabi",
    desc: "Abra seus jogos em um clique.",
    url: "apps/friv/index.html",
    tag: "jogo"
  },
  {
    id: "App de Matemática",
    titulo: "App de Matemática",
    desc: "Acesso ao Aplicativo de Matemática.",
    url: "apps/appmat/index.html",
    tag: "Aplicativo"
  },
  {
    id: "Sistema de Pet Shop",
    titulo: "Sistema de pet",
    desc: "Sistema de uma Pet muito legal",
    url: "apps/PetShop/index.html",
    tag: "Sistema"
  },
    {
    id: "GabNet",
    titulo: "GabNet",
    desc: "Acesso a uma Netflix com descrição de filmes",
    url: "apps/gabnet/index.html",
    tag: "Entreterimento"
  },
    {
    id: "Sistema de ChatBot",
    titulo: "Chat Bot",
    desc: "Chat Bot com IA",
    url: "apps/chatbot/index.html",
    tag: "Sistema"
  },
    {
    id: "Sites",
    titulo: "Sites Diversos",
    desc: "Acesso a uma gama de sites diversos",
    url: "apps/Sites/dashboard.html",
    tag: "Conhecimento"
  },
];

// Carregar APPS do localStorage ou usar padrão
let APPS = JSON.parse(localStorage.getItem('arcanjo_apps')) || DEFAULT_APPS;

// Função para salvar APPS no localStorage
function saveApps() {
  localStorage.setItem('arcanjo_apps', JSON.stringify(APPS));
}