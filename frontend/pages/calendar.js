import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/calendar.module.css';
import { useApiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';
import {
  GUIDELINE_MESSAGE,
  validateSafeImageUrl,
  validateSafeText,
  validateSafeUrl,
} from '../utils/contentSafety';

function toDateTimeLocal(date) {
  const pad = (value) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getInitialScheduleDate() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return toDateTimeLocal(date);
}

function getMonthDays(currentDate) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  return cells;
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  useAuthGuard();

  const router = useRouter();
  const api = useApiFetch();
  const [scheduledProjects, setScheduledProjects] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'desenvolvimento',
    tags: '',
    image_url: '',
    link: '',
    scheduled_at: getInitialScheduleDate(),
  });

  const categories = ['design', 'desenvolvimento', 'marketing', 'fotografia', 'arte', 'outro'];
  const monthCells = useMemo(() => getMonthDays(currentMonth), [currentMonth]);

  const projectsByDate = useMemo(() => {
    return scheduledProjects.reduce((acc, project) => {
      if (!project.scheduled_at) return acc;

      const key = getDateKey(new Date(project.scheduled_at));
      acc[key] = acc[key] || [];
      acc[key].push(project);
      return acc;
    }, {});
  }, [scheduledProjects]);

  useEffect(() => {
    loadScheduledProjects();
  }, []);

  async function loadScheduledProjects() {
    try {
      setLoading(true);
      const data = await api('/projects/scheduled');
      setScheduledProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (formData.title.trim().length < 3) {
      return 'O titulo precisa ter pelo menos 3 caracteres.';
    }

    if (formData.description.trim().length < 10) {
      return 'A descricao precisa ter pelo menos 10 caracteres.';
    }

    const scheduledDate = new Date(formData.scheduled_at);
    if (!formData.scheduled_at || Number.isNaN(scheduledDate.getTime())) {
      return 'Escolha uma data e horario validos.';
    }

    if (scheduledDate <= new Date()) {
      return 'Escolha uma data futura para programar a publicacao.';
    }

    const safetyChecks = [
      validateSafeText(formData.title, 'titulo'),
      validateSafeText(formData.description, 'descricao'),
      validateSafeText(formData.category, 'categoria'),
      validateSafeText(formData.tags, 'tags'),
      validateSafeImageUrl(formData.image_url, 'URL da imagem'),
      validateSafeUrl(formData.link, 'Link do projeto'),
    ].filter(Boolean);

    return safetyChecks[0] || '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSuccess('');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      await api('/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          title: formData.title.trim(),
          description: formData.description.trim(),
          scheduled_at: new Date(formData.scheduled_at).toISOString(),
          tags: formData.tags
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean),
        }),
      });

      setSuccess('Publicacao programada com sucesso.');
      setFormData((prev) => ({
        ...prev,
        title: '',
        description: '',
        tags: '',
        image_url: '',
        link: '',
        scheduled_at: getInitialScheduleDate(),
      }));
      await loadScheduledProjects();
    } catch (err) {
      setError(err.message || 'Erro ao programar publicacao.');
    } finally {
      setSaving(false);
    }
  }

  function changeMonth(offset) {
    setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.calendarPage}>
          <section className={styles.headerPanel}>
            <div>
              <h1>Programar publicação</h1>
              <p>Escolha data e horario para publicar automaticamente no feed.</p>
            </div>

            <button type="button" onClick={() => router.push('/profile')}>
              Voltar ao perfil
            </button>
          </section>

          <div className={styles.grid}>
            <section className={styles.panel}>
              <div className={styles.monthHeader}>
                <button type="button" onClick={() => changeMonth(-1)}>‹</button>
                <h2>
                  {currentMonth.toLocaleDateString('pt-BR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h2>
                <button type="button" onClick={() => changeMonth(1)}>›</button>
              </div>

              <div className={styles.weekDays}>
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>

              <div className={styles.monthGrid}>
                {monthCells.map((date, index) => {
                  const key = date ? getDateKey(date) : `empty-${index}`;
                  const dayProjects = date ? projectsByDate[key] || [] : [];

                  return (
                    <div key={key} className={`${styles.dayCell} ${!date ? styles.emptyDay : ''}`}>
                      {date && (
                        <>
                          <strong>{date.getDate()}</strong>
                          {dayProjects.slice(0, 3).map((project) => (
                            <span key={project.id} title={project.title}>
                              {project.title}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={styles.panel}>
              <h2>Nova publicação agendada</h2>
              <div className={styles.guidelines}>{GUIDELINE_MESSAGE}</div>

              {error && <div className={styles.error}>{error}</div>}
              {success && <div className={styles.success}>{success}</div>}

              <form className={styles.form} onSubmit={handleSubmit}>
                <label>
                  <span>Data e horario</span>
                  <input
                    type="datetime-local"
                    name="scheduled_at"
                    value={formData.scheduled_at}
                    min={toDateTimeLocal(new Date())}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  <span>Titulo</span>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Ex: Novo portfolio"
                    required
                  />
                </label>

                <label>
                  <span>Descricao</span>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Explique o projeto..."
                    rows="5"
                    required
                  />
                </label>

                <div className={styles.formRow}>
                  <label>
                    <span>Categoria</span>
                    <select name="category" value={formData.category} onChange={handleChange}>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Tags</span>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="react, design"
                    />
                  </label>
                </div>

                <label>
                  <span>URL da imagem</span>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleChange}
                    placeholder="https://site.com/imagem.png"
                  />
                </label>

                <label>
                  <span>Link do projeto</span>
                  <input
                    type="url"
                    name="link"
                    value={formData.link}
                    onChange={handleChange}
                    placeholder="https://github.com/seu-projeto"
                  />
                </label>

                <button type="submit" disabled={saving}>
                  {saving ? 'Programando...' : 'Programar publicação'}
                </button>
              </form>
            </section>
          </div>

          <section className={styles.panel}>
            <h2>Agendamentos</h2>

            {loading && <div className={styles.emptyState}>Carregando agendamentos...</div>}

            {!loading && !scheduledProjects.length && (
              <div className={styles.emptyState}>Nenhuma publicação programada ainda.</div>
            )}

            {!loading && scheduledProjects.length > 0 && (
              <div className={styles.scheduleList}>
                {scheduledProjects.map((project) => (
                  <article key={project.id} className={styles.scheduleItem}>
                    <div>
                      <strong>{project.title}</strong>
                      <span>
                        {new Date(project.scheduled_at).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <em>{project.is_scheduled ? 'Agendado' : 'Publicado'}</em>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
