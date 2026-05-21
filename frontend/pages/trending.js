import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/trending.module.css';
import { apiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';
import { getUser } from '../utils/auth';

export default function Trending() {
  useAuthGuard();

  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('today');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const filters = [
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'all', label: 'Todos os Tempos' },
  ];

  useEffect(() => {
    setCurrentUser(getUser());
    loadTrending();
  }, [filter]);

  async function loadTrending() {
    try {
      setLoading(true);
      setError('');

      const data = await apiFetch(`/projects/trending?period=${filter}`);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar tendências.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(projectId) {
    if (!confirm('Deseja excluir esta publicação?')) return;

    try {
      await apiFetch(`/projects/${projectId}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      alert(err.message || 'Erro ao excluir publicação.');
    }
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.trending}>
          <div className={styles.header}>
            <h1>Tendências</h1>
            <p>Os projetos com mais destaque na rede.</p>
          </div>

          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={filter === f.value ? styles.active : ''}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && <div className={styles.loading}>Carregando...</div>}

          {!loading && error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button type="button" onClick={loadTrending}>
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className={styles.empty}>Nenhum projeto em tendências.</div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className={styles.projectsList}>
              {projects.map((project, index) => {
                const ownerUsername = project?.user?.username || project?.author?.username || project?.username;
                const isOwnProject = currentUser && ownerUsername === currentUser;

                return (
                  <div key={project.id} className={styles.trendingItem}>
                    <div className={styles.rank}>#{index + 1}</div>
                    <ProjectCard
                      project={project}
                      onDelete={isOwnProject ? () => handleDeleteProject(project.id) : undefined}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}