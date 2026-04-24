import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/saved.module.css';
import { apiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';

export default function Saved() {
  useAuthGuard();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const filters = ['all', 'design', 'desenvolvimento', 'marketing', 'fotografia', 'arte'];

  useEffect(() => {
    loadSavedProjects();
  }, [filter]);

  async function loadSavedProjects() {
    try {
      setLoading(true);
      setError('');

      const url = filter === 'all' ? '/projects/saved' : `/projects/saved?category=${filter}`;
      const data = await apiFetch(url);

      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar projetos salvos.');
    } finally {
      setLoading(false);
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
            <p>Seus projetos favoritos para acessar depois.</p>
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
              <p>Nenhum projeto salvo encontrado.</p>
              <a href="/explore">Explorar projetos →</a>
            </div>
          )}

          {!loading && !error && filteredProjects.length > 0 && (
            <div className={styles.projectsList}>
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}