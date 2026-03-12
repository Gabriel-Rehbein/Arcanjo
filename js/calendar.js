// Página de Calendário da Semana

protectRoute();

let currentUserId = null;
let currentWeekStart = getMonday(new Date());

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = Auth.getCurrentUser();
  currentUserId = Auth.getCurrentUserId();

  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Renderizar semana
  renderWeekView();

  // Carregar tarefas
  loadTasks();

  // Listeners para navegação
  document.getElementById('prevWeekBtn').addEventListener('click', () => {
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() - 7);
    renderWeekView();
    loadTasks();
  });

  document.getElementById('nextWeekBtn').addEventListener('click', () => {
    currentWeekStart = new Date(currentWeekStart);
    currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    renderWeekView();
    loadTasks();
  });
});

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

function getWeekRange(startDate) {
  const weekRange = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekRange.push(date);
  }
  return weekRange;
}

function renderWeekView() {
  const weekRange = getWeekRange(currentWeekStart);
  const weekView = document.getElementById('weekView');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = new Date(currentWeekStart);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const isCurrentWeek = today >= weekStart && today < weekEnd;

  // Mostrar intervalo da semana
  const weekStartStr = weekRange[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  const weekEndStr = weekRange[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  document.getElementById('currentWeekDisplay').textContent = `${weekStartStr} - ${weekEndStr}`;

  weekView.innerHTML = weekRange.map(date => {
    const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    const dayNumber = date.getDate();
    const isToday = date.toDateString() === today.toDateString();

    const tasksKey = `tasks_${currentUserId}_${date.toISOString().split('T')[0]}`;
    const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;

    return `
      <div class="day-card ${isToday ? 'today' : ''}" onclick="selectDay('${date.toISOString().split('T')[0]}')">
        <div>
          <div class="day-name">${dayName.toUpperCase()}</div>
          <div class="day-number">${dayNumber}</div>
        </div>
        <div class="day-tasks">
          ${totalCount > 0 ? `<div class="task-badge">✓ ${completedCount}/${totalCount}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function selectDay(dateStr) {
  const tasksKey = `tasks_${currentUserId}_${dateStr}`;
  const date = new Date(dateStr);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = date.toLocaleDateString('pt-BR', options);

  document.querySelector('.tasks-section h3').textContent = `📝 Tarefas para ${formattedDate}`;

  // Guardar data selecionada
  localStorage.setItem(`selected_date_${currentUserId}`, dateStr);
  loadTasks();
}

function loadTasks() {
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = localStorage.getItem(`selected_date_${currentUserId}`) || today;
  const tasksKey = `tasks_${currentUserId}_${selectedDate}`;
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

  const tasksList = document.getElementById('tasksList');

  if (tasks.length === 0) {
    tasksList.innerHTML = '<div class="no-tasks"><p>✨ Sem tarefas por enquanto. Comece a adicionar!</p></div>';
    return;
  }

  tasksList.innerHTML = tasks.map((task, index) => `
    <div class="task-item ${task.completed ? 'completed' : ''}">
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button onclick="toggleTask(${index})">${task.completed ? '↩️ Desfazer' : '✓ Concluir'}</button>
        <button class="delete" onclick="deleteTask(${index})">🗑️ Deletar</button>
      </div>
    </div>
  `).join('');
}

function addTask() {
  const input = document.getElementById('taskInput');
  const taskText = input.value.trim();

  if (taskText.length === 0) {
    alert('Por favor, escreva uma tarefa!');
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = localStorage.getItem(`selected_date_${currentUserId}`) || today;
  const tasksKey = `tasks_${currentUserId}_${selectedDate}`;
  let tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

  tasks.push({
    text: taskText,
    completed: false,
    createdAt: new Date().toLocaleString('pt-BR')
  });

  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  input.value = '';

  showSuccessMessage('✅ Tarefa adicionada!');
  loadTasks();
  renderWeekView();
}

function toggleTask(index) {
  const today = new Date().toISOString().split('T')[0];
  const selectedDate = localStorage.getItem(`selected_date_${currentUserId}`) || today;
  const tasksKey = `tasks_${currentUserId}_${selectedDate}`;
  let tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

  if (tasks[index]) {
    tasks[index].completed = !tasks[index].completed;
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
    loadTasks();
    renderWeekView();
  }
}

function deleteTask(index) {
  if (!confirm('Tem certeza que deseja deletar esta tarefa?')) return;

  const today = new Date().toISOString().split('T')[0];
  const selectedDate = localStorage.getItem(`selected_date_${currentUserId}`) || today;
  const tasksKey = `tasks_${currentUserId}_${selectedDate}`;
  let tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

  tasks.splice(index, 1);
  localStorage.setItem(tasksKey, JSON.stringify(tasks));

  showSuccessMessage('🗑️ Tarefa deletada!');
  loadTasks();
  renderWeekView();
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

// Inicializar select do dia atual ao carregar
document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(`selected_date_${currentUserId}`, today);
});
