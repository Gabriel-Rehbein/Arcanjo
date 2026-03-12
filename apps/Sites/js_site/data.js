// Só adicionar novos itens aqui:
const APPS = [
  {
    id: "Karen Ibias",
    titulo: "Karen Ibias Ballet",
    desc: "Site feito para uma escola de dança.",
    url: "../Sites/karen/index.html",
    tag: "Site"
  },
    {
    id: "Adelise",
    titulo: "Adrelise - Cantora",
    desc: "Site para uma cantora pop Nacional.",
    url: "../Sites/adrelise/index.html",
    tag: "Site"
  },
    {
    id: "Advogacia",
    titulo: "Site de Advogacia",
    desc: "Site criado como teste para centralizar div - Projeto Final da Cadeira de Interfaces Web.",
    url: "../Sites/advogadosgabriel/index.html",
    tag: "Site Teste"
  },
    {
    id: "Luana Yoga",
    titulo: "Luana Yoga",
    desc: "Site criado para uma médica praticante de yoga - Projeto Final da Cadeira de Gestão agil de Projetos.",
    url: "../Sites/luanayoga/public_html/index.html",
    tag: "Site"
  },
      {
    id: "Panela Doce",
    titulo: "Panela Doce",
    desc: "Site dedicado a uma vendedora de doces.",
    url: "../Sites/paneladoce/index.html",
    tag: "Site"
  },
];

// Função para salvar APPS (compatibilidade)
function saveApps() {
  localStorage.setItem('arcanjo_apps_sites', JSON.stringify(APPS));
}