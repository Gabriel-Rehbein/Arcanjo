// script.js
const display = document.querySelector("#display");
const mini = document.querySelector("#mini");
const welcome = document.querySelector("#welcome");

const appsPanel = document.querySelector("#appsPanel");
const appPanel = document.querySelector("#appPanel");
const appBody = document.querySelector("#appBody");
const closeApp = document.querySelector("#closeApp");

const logEl = document.querySelector("#log");
const clearLog = document.querySelector("#clearLog");

/* ========= APP PANEL HELPERS ========= */
function showApp(html){
  appBody.innerHTML = html;
  appPanel.style.display = "flex";
}

function closeAppPanel(){
  appPanel.style.display = "none";
  appBody.innerHTML = "";
}

closeApp.addEventListener("click", closeAppPanel);
appPanel.addEventListener("click", (e) => {
  if (e.target === appPanel) closeAppPanel();
});

function log(msg){
  logEl.textContent += (logEl.textContent ? "\n" : "") + msg;
  logEl.scrollTop = logEl.scrollHeight;
}

function setDisplay(v){
  display.textContent = v;
}

function setMini(v){
  mini.textContent = v;
}

function sanitizeNumberString(s){
  // permite dígitos e um ponto
  let out = s.replace(/[^\d.]/g, "");
  const parts = out.split(".");
  if (parts.length > 2) out = parts[0] + "." + parts.slice(1).join("");
  return out;
}

/* ========= CALC ENGINE (sem eval) ========= */
let current = "0";      // número que está sendo digitado
let acc = null;         // acumulador
let op = null;          // operação pendente
let justEvaluated = false;

function resetAll(){
  current = "0";
  acc = null;
  op = null;
  justEvaluated = false;
  setMini("");
  setDisplay("0");
}

function inputDigit(d){
  if (justEvaluated){
    // depois do "=", digitar número começa novo
    current = "0";
    acc = null;
    op = null;
    justEvaluated = false;
    setMini("");
  }

  if (current === "0") current = d;
  else current += d;

  current = sanitizeNumberString(current);
  setDisplay(current);
}

function inputDot(){
  if (justEvaluated){
    current = "0";
    acc = null;
    op = null;
    justEvaluated = false;
    setMini("");
  }
  if (!current.includes(".")) current += ".";
  setDisplay(current);
}

function applyPercent(){
  // percent relativo ao acumulador se existir: acc * (current/100)
  const n = Number(current);
  if (!Number.isFinite(n)) return;

  if (acc !== null){
    current = String(acc * (n / 100));
  } else {
    current = String(n / 100);
  }
  current = trimNumber(current);
  setDisplay(current);
}

function trimNumber(x){
  const n = Number(x);
  if (!Number.isFinite(n)) return "Erro";
  // limita tamanho e remove lixo tipo 1.2300000004
  let s = String(Math.round((n + Number.EPSILON) * 1e12) / 1e12);
  if (s.includes(".")){
    s = s.replace(/0+$/, "").replace(/\.$/, "");
  }
  return s;
}

function compute(a, b, operator){
  if (operator === "+") return a + b;
  if (operator === "-") return a - b;
  if (operator === "*") return a * b;
  if (operator === "/") return (b === 0) ? NaN : a / b;
  return b;
}

function updateMini(){
  if (acc === null || !op) setMini("");
  else setMini(`${trimNumber(acc)} ${op}`);
}

function chooseOp(nextOp){
  const n = Number(current);
  if (!Number.isFinite(n)) return;

  if (acc === null){
    acc = n;
  } else if (op){
    const r = compute(acc, n, op);
    if (!Number.isFinite(r)){
      setDisplay("Erro");
      setMini("Divisão por zero");
      current = "0";
      acc = null;
      op = null;
      justEvaluated = true;
      return;
    }
    acc = r;
    setDisplay(trimNumber(acc));
  }

  op = nextOp;
  current = "0";
  justEvaluated = false;
  updateMini();
}

function evaluate(){
  const n = Number(current);
  if (!Number.isFinite(n)) return;

  if (acc === null){
    setDisplay(trimNumber(current));
    justEvaluated = true;
    return;
  }

  if (!op){
    setDisplay(trimNumber(current));
    justEvaluated = true;
    return;
  }

  const r = compute(acc, n, op);
  if (!Number.isFinite(r)){
    setDisplay("Erro");
    setMini("Divisão por zero");
    current = "0";
    acc = null;
    op = null;
    justEvaluated = true;
    return;
  }

  setMini(`${trimNumber(acc)} ${op} ${trimNumber(n)} =`);
  acc = null;
  op = null;
  current = trimNumber(r);
  setDisplay(current);
  justEvaluated = true;
}

function backspace(){
  if (justEvaluated) return;
  if (current.length <= 1) current = "0";
  else current = current.slice(0, -1);
  setDisplay(current);
}

function sqrtCurrent(){
  const n = Number(current);
  if (!Number.isFinite(n)) return;
  if (n < 0){
    setMini("Erro: raiz negativa");
    setDisplay("Erro");
    justEvaluated = true;
    return;
  }
  current = trimNumber(Math.sqrt(n));
  setDisplay(current);
}

/* ========= CLICK HANDLERS ========= */
document.querySelectorAll(".key").forEach(btn => {
  btn.addEventListener("click", () => handleKey(btn.dataset.k));
});

function handleKey(k){
  if (!k) return;

  if (k >= "0" && k <= "9") return inputDigit(k);
  if (k === ".") return inputDot();
  if (k === "AC") return resetAll();
  if (k === "DEL") return backspace();
  if (k === "%") return applyPercent();
  if (k === "SQRT") return sqrtCurrent();

  if (k === "+" || k === "-" || k === "*" || k === "/") return chooseOp(k);
  if (k === "=") return evaluate();
}

/* ========= KEYBOARD SUPPORT ========= */
window.addEventListener("keydown", (e) => {
  const k = e.key;

  if (k >= "0" && k <= "9") return handleKey(k);
  if (k === ".") return handleKey(".");
  if (k === "Enter") { e.preventDefault(); return handleKey("="); }
  if (k === "Backspace") return handleKey("DEL");
  if (k === "Escape") return handleKey("AC");
  if (k === "+" || k === "-" || k === "*" || k === "/") return handleKey(k);
});

/* ========= APPS EXTRAS ========= */
clearLog.addEventListener("click", () => logEl.textContent = "");

document.querySelectorAll("[data-app]").forEach(btn => {
  btn.addEventListener("click", () => {
    const app = btn.dataset.app;
    if (app === "temp") return appTemperatura();
    if (app === "geo") return appGeometria();
    if (app === "disc") return appDesconto();
    if (app === "money") return appMoedas();
    if (app === "pass") return appSenha();
  });
});

function r2(x){ return Math.round((x + Number.EPSILON) * 100) / 100; }

/* ========= TEMPERATURA APP ========= */
function appTemperatura(){
  showApp(`
    <h3 style="margin-top: 0; margin-bottom: 20px;">Conversor de Temperatura</h3>
    <div class="appInputGroup">
      <label class="appLabel">Valor:</label>
      <input id="tempValue" type="number" class="appInput" placeholder="Ex: 32" step="any">
    </div>
    <div class="appInputGroup">
      <label class="appLabel">De:</label>
      <select id="tempFrom" class="appSelect">
        <option value="C">Celsius (°C)</option>
        <option value="F">Fahrenheit (°F)</option>
        <option value="K">Kelvin (K)</option>
      </select>
    </div>
    <div class="appInputGroup">
      <label class="appLabel">Para:</label>
      <select id="tempTo" class="appSelect">
        <option value="C">Celsius (°C)</option>
        <option value="F">Fahrenheit (°F)</option>
        <option value="K">Kelvin (K)</option>
      </select>
    </div>
    <div class="appButtons">
      <button class="appBtn" onclick="closeAppPanel()">Cancelar</button>
      <button class="appBtn primary" onclick="calcTemperatura()">Converter</button>
    </div>
  `);
}

function calcTemperatura(){
  const valor = Number(document.querySelector("#tempValue").value);
  const de = document.querySelector("#tempFrom").value;
  const para = document.querySelector("#tempTo").value;

  if (!Number.isFinite(valor)) {
    alert("Valor inválido!");
    return;
  }

  const conv = {
    "C_F": v => (v * 9/5) + 32,
    "F_C": v => (v - 32) * 5/9,
    "C_K": v => v + 273.15,
    "K_C": v => v - 273.15,
    "F_K": v => (v - 32) * 5/9 + 273.15,
    "K_F": v => (v - 273.15) * 9/5 + 32,
  };

  const key = `${de}_${para}`;
  let res = (de === para) ? valor : (conv[key] ? conv[key](valor) : null);
  if (res === null) { alert("Conversão inválida."); return; }

  res = r2(res);
  const simbolos = { C: "°C", F: "°F", K: "K" };
  log(`[Temperatura] ${valor} ${simbolos[de]} → ${res} ${simbolos[para]}`);
  setDisplay(String(res));
  closeAppPanel();
}

