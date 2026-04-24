import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import UserCard from '../components/UserCard';
import styles from '../styles/pages/explore.module.css';
import { apiFetch } from '../utils/api';

export default function Explore() {
  const router = useRouter();
  const { search } = router.query;
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'design', 'desenvolvimento', 'marketing', 'fotografia', 'arte'];

  useEffect(() => {
    loadExplore();
  }, [search, selectedCategory]);

  const loadExplore = async () => {
    try {
      setLoading(true);
      let projectsData = [];
      let usersData = [];

      if (search) {
        projectsData = await apiFetch(`/projects/search?q=${encodeURIComponent(search)}`);
        usersData = await apiFetch(`/users/search?q=${encodeURIComponent(search)}`);
      } else if (selectedCategory !== 'all') {
        projectsData = await apiFetch(`/projects/category/${selectedCategory}`);
      } else {
        projectsData = await apiFetch('/projects/explore');
      }

      setProjects(projectsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Erro ao carregar explore:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.explore}>
          <div className={styles.filterBar}>
            <div className={styles.tabs}>
              <button
                className={filter === 'projects' ? styles.active : ''}
                onClick={() => setFilter('projects')}
              >
                Projetos
              </button>
              <button
                className={filter === 'users' ? styles.active : ''}
                onClick={() => setFilter('users')}
              >
                Usuários
              </button>
            </div>

            {!search && (
              <div className={styles.categories}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    className={selectedCategory === cat ? styles.active : ''}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'Tudo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : (
            <div className={styles.content}>
              {filter === 'projects' && (
                <div className={styles.grid}>
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}

              {filter === 'users' && (
                <div className={styles.usersList}>
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
