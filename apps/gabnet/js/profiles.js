"use strict";

/* ====== Constantes / Storage ====== */
const LS_KEY = "gabnet_accounts";
const LS_SESSION = "gabnet_session";
const PROFILES_MAX = 5;

const grid = document.getElementById("profiles");
const tpl = document.getElementById("tpl").content;
const logoutBtn = document.getElementById("logout");
const manageBtn = document.getElementById("manageBtn");

/* Modal elements */
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");
const modalTitle = document.getElementById("modalTitle");
const form = document.getElementById("profileForm");
const nameInput = document.getElementById("name");
const avatarUrl = document.getElementById("avatarUrl");
const presetAvatars = document.getElementById("presetAvatars");
const genAvatarBtn = document.getElementById("genAvatar");
const isKids = document.getElementById("isKids");
const hasPin = document.getElementById("hasPin");
const pinField = document.getElementById("pinField");
const pinInput = document.getElementById("pin");
const cancelBtn = document.getElementById("cancelBtn");

/* Estado */
let accounts = loadAccounts();
let session = getSession();
if (!session) location.href = "login.html";
let acc = accounts.find(a => a.id === session.accountId);
if (!acc) location.href = "login.html";

let manageMode = false;
let editingProfileId = null;
let selectedAvatar = "";

/* ====== Storage helpers ====== */
function loadAccounts(){ try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } }
function saveAccounts(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }
function getSession(){ try { return JSON.parse(localStorage.getItem(LS_SESSION)); } catch { return null; } }

/* ====== UI Inicial ====== */
render();
buildAvatarPresets();

manageBtn.addEventListener("click", () => {
  manageMode = !manageMode;
  manageBtn.textContent = manageMode ? "Concluir" : "Gerenciar perfis";
  render();
});

logoutBtn.addEventListener("click", ()=>{
  localStorage.removeItem(LS_SESSION);
  localStorage.removeItem("gabnet_active_profile");
  location.href = "login.html";
});

/* ====== Render ====== */
function render(){
  grid.innerHTML = "";
  const list = acc.profiles || [];

  list.forEach(p => {
    const node = tpl.cloneNode(true);
    const art = node.querySelector(".profile");
    const img = node.querySelector(".avatar");
    const name = node.querySelector(".pname");
    const kidsBadge = node.querySelector(".kids-badge");
    const pinLock = node.querySelector(".pin-lock");
    const editBtn = node.querySelector(".edit-btn");
    const delBtn = node.querySelector(".del-btn");

    art.classList.toggle("manage", manageMode);

    img.src = p.avatar || `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(p.name)}`;
    img.alt = `Avatar de ${p.name}`;
    name.textContent = p.name;

    if (p.kids) kidsBadge.hidden = false;
    if (p.pin && String(p.pin).length === 4) pinLock.hidden = false;

    if (!manageMode) {
      art.addEventListener("click", ()=> enterProfile(p));
      art.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); enterProfile(p); }});
    } else {
      editBtn.hidden = false;
      delBtn.hidden = false;
      editBtn.addEventListener("click", (e)=>{ e.stopPropagation(); openEdit(p); });
      delBtn.addEventListener("click", (e)=>{ e.stopPropagation(); confirmDelete(p.id); });
    }

    grid.appendChild(node);
  });

  if (list.length < PROFILES_MAX){
    const add = document.createElement("article");
    add.className = "profile add";
    add.tabIndex = 0;
    add.innerHTML = `<div class="plus">＋</div><div class="pname">Adicionar perfil</div>`;
    add.addEventListener("click", ()=> openCreate());
    add.addEventListener("keydown", (e)=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); openCreate(); }});
    grid.appendChild(add);
  }
}

/* ====== Entrar no perfil (com PIN opcional) ====== */
function enterProfile(p){
  if (p.pin && String(p.pin).length === 4){
    const pin = prompt("Digite o PIN deste perfil:");
    if (pin !== String(p.pin)) { alert("PIN incorreto."); return; }
  }
  localStorage.setItem("gabnet_active_profile", JSON.stringify({ accountId: acc.id, profileId: p.id, kids: !!p.kids }));
  location.href = "home.html";
}

/* ====== Criar / Editar ====== */
function openCreate(){
  editingProfileId = null;
  modalTitle.textContent = "Novo perfil";
  form.reset();
  selectedAvatar = "";
  isKids.checked = false;
  hasPin.checked = false;
  pinField.hidden = true;
  pinInput.value = "";
  avatarUrl.value = "";
  highlightAvatar("");
  openModal();
}

function openEdit(p){
  editingProfileId = p.id;
  modalTitle.textContent = "Editar perfil";
  form.reset();
  nameInput.value = p.name || "";
  selectedAvatar = p.avatar || "";
  avatarUrl.value = p.avatar || "";
  isKids.checked = !!p.kids;
  const has = !!p.pin && String(p.pin).length === 4;
  hasPin.checked = has;
  pinField.hidden = !has;
  pinInput.value = has ? String(p.pin) : "";
  highlightAvatar(selectedAvatar);
  openModal();
}

function confirmDelete(id){
  if (!confirm("Excluir este perfil?")) return;
  acc.profiles = (acc.profiles || []).filter(x => x.id !== id);
  saveAccounts(accounts);
  render();
}

/* Form eventos */
hasPin.addEventListener("change", ()=>{
  pinField.hidden = !hasPin.checked;
  if (!hasPin.checked) pinInput.value = "";
});

genAvatarBtn.addEventListener("click", ()=>{
  const seed = nameInput.value?.trim() || `User_${Math.random().toString(36).slice(2,7)}`;
  const url = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(seed)}`;
  avatarUrl.value = url;
  selectedAvatar = url;
  highlightAvatar(selectedAvatar);
});

presetAvatars.addEventListener("click", (e)=>{
  const btn = e.target.closest(".avatar-opt");
  if(!btn) return;
  selectedAvatar = btn.dataset.src || "";
  avatarUrl.value = selectedAvatar;
  highlightAvatar(selectedAvatar);
});

cancelBtn.addEventListener("click", closeModal);
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e)=>{ if(e.target === modal) closeModal(); });

form.addEventListener("submit", (e)=>{
  e.preventDefault();
  const name = nameInput.value.trim();
  if(!name){ alert("Informe um nome."); return; }

  const avatar = (avatarUrl.value || selectedAvatar || "").trim();
  const kids = !!isKids.checked;
  let pinVal = null;
  if (hasPin.checked){
    const pv = (pinInput.value || "").trim();
    if(!/^\d{4}$/.test(pv)){ alert("O PIN deve ter 4 dígitos."); return; }
    pinVal = pv;
  }

  acc.profiles = acc.profiles || [];

  if (!editingProfileId){
    if (acc.profiles.length >= PROFILES_MAX){ alert(`Você pode ter no máximo ${PROFILES_MAX} perfis.`); return; }
    const p = { id: "p_"+Date.now(), name, avatar, kids, pin: pinVal };
    acc.profiles.push(p);
  } else {
    const idx = acc.profiles.findIndex(x => x.id === editingProfileId);
    if (idx >= 0){
      acc.profiles[idx] = { ...acc.profiles[idx], name, avatar, kids, pin: pinVal };
    }
  }

  saveAccounts(accounts);
  closeModal();
  render();
});

/* ====== Modal ====== */
function openModal(){ modal.classList.remove("hidden"); nameInput.focus(); }
function closeModal(){ modal.classList.add("hidden"); editingProfileId = null; }

/* ====== Avatares predefinidos ====== */
function buildAvatarPresets(){
  const seeds = ["Neo","Trinity","Frodo","Arwen","Batman","Totoro","WallE","DarthVader","Leia","Groot","SpiritedAway","Moana"];
  presetAvatars.innerHTML = seeds.map(s => {
    const url = `https://api.dicebear.com/8.x/thumbs/svg?seed=${encodeURIComponent(s)}`;
    return `<button type="button" class="avatar-opt" data-src="${url}" title="${s}">
              <img src="${url}" alt="${s}">
            </button>`;
  }).join("");
}

function highlightAvatar(url){
  $$(".avatar-opt").forEach(b => b.classList.toggle("selected", b.dataset.src === url));
}

/* ====== Utils ====== */
function $(s, el=document){ return el.querySelector(s); }
function $$(s, el=document){ return Array.from(el.querySelectorAll(s)); }