/* ========= GEOMETRIA APP ========= */
function appGeometria(){
  showApp(`
    <h3 style="margin-top: 0; margin-bottom: 20px;">Calculadora de Geometria</h3>
    <div class="appInputGroup">
      <label class="appLabel">Forma:</label>
      <select id="geoShape" class="appSelect" onchange="updateGeoForm()">
        <option value="square">Quadrado</option>
        <option value="rect">Retângulo</option>
        <option value="circle">Círculo</option>
        <option value="triangle">Triângulo</option>
      </select>
    </div>
    <div id="geoInputs"></div>
    <div class="appButtons">
      <button class="appBtn" onclick="closeAppPanel()">Cancelar</button>
      <button class="appBtn primary" onclick="calcGeometria()">Calcular</button>
    </div>
  `);
  updateGeoForm();
}

function updateGeoForm(){
  const shape = document.querySelector("#geoShape").value;
  const geoInputs = document.querySelector("#geoInputs");
  
  let html = "";
  if (shape === "square") {
    html = `<div class="appInputGroup"><label class="appLabel">Lado:</label><input id="geoL1" type="number" class="appInput" placeholder="0" step="any"></div>`;
  } else if (shape === "rect") {
    html = `<div class="appInputGroup"><label class="appLabel">Largura:</label><input id="geoL1" type="number" class="appInput" placeholder="0" step="any"></div>
            <div class="appInputGroup"><label class="appLabel">Altura:</label><input id="geoL2" type="number" class="appInput" placeholder="0" step="any"></div>`;
  } else if (shape === "circle") {
    html = `<div class="appInputGroup"><label class="appLabel">Raio:</label><input id="geoL1" type="number" class="appInput" placeholder="0" step="any"></div>`;
  } else if (shape === "triangle") {
    html = `<div class="appInputGroup"><label class="appLabel">Base:</label><input id="geoL1" type="number" class="appInput" placeholder="0" step="any"></div>
            <div class="appInputGroup"><label class="appLabel">Altura:</label><input id="geoL2" type="number" class="appInput" placeholder="0" step="any"></div>
            <div class="appInputGroup"><label class="appLabel">Lado 1:</label><input id="geoL3" type="number" class="appInput" placeholder="0" step="any"></div>
            <div class="appInputGroup"><label class="appLabel">Lado 2:</label><input id="geoL4" type="number" class="appInput" placeholder="0" step="any"></div>
            <div class="appInputGroup"><label class="appLabel">Lado 3:</label><input id="geoL5" type="number" class="appInput" placeholder="0" step="any"></div>`;
  }
  geoInputs.innerHTML = html;
}

function calcGeometria(){
  const shape = document.querySelector("#geoShape").value;
  let area = 0, per = 0, label = "";

  if (shape === "square") {
    const l = Number(document.querySelector("#geoL1").value);
    if (!Number.isFinite(l)) { alert("Valor inválido!"); return; }
    area = l * l; per = 4 * l;
    label = "Quadrado";
  } else if (shape === "rect") {
    const w = Number(document.querySelector("#geoL1").value);
    const h = Number(document.querySelector("#geoL2").value);
    if (!Number.isFinite(w) || !Number.isFinite(h)) { alert("Valor inválido!"); return; }
    area = w * h; per = 2 * (w + h);
    label = "Retângulo";
  } else if (shape === "circle") {
    const r = Number(document.querySelector("#geoL1").value);
    if (!Number.isFinite(r)) { alert("Valor inválido!"); return; }
    area = Math.PI * (r * r); per = 2 * Math.PI * r;
    label = "Círculo";
  } else if (shape === "triangle") {
    const b = Number(document.querySelector("#geoL1").value);
    const h = Number(document.querySelector("#geoL2").value);
    const l1 = Number(document.querySelector("#geoL3").value);
    const l2 = Number(document.querySelector("#geoL4").value);
    const l3 = Number(document.querySelector("#geoL5").value);
    if (![b,h,l1,l2,l3].every(x => Number.isFinite(x))) { alert("Valor inválido!"); return; }
    area = (b * h) / 2; per = l1 + l2 + l3;
    label = "Triângulo";
  }

  log(`[Geometria] ${label} | Área ${r2(area)} | Perímetro ${r2(per)}`);
  setDisplay(`${r2(area)}`);
  closeAppPanel();
}

