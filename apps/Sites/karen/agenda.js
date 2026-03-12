// agenda.js

const calendario = document.getElementById("calendario");
const semana = document.getElementById("semana");
const anual = document.getElementById("anual");
const tituloMes = document.getElementById("tituloMes");
const horaBrasilia = document.getElementById("horaBrasilia");
const btnMensal = document.getElementById("btnMensal");
const btnSemanal = document.getElementById("btnSemanal");
const btnAnual = document.getElementById("btnAnual");

let dataAtual = new Date();

const eventosPorData = {
  "2025-01-12": ["Aula inaugural de Jazz - Unidade Plínio"],
  "2025-01-25": ["Ensaio geral para espetáculo"],
  "2025-02-01": ["Espetáculo 'Dança dos Sonhos' - Teatro Municipal"],
  "2025-10-15": ["Evento Royal Academy"]
};

function atualizarHoraBrasilia() {
  const agora = new Date();
  const horaBR = agora.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  horaBrasilia.textContent = `Hora de Brasília: ${horaBR}`;
}

setInterval(atualizarHoraBrasilia, 1000);

function gerarCalendario(mes, ano) {
  calendario.innerHTML = "";
  calendario.style.display = "grid";
  semana.style.display = "none";
  anual.style.display = "none";
  tituloMes.textContent = `${meses[mes]} ${ano}`;

  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diaSemanaInicio = primeiroDia.getDay();
  const totalDias = ultimoDia.getDate();

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  diasSemana.forEach((dia) => {
    const el = document.createElement("div");
    el.textContent = dia;
    el.style.fontWeight = "bold";
    el.style.color = "#555";
    calendario.appendChild(el);
  });

  for (let i = 0; i < diaSemanaInicio; i++) {
    const vazio = document.createElement("div");
    vazio.classList.add("vazio");
    calendario.appendChild(vazio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const divDia = document.createElement("div");
    divDia.textContent = dia;
    divDia.classList.add("dia");

    const hoje = new Date();
    if (
      dia === hoje.getDate() &&
      mes === hoje.getMonth() &&
      ano === hoje.getFullYear()
    ) {
      divDia.classList.add("hoje");
    }

    const dataStr = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    divDia.setAttribute("data-data", dataStr);
    divDia.addEventListener("click", () => mostrarEventosDoDia(dataStr));

    calendario.appendChild(divDia);
  }
}

function mostrarEventosDoDia(dataStr) {
  const eventos = eventosPorData[dataStr];
  const modal = document.getElementById("modalEventos");
  const conteudo = document.getElementById("modalConteudo");
  const titulo = document.getElementById("modalTitulo");

  titulo.textContent = `Eventos em ${dataStr}`;
  conteudo.innerHTML = "";

  if (eventos && eventos.length > 0) {
    eventos.forEach((evento) => {
      const li = document.createElement("li");
      li.textContent = evento;
      conteudo.appendChild(li);
    });
  } else {
    conteudo.innerHTML = "<li>Sem eventos para esta data.</li>";
  }

  modal.classList.add("ativo");
}

function fecharModal() {
  document.getElementById("modalEventos").classList.remove("ativo");
}

document.getElementById("fecharModal").addEventListener("click", fecharModal);

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function alternarVisualizacao(tipo) {
  [btnMensal, btnSemanal, btnAnual].forEach((btn) => btn.classList.remove("active"));

  if (tipo === "mensal") {
    btnMensal.classList.add("active");
    gerarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());
  } else if (tipo === "semanal") {
    btnSemanal.classList.add("active");
    gerarCalendarioSemanal();
  } else if (tipo === "anual") {
    btnAnual.classList.add("active");
    gerarCalendarioAnual();
  }
}

function gerarCalendarioSemanal() {
  calendario.style.display = "none";
  anual.style.display = "none";
  semana.style.display = "block";
}

function gerarCalendarioAnual() {
  calendario.style.display = "none";
  semana.style.display = "none";
  anual.innerHTML = "";
  anual.style.display = "block";

  const container = document.createElement("div");
  container.classList.add("grade-anual");

  for (let mes = 0; mes < 12; mes++) {
    const bloco = document.createElement("div");
    bloco.classList.add("bloco-mes-anual");
    const titulo = document.createElement("h4");
    titulo.textContent = meses[mes];
    bloco.appendChild(titulo);

    const primeiroDia = new Date(2025, mes, 1);
    const ultimoDia = new Date(2025, mes + 1, 0);

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const dataStr = `2025-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const diaDiv = document.createElement("div");
      diaDiv.classList.add("mini-dia");
      diaDiv.textContent = dia;

      const hoje = new Date();
      if (dia === hoje.getDate() && mes === hoje.getMonth()) {
        diaDiv.classList.add("hoje-mini");
      }

      if (dataStr === "2025-02-01") {
        diaDiv.classList.add("evento-espetaculo");
        diaDiv.addEventListener("click", () => window.location.href = "espetaculos.html");
      } else if (dataStr === "2025-10-15") {
        diaDiv.classList.add("evento-royal");
        diaDiv.addEventListener("click", () => window.location.href = "royal.html");
      }

      bloco.appendChild(diaDiv);
    }

    container.appendChild(bloco);
  }

  anual.appendChild(container);
}

btnMensal.addEventListener("click", () => alternarVisualizacao("mensal"));
btnSemanal.addEventListener("click", () => alternarVisualizacao("semanal"));
btnAnual.addEventListener("click", () => alternarVisualizacao("anual"));

// Inicializa tudo ao carregar
atualizarHoraBrasilia();
gerarCalendario(dataAtual.getMonth(), dataAtual.getFullYear());