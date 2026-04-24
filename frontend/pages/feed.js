
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

  const loadFeed = async () => {
    try {
      setLoading(true);
      // Carregar projetos do feed (dos usuários que você segue)
      const projectsData = await apiFetch('/projects/feed');
      setProjects(projectsData);

      // Carregar stories
      const storiesData = await apiFetch('/stories/feed');
      setStories(storiesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.feed}>
          <StoryBar stories={stories} />

          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : projects.length === 0 ? (
            <div className={styles.empty}>
              <p>Nenhum projeto para exibir. Comece a seguir usuários!</p>
            </div>
          ) : (
            <div className={styles.posts}>
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
