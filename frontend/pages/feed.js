import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StoryBar from '../components/StoryBar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/feed.module.css';
import { apiFetch } from '../utils/api';

export default function Feed() {

  const [projects, setProjects] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadFeed();
  }, []);

  async function loadFeed() {
    try {
      setLoading(true);
      setError('');

      const [projectsData, storiesData] = await Promise.all([
        apiFetch('/projects/feed'),
        apiFetch('/stories/feed'),
      ]);

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setStories(Array.isArray(storiesData) ? storiesData : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar o feed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(projectId) {
    try {
      await apiFetch(`/projects/${projectId}/like`, { method: 'POST' });

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? {
                ...project,
                is_liked: !project.is_liked,
                likes_count: project.is_liked
                  ? Math.max((project.likes_count || 1) - 1, 0)
                  : (project.likes_count || 0) + 1,
              }
            : project
        )
      );
    } catch (err) {
      console.error('Erro ao curtir:', err);
    }
  }

  async function handleSave(projectId) {
    try {
      await apiFetch(`/projects/${projectId}/save`, { method: 'POST' });

      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId
            ? { ...project, is_saved: !project.is_saved }
            : project
        )
      );
    } catch (err) {
      console.error('Erro ao salvar:', err);
    }
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.feed}>
          <StoryBar stories={stories} onStoryCreated={loadFeed} />

          {loading && <div className={styles.loading}>Carregando feed...</div>}

          {!loading && error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button onClick={loadFeed}>Tentar novamente</button>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className={styles.empty}>
              <h3>Nenhum projeto encontrado</h3>
              <p>Siga outros usuários ou explore novos projetos.</p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className={styles.posts}>
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onLike={() => handleLike(project.id)}
                  onSave={() => handleSave(project.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}