import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import UserCard from '../components/UserCard';
import styles from '../styles/pages/explore.module.css';
import { apiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';

export default function Explore() {
  useAuthGuard();

  const router = useRouter();
  const { search } = router.query;

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('projects');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderBy, setOrderBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ['all', 'design', 'desenvolvimento', 'marketing', 'fotografia', 'arte'];

  useEffect(() => {
    loadExplore();
  }, [search, selectedCategory]);

  async function loadExplore() {
    try {
      setLoading(true);
      setError('');

      let projectsData = [];
      let usersData = [];

      if (search) {
        const query = encodeURIComponent(search);
        [projectsData, usersData] = await Promise.all([
          apiFetch(`/projects/search?q=${query}`),
          apiFetch(`/users/search?q=${query}`),
        ]);
      } else if (selectedCategory !== 'all') {
        projectsData = await apiFetch(`/projects/category/${selectedCategory}`);
      } else {
        projectsData = await apiFetch('/projects/explore');
      }

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar exploração.');
    } finally {
      setLoading(false);
    }
  }

  const sortedProjects = useMemo(() => {
    const list = [...projects];

    if (orderBy === 'popular') {
      return list.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
    }

    if (orderBy === 'comments') {
      return list.sort((a, b) => (b.comments_count || 0) - (a.comments_count || 0));
    }

    return list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [projects, orderBy]);

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.explore}>
          <div className={styles.filterBar}>
            <div className={styles.tabs}>
              <button
                type="button"
                className={filter === 'projects' ? styles.active : ''}
                onClick={() => setFilter('projects')}
              >
                Projetos
              </button>

              <button
                type="button"
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
                    type="button"
                    className={selectedCategory === cat ? styles.active : ''}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === 'all' ? 'Tudo' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {filter === 'projects' && (
              <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                <option value="recent">Mais recentes</option>
                <option value="popular">Mais curtidos</option>
                <option value="comments">Mais comentados</option>
              </select>
            )}
          </div>

          {search && (
            <div className={styles.searchInfo}>
              Resultado da busca por: <strong>{search}</strong>
            </div>
          )}

          {loading && <div className={styles.loading}>Carregando...</div>}

          {!loading && error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button type="button" onClick={loadExplore}>Tentar novamente</button>
            </div>
          )}

          {!loading && !error && (
            <div className={styles.content}>
              {filter === 'projects' && (
                sortedProjects.length ? (
                  <div className={styles.grid}>
                    {sortedProjects.map((project) => (
                      <ProjectCard key={project.id} project={project} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>Nenhum projeto encontrado.</div>
                )
              )}

              {filter === 'users' && (
                users.length ? (
                  <div className={styles.usersList}>
                    {users.map((user) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className={styles.empty}>Nenhum usuário encontrado.</div>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}