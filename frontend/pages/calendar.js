import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import CalendarView, { getDateKey } from '../components/calendar/CalendarView';
import ScheduleCard from '../components/calendar/ScheduleCard';
import ScheduleModal from '../components/calendar/ScheduleModal';
import styles from '../styles/pages/calendar.module.css';
import { useApiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';
import { validateSafeImageUrl, validateSafeUrl } from '../utils/contentSafety';
import { DEFAULT_PUBLICATION_TYPE } from '../utils/publicationTypes';

const DRAFTS_KEY = 'arcanjo_schedule_drafts';

function toDateTimeLocal(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function dateForDay(date) {
  const selected = new Date(date);
  const now = new Date();
  selected.setHours(
    selected.toDateString() === now.toDateString() ? now.getHours() + 1 : 10,
    0,
    0,
    0
  );
  return toDateTimeLocal(selected);
}

function emptyForm(date = new Date()) {
  return {
    title: '',
    description: '',
    post_type: DEFAULT_PUBLICATION_TYPE,
    category: 'desenvolvimento',
    tags: '',
    image_url: '',
    link: '',
    scheduled_at: dateForDay(date),
  };
}

function getMonthDays(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return [
    ...Array.from({ length: startOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1)),
  ];
}

function projectToForm(project) {
  return {
    title: project.title || '',
    description: project.description || '',
    post_type: project.post_type || DEFAULT_PUBLICATION_TYPE,
    category: project.category || 'desenvolvimento',
    tags: Array.isArray(project.tags) ? project.tags.join(', ') : project.tags || '',
    image_url: project.image_url || '',
    link: project.link || '',
    scheduled_at: toDateTimeLocal(new Date(project.scheduled_at)),
  };
}

function normalizeProject(project) {
  return {
    ...project,
    ui_status: project.ui_status || (project.status === 'failed' ? 'failed' : 'scheduled'),
  };
}

function readDrafts() {
  try {
    const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '[]');
    return Array.isArray(drafts) ? drafts : [];
  } catch {
    localStorage.removeItem(DRAFTS_KEY);
    return [];
  }
}

export default function CalendarPage() {
  useAuthGuard();
  const router = useRouter();
  const api = useApiFetch();
  const [projects, setProjects] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(emptyForm());

  const monthCells = useMemo(() => getMonthDays(currentMonth), [currentMonth]);
  const visibleProjects = useMemo(
    () => projects.filter((project) => filter === 'all' || project.ui_status === filter),
    [projects, filter]
  );
  const projectsByDate = useMemo(
    () =>
      visibleProjects.reduce((grouped, project) => {
        if (!project.scheduled_at) return grouped;
        const key = getDateKey(new Date(project.scheduled_at));
        grouped[key] = [...(grouped[key] || []), project];
        return grouped;
      }, {}),
    [visibleProjects]
  );
  const counters = useMemo(
    () =>
      projects.reduce(
        (result, project) => ({
          ...result,
          [project.ui_status]: (result[project.ui_status] || 0) + 1,
        }),
        {}
      ),
    [projects]
  );

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setPageError('');
      const remote = await api('/projects/scheduled');
      const drafts = readDrafts();
      setProjects([...(Array.isArray(remote) ? remote.map(normalizeProject) : []), ...drafts]);
    } catch (error) {
      setPageError(error.message || 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadProjects();
    // A API hook is intentionally read only on mount to avoid refetching while its loading context changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function persistDrafts(nextProjects) {
    localStorage.setItem(
      DRAFTS_KEY,
      JSON.stringify(nextProjects.filter((project) => project.ui_status === 'draft'))
    );
  }

  function openCreate(date) {
    setEditingProject(null);
    setFormData(emptyForm(date));
    setModalError('');
    setModalOpen(true);
  }

  function openEdit(project) {
    setEditingProject(project);
    setFormData(projectToForm(project));
    setModalError('');
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditingProject(null);
    setModalError('');
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function validateForm() {
    if (formData.title.trim().length < 3) return 'O titulo precisa ter pelo menos 3 caracteres.';
    if (formData.description.trim().length < 10)
      return 'A descricao precisa ter pelo menos 10 caracteres.';
    const scheduledAt = new Date(formData.scheduled_at);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date())
      return 'Escolha uma data futura.';
    return (
      validateSafeImageUrl(formData.image_url, 'URL da imagem') ||
      validateSafeUrl(formData.link, 'Link do projeto') ||
      ''
    );
  }

  function payloadFromForm() {
    return {
      ...formData,
      title: formData.title.trim(),
      description: formData.description.trim(),
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) return setModalError(validationError);

    const payload = payloadFromForm();
    const optimisticId = editingProject?.id || `pending-${Date.now()}`;
    const optimistic = normalizeProject({
      ...editingProject,
      ...payload,
      id: optimisticId,
      ui_status: 'scheduled',
    });
    const previous = projects;

    setProjects((current) => [
      optimistic,
      ...current.filter(
        (project) => project.id !== optimisticId && project.id !== editingProject?.id
      ),
    ]);
    setSaving(true);
    setModalError('');

    try {
      const isRemoteEdit = editingProject && !String(editingProject.id).startsWith('draft-');
      const saved = await api(
        isRemoteEdit ? `/projects/${editingProject.id}/schedule` : '/projects',
        {
          method: isRemoteEdit ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        }
      );
      const nextProjects = [
        normalizeProject(saved),
        ...previous.filter((project) => project.id !== editingProject?.id),
      ];
      setProjects(nextProjects);
      persistDrafts(nextProjects);
      setSaving(false);
      closeModal();
    } catch (error) {
      setProjects(previous);
      setModalError(error.message || 'Nao foi possivel salvar a publicacao.');
    } finally {
      setSaving(false);
    }
  }

  function saveDraft() {
    const draft = {
      ...editingProject,
      ...payloadFromForm(),
      id: editingProject?.ui_status === 'draft' ? editingProject.id : `draft-${Date.now()}`,
      ui_status: 'draft',
      status: 'draft',
    };
    const nextProjects = [
      draft,
      ...projects.filter((project) => project.id !== editingProject?.id),
    ];
    setProjects(nextProjects);
    persistDrafts(nextProjects);
    closeModal();
  }

  async function deleteProject(project) {
    if (!window.confirm(`Cancelar "${project.title}"?`)) return;
    const previous = projects;
    const nextProjects = projects.filter((item) => item.id !== project.id);
    setProjects(nextProjects);
    persistDrafts(nextProjects);

    if (project.ui_status === 'draft') return;

    try {
      await api(`/projects/${project.id}`, { method: 'DELETE' });
    } catch (error) {
      setProjects(previous);
      setPageError(error.message || 'Nao foi possivel excluir o agendamento.');
    }
  }

  async function moveProject(projectId, targetDate) {
    const project = projects.find((item) => String(item.id) === String(projectId));
    if (!project) return;
    const originalDate = project.scheduled_at;
    const nextDate = new Date(targetDate);
    const oldDate = new Date(originalDate);
    nextDate.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0);
    if (nextDate <= new Date()) return setPageError('Arraste para uma data futura.');

    setProjects((current) =>
      current.map((item) =>
        item.id === project.id ? { ...item, scheduled_at: nextDate.toISOString() } : item
      )
    );
    try {
      await api(`/projects/${project.id}/schedule`, {
        method: 'PUT',
        body: JSON.stringify({ scheduled_at: nextDate.toISOString() }),
      });
    } catch (error) {
      setProjects((current) =>
        current.map((item) =>
          item.id === project.id
            ? { ...item, scheduled_at: originalDate, ui_status: 'failed' }
            : item
        )
      );
      setPageError(error.message || 'Falha ao remarcar. A data anterior foi restaurada.');
    }
  }

  const filters = [
    { value: 'all', label: 'Todos', count: projects.length },
    { value: 'scheduled', label: 'Agendados', count: counters.scheduled || 0 },
    { value: 'draft', label: 'Rascunhos', count: counters.draft || 0 },
    { value: 'failed', label: 'Falharam', count: counters.failed || 0 },
  ];

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <main className={styles.calendarPage}>
          <section className={styles.headerPanel}>
            <div>
              <span className={styles.eyebrow}>Planejamento de conteudo</span>
              <h1>Calendario de publicacoes</h1>
              <p>Clique em um dia para criar ou arraste um card para remarcar.</p>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push('/profile')}
              >
                Voltar
              </button>
              <button type="button" onClick={() => openCreate(new Date())}>
                Nova publicacao
              </button>
            </div>
          </section>

          <section className={styles.toolbar}>
            <div className={styles.filters}>
              {filters.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={filter === item.value ? styles.activeFilter : ''}
                  onClick={() => setFilter(item.value)}
                >
                  {item.label}
                  <span>{item.count}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              className={styles.todayButton}
              onClick={() => setCurrentMonth(new Date())}
            >
              Hoje
            </button>
          </section>

          {pageError && (
            <div className={styles.error}>
              {pageError}
              <button type="button" onClick={() => setPageError('')}>
                x
              </button>
            </div>
          )}

          <section className={styles.panel}>
            <div className={styles.monthHeader}>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))
                }
              >
                ‹
              </button>
              <h2>
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </h2>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))
                }
              >
                ›
              </button>
            </div>
            {loading ? (
              <div className={styles.emptyState}>Carregando calendario...</div>
            ) : (
              <CalendarView
                cells={monthCells}
                projectsByDate={projectsByDate}
                onSelectDate={openCreate}
                onEdit={openEdit}
                onDelete={deleteProject}
                onMove={moveProject}
              />
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.sectionHeader}>
              <div>
                <h2>Proximas publicacoes</h2>
                <p>Edite ou cancele sem sair do calendario.</p>
              </div>
            </div>
            {!loading && !visibleProjects.length ? (
              <div className={styles.emptyState}>Nenhuma publicacao neste filtro.</div>
            ) : (
              <div className={styles.scheduleList}>
                {visibleProjects.slice(0, 8).map((project) => (
                  <ScheduleCard
                    key={project.id}
                    project={project}
                    onEdit={openEdit}
                    onDelete={deleteProject}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      </div>

      <ScheduleModal
        open={modalOpen}
        mode={editingProject ? 'edit' : 'create'}
        formData={formData}
        error={modalError}
        saving={saving}
        onChange={handleChange}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onSaveDraft={saveDraft}
      />
    </div>
  );
}
