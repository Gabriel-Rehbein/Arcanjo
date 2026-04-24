import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/trending.module.css';
import { apiFetch } from '../utils/api';

export default function Trending() {
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('today');
  const [loading, setLoading] = useState(true);

  const filters = [
    { value: 'today', label: '📅 Hoje' },
    { value: 'week', label: '📊 Esta Semana' },
    { value: 'month', label: '📈 Este Mês' },
    { value: 'all', label: '🔥 Todos os Tempos' },
  ];

  useEffect(() => {
    loadTrending();
  }, [filter]);

  const loadTrending = async () => {
    try {
      setLoading(true);
      const data = await apiFetch(`/projects/trending?period=${filter}`);
      setProjects(data);
    } catch (err) {
      console.error('Erro ao carregar trending:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.trending}>
          <div className={styles.header}>
            <h1>🔥 Tendências</h1>
            <p>Os projetos mais populares agora</p>
          </div>

          <div className={styles.filters}>
            {filters.map(f => (
              <button
                key={f.value}
                className={filter === f.value ? styles.active : ''}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : projects.length === 0 ? (
            <div className={styles.empty}>Nenhum projeto em tendências</div>
          ) : (
            <div className={styles.projectsList}>
              {projects.map((project, idx) => (
                <div key={project.id} className={styles.trendingItem}>
                  <div className={styles.rank}>#{idx + 1}</div>
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
