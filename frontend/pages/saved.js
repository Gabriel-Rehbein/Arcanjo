import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/saved.module.css';
import { useApiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';
import { getUser } from '../utils/auth';

export default function Saved() {
  useAuthGuard();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const api = useApiFetch();

  const filters = ['all', 'design', 'desenvolvimento', 'marketing', 'fotografia', 'arte'];

  useEffect(() => {
    setCurrentUser(getUser());
    loadSavedProjects();
  }, [filter]);

  async function loadSavedProjects() {
    try {
      setLoading(true);
      setError('');

      const url = filter === 'all' ? '/projects/saved' : `/projects/saved?category=${filter}`;
      const data = await api(url);

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar publicações salvas.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProject(projectId) {
    if (!confirm('Deseja excluir esta publicação?')) return;

    try {
      await api(`/projects/${projectId}`, { method: 'DELETE' });
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      alert(err.message || 'Erro ao excluir publicação.');
    }
  }

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return projects;

    return projects.filter((project) => {
      return (
        project.title?.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term) ||
        project.category?.toLowerCase().includes(term)
      );
    });
  }, [projects, search]);

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.saved}>
          <div className={styles.header}>
            <h1>Salvos</h1>
            <p>Suas publicações favoritas para acessar depois.</p>
          </div>

          <input
            className={styles.search}
            type="text"
            placeholder="Buscar nos salvos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className={styles.categories}>
            {filters.map((cat) => (
              <button
                key={cat}
                type="button"
                className={filter === cat ? styles.active : ''}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'Tudo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading && <div className={styles.loading}>Carregando...</div>}

          {!loading && error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button type="button" onClick={loadSavedProjects}>
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && filteredProjects.length === 0 && (
            <div className={styles.empty}>
              <p>Nenhuma publicação salva encontrada.</p>
              <Link href="/explore">Explorar publicações →</Link>
            </div>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className={styles.projectsList}>
              {filteredProjects.map((project) => {
                const ownerUsername = project?.user?.username || project?.author?.username || project?.username;
                const isOwnProject = currentUser && ownerUsername === currentUser;

                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onDelete={isOwnProject ? () => handleDeleteProject(project.id) : undefined}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
