import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import StoryBar from '../components/StoryBar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/feed.module.css';
import { useApiFetch } from '../utils/api';
import { getUser } from '../utils/auth';
import { useAuthGuard } from '../utils/useAuthGuard';

export default function Feed({ initialProjects = [], initialStories = [], initialUser = null, initialError = '' }) {
  useAuthGuard();

  const [projects, setProjects] = useState(initialProjects);
  const [stories, setStories] = useState(initialStories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [currentUser, setCurrentUser] = useState(initialUser);
  const api = useApiFetch();

  useEffect(() => {
    setCurrentUser((current) => current || getUser());
    loadFeed();
  }, []);

  async function loadFeed() {
    try {
      setLoading(true);
      setError('');

      const [projectsData, storiesData] = await Promise.all([
        api('/projects/feed'),
        api('/stories/feed'),
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
      await api(`/projects/${projectId}/like`, { method: 'POST' });

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
      await api(`/projects/${projectId}/save`, { method: 'POST' });

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

  async function handleDeleteProject(projectId) {
    if (!confirm('Deseja excluir esta publicação?')) return;

    try {
      await api(`/projects/${projectId}`, { method: 'DELETE' });
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
              <h3>Nenhuma publicação encontrada</h3>
              <p>Siga outros usuários ou explore novas publicações.</p>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className={styles.posts}>
              {projects.map((project) => {
                const ownerUsername = project?.user?.username || project?.author?.username || project?.username;
                const isOwnProject = currentUser && ownerUsername === currentUser;

                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onLike={() => handleLike(project.id)}
                    onSave={() => handleSave(project.id)}
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
