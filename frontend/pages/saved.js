import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/saved.module.css';
import { apiFetch } from '../utils/api';

export default function Saved() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const filters = ['all', 'design', 'desenvolvimento', 'marketing', 'fotografia', 'arte'];

  useEffect(() => {
    loadSavedProjects();
  }, [filter]);

  const loadSavedProjects = async () => {
    try {
      setLoading(true);
      let url = '/projects/saved';
      if (filter !== 'all') {
        url += `?category=${filter}`;
      }
      const data = await apiFetch(url);
      setProjects(data);
    } catch (err) {
      console.error('Erro ao carregar salvos:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.saved}>
          <div className={styles.header}>
            <h1>💾 Salvos</h1>
            <p>Seus projetos salvos para mais tarde</p>
          </div>

          <div className={styles.categories}>
            {filters.map(cat => (
              <button
                key={cat}
                className={filter === cat ? styles.active : ''}
                onClick={() => setFilter(cat)}
              >
                {cat === 'all' ? 'Tudo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : projects.length === 0 ? (
            <div className={styles.empty}>
              <p>Nenhum projeto salvo ainda</p>
              <a href="/explore">Explorar projetos →</a>
            </div>
          ) : (
            <div className={styles.projectsList}>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
