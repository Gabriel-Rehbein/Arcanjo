"use strict";

/**
 * Troca de senha com verificação da senha atual e hash SHA-256.
 * Estrutura esperada de account no LS: { id, email, passHash, profiles: [] }
 */

const LS_KEY = "gabnet_accounts";
const LS_SESSION = "gabnet_session";

const pwdForm = document.getElementById("pwdForm");
const msg = document.getElementById("pwdMsg");

pwdForm.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const current = document.getElementById("currentPwd").value;
  const np = document.getElementById("newPwd").value;
  const np2 = document.getElementById("newPwd2").value;

  if (np !== np2){ return setMsg("As senhas não coincidem.", true); }
  if (np.length < 6){ return setMsg("Use ao menos 6 caracteres.", true); }

  const session = getSession();
  if(!session) return setMsg("Sessão expirada. Faça login novamente.", true);

  const accounts = loadAccounts();
  const acc = accounts.find(a => a.id === session.accountId);
  if(!acc) return setMsg("Conta não encontrada.", true);

  // Verifica senha atual
  const currentHash = await hash(current);
  if (acc.passHash && acc.passHash !== currentHash){
    return setMsg("Senha atual incorreta.", true);
  }

  // Salva nova senha (hash)
  acc.passHash = await hash(np);
  saveAccounts(accounts);

  setMsg("Senha alterada com sucesso!", false);
  pwdForm.reset();
});

function setMsg(text, isError){
  msg.textContent = text;
  msg.style.color = isError ? "#ff9a9a" : "#6ee7ff";
}

function loadAccounts(){ try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } }
function saveAccounts(list){ localStorage.setItem(LS_KEY, JSON.stringify(list)); }
function getSession(){ try { return JSON.parse(localStorage.getItem(LS_SESSION)); } catch { return null; } }

async function hash(str){
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
