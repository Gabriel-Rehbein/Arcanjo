// Página de Diário do Usuário

protectRoute();

let currentUserId = null;

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Auth.getCurrentUser();
  currentUserId = Auth.getCurrentUserId();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Mostrar data de hoje
  displayTodayDate();

  // Carregar entradas do diário
  loadDiaryEntries();

  // Listener para salvar entrada
  document.getElementById('diaryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveDiaryEntry();
  });

  // Listener para contar caracteres
  document.getElementById('diaryContent').addEventListener('input', (e) => {
    document.getElementById('charCount').textContent = e.target.value.length;
  });

  // Listener para buscar
  document.getElementById('searchFilter').addEventListener('input', (e) => {
    filterEntries(e.target.value);
  });

  // Listener para compartilhar diário
  document.getElementById('shareDiaryBtn').addEventListener('click', () => {
    shareDiary();
  });
});

function displayTodayDate() {
  const today = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = today.toLocaleDateString('pt-BR', options);
  document.getElementById('todayDate').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

function saveDiaryEntry() {
  const content = document.getElementById('diaryContent').value.trim();

  if (content.length === 0) {
    alert('Por favor, escreva algo antes de salvar!');
    return;
  }

  if (content.length > 2000) {
    alert('A entrada não pode ter mais de 2000 caracteres!');
    return;
  }

  // Carregar entradas existentes
  const entriesKey = `diary_${currentUserId}`;
  let entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');

  // Criar nova entrada
  const newEntry = {
    id: Date.now().toString(),
    content: content,
    date: new Date().toISOString(),
    createdAt: new Date().toLocaleString('pt-BR')
  };

  // Adicionar no início do array
  entries.unshift(newEntry);

  // Salvar no localStorage
  localStorage.setItem(entriesKey, JSON.stringify(entries));

  // Mostrar mensagem de sucesso
  showSuccessMessage('✅ Entrada salva com sucesso!');

  // Limpar formulário
  document.getElementById('diaryForm').reset();
  document.getElementById('charCount').textContent = '0';

  // Recarregar entradas
  loadDiaryEntries();
}

function loadDiaryEntries() {
  const entriesKey = `diary_${currentUserId}`;
  const entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');

  const entriesList = document.getElementById('entriesList');

  if (entries.length === 0) {
    entriesList.innerHTML = '<div class="no-entries"><p>📝 Nenhuma entrada ainda. Comece a escrever!</p></div>';
    return;
  }

  entriesList.innerHTML = entries.map(entry => `
    <div class="entry-card">
      <div>
        <div class="entry-date">📅 ${entry.createdAt}</div>
        <div class="entry-content">${escapeHtml(entry.content)}</div>
      </div>
      <div class="entry-actions">
        <button onclick="editEntry('${entry.id}')">✏️ Editar</button>
        <button onclick="deleteEntry('${entry.id}')" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5;">🗑️ Deletar</button>
      </div>
      <div id="edit-${entry.id}" class="edit-form"></div>
    </div>
  `).join('');
}

function editEntry(entryId) {
  const entriesKey = `diary_${currentUserId}`;
  const entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');
  const entry = entries.find(e => e.id === entryId);

  if (!entry) return;

  const editForm = document.getElementById(`edit-${entryId}`);
  
  if (editForm.classList.contains('show')) {
    editForm.classList.remove('show');
    return;
  }

  editForm.innerHTML = `
    <textarea id="edit-content-${entryId}">${entry.content}</textarea>
    <div class="edit-actions">
      <button class="save" onclick="saveEditEntry('${entryId}')">💾 Salvar</button>
      <button class="cancel" onclick="cancelEdit('${entryId}')">❌ Cancelar</button>
    </div>
  `;
  editForm.classList.add('show');
}

function saveEditEntry(entryId) {
  const newContent = document.getElementById(`edit-content-${entryId}`).value.trim();

  if (newContent.length === 0) {
    alert('A entrada não pode estar vazia!');
    return;
  }

  if (newContent.length > 2000) {
    alert('A entrada não pode ter mais de 2000 caracteres!');
    return;
  }

  const entriesKey = `diary_${currentUserId}`;
  let entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');
  const entry = entries.find(e => e.id === entryId);

  if (entry) {
    entry.content = newContent;
    entry.updatedAt = new Date().toLocaleString('pt-BR');
  }

  localStorage.setItem(entriesKey, JSON.stringify(entries));
  showSuccessMessage('✅ Entrada atualizada!');
  loadDiaryEntries();
}

function cancelEdit(entryId) {
  document.getElementById(`edit-${entryId}`).classList.remove('show');
}

function deleteEntry(entryId) {
  if (!confirm('Tem certeza que deseja deletar esta entrada?')) return;

  const entriesKey = `diary_${currentUserId}`;
  let entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');
  entries = entries.filter(e => e.id !== entryId);

  localStorage.setItem(entriesKey, JSON.stringify(entries));
  showSuccessMessage('🗑️ Entrada deletada!');
  loadDiaryEntries();
}

function filterEntries(searchTerm) {
  const entriesKey = `diary_${currentUserId}`;
  const entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');
  const filteredEntries = entries.filter(entry =>
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.createdAt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const entriesList = document.getElementById('entriesList');

  if (filteredEntries.length === 0) {
    entriesList.innerHTML = '<div class="no-entries"><p>📝 Nenhuma entrada encontrada.</p></div>';
    return;
  }

  entriesList.innerHTML = filteredEntries.map(entry => `
    <div class="entry-card">
      <div>
        <div class="entry-date">📅 ${entry.createdAt}</div>
        <div class="entry-content">${escapeHtml(entry.content)}</div>
      </div>
      <div class="entry-actions">
        <button onclick="editEntry('${entry.id}')">✏️ Editar</button>
        <button onclick="deleteEntry('${entry.id}')" style="background: rgba(239, 68, 68, 0.2); color: #fca5a5;">🗑️ Deletar</button>
      </div>
      <div id="edit-${entry.id}" class="edit-form"></div>
    </div>
  `).join('');
}

function shareDiary() {
  const entriesKey = `diary_${currentUserId}`;
  const entries = JSON.parse(localStorage.getItem(entriesKey) || '[]');

  if (entries.length === 0) {
    alert('Você não tem entradas de diário para compartilhar!');
    return;
  }

  // Criar um resumo do diário
  const diaryText = entries.map(e => `[${e.createdAt}]\n${e.content}`).join('\n\n---\n\n');
  const textToCopy = `Meu Diário no Arcanjo:\n\n${diaryText}`;

  navigator.clipboard.writeText(textToCopy).then(() => {
    showSuccessMessage('📤 Diário copiado para a área de transferência!');
  }).catch(err => {
    const textarea = document.createElement('textarea');
    textarea.value = textToCopy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showSuccessMessage('📤 Diário copiado para a área de transferência!');
  });
}

function showSuccessMessage(message) {
  const successMsg = document.getElementById('successMessage');
  successMsg.textContent = message;
  successMsg.classList.add('show');
  setTimeout(() => {
    successMsg.classList.remove('show');
  }, 3000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