/* ========= DESCONTO APP ========= */
function appDesconto(){
  showApp(`
    <h3 style="margin-top: 0; margin-bottom: 20px;">Calculadora de Desconto</h3>
    <div class="appInputGroup">
      <label class="appLabel">Preço (R$):</label>
      <input id="discPrice" type="number" class="appInput" placeholder="0.00" step="any">
    </div>
    <div class="appInputGroup">
      <label class="appLabel">Desconto (%):</label>
      <input id="discPercent" type="number" class="appInput" placeholder="0" step="any">
    </div>
    <div class="appButtons">
      <button class="appBtn" onclick="closeAppPanel()">Cancelar</button>
      <button class="appBtn primary" onclick="calcDesconto()">Calcular</button>
    </div>
  `);
}

function calcDesconto(){
  const preco = Number(document.querySelector("#discPrice").value);
  const perc = Number(document.querySelector("#discPercent").value);
  
  if (!Number.isFinite(preco) || !Number.isFinite(perc)) { alert("Valor inválido!"); return; }
  
  const desc = preco * (perc / 100);
  const final = preco - desc;

  log(`[Desconto] R$${r2(preco)} - ${r2(perc)}% = Desconto R$${r2(desc)} | Final R$${r2(final)}`);
  setDisplay(`${r2(final)}`);
  closeAppPanel();
}

/* ========= MOEDAS APP ========= */
function appMoedas(){
  showApp(`
    <h3 style="margin-top: 0; margin-bottom: 20px;">Conversor de Moedas</h3>
    <div class="appInputGroup">
      <label class="appLabel">Valor:</label>
      <input id="moneyValue" type="number" class="appInput" placeholder="0.00" step="any">
    </div>
    <div class="appInputGroup">
      <label class="appLabel">Taxa de Câmbio:</label>
      <input id="moneyRate" type="number" class="appInput" placeholder="Ex: 5.10" step="any">
    </div>
    <div class="appInputGroup">
      <label class="appLabel">Moeda Destino:</label>
      <select id="moneyCurr" class="appSelect">
        <option value="USD">USD (Dólar)</option>
        <option value="EUR">EUR (Euro)</option>
        <option value="GBP">GBP (Libra)</option>
        <option value="JPY">JPY (Iene)</option>
      </select>
    </div>
    <div class="appButtons">
      <button class="appBtn" onclick="closeAppPanel()">Cancelar</button>
      <button class="appBtn primary" onclick="calcMoedas()">Converter</button>
    </div>
  `);
}

function calcMoedas(){
  const valor = Number(document.querySelector("#moneyValue").value);
  const taxa = Number(document.querySelector("#moneyRate").value);
  const moeda = document.querySelector("#moneyCurr").value;
  
  if (!Number.isFinite(valor) || !Number.isFinite(taxa)) { alert("Valor inválido!"); return; }
  
  const res = valor * taxa;
  log(`[Moedas] ${r2(valor)} → ${r2(res)} ${moeda} (taxa ${taxa})`);
  setDisplay(`${r2(res)}`);
  closeAppPanel();
}

/* ========= SENHA APP ========= */
function appSenha(){
  showApp(`
    <h3 style="margin-top: 0; margin-bottom: 20px;">Gerador de Senha</h3>
    <div class="appInputGroup">
      <label class="appLabel">Tamanho (4 a 128):</label>
      <input id="passSize" type="number" class="appInput" placeholder="16" value="16" min="4" max="128">
    </div>
    <div id="passDisplay" style="margin-top: 16px; padding: 12px; background: rgba(255,255,255,.03); border: 1px solid var(--line); border-radius: 12px; text-align: center; font-family: monospace; font-weight: bold; word-break: break-all; min-height: 40px;"></div>
    <div class="appButtons">
      <button class="appBtn" onclick="closeAppPanel()">Cancelar</button>
      <button class="appBtn primary" onclick="gerarSenha()">Gerar</button>
    </div>
  `);
  gerarSenha();
}

function gerarSenha(){
  const t = Number(document.querySelector("#passSize").value);
  const n = Math.floor(t);
  if (n < 4 || n > 128) { alert("Escolha entre 4 e 128."); return; }

  const letras = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const simb = "!@#$%^&*()_+-=[]{};:,.<>/?|~";
  const all = letras + nums + simb;

  const arr = [
    letras[Math.floor(Math.random()*letras.length)],
    nums[Math.floor(Math.random()*nums.length)],
    simb[Math.floor(Math.random()*simb.length)],
  ];
  while (arr.length < n) arr.push(all[Math.floor(Math.random()*all.length)]);
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const senha = arr.join("");

  document.querySelector("#passDisplay").textContent = senha;
  log(`[Senha] Gerada (${n} chars)`);
  setDisplay(senha);
}

/* ========= NOME DO USUÁRIO ========= */
welcome.textContent = "";

resetAll();