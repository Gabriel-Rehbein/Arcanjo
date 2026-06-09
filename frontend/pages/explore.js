import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import UserCard from '../components/UserCard';
import styles from '../styles/pages/explore.module.css';
import { useApiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';
import { getUser } from '../utils/auth';
import { PUBLICATION_TYPES } from '../utils/publicationTypes';

export default function Explore() {
  useAuthGuard();

  const router = useRouter();
  const { search } = router.query;

  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('projects');
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [orderBy, setOrderBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const api = useApiFetch();

  const categories = ['all', 'design', 'desenvolvimento', 'marketing', 'fotografia', 'arte'];
  const publicationTypes = [{ value: 'all', label: 'Tudo' }, ...PUBLICATION_TYPES];

  useEffect(() => {
    setCurrentUser(getUser());
    loadExplore();
  }, [search, selectedCategory, selectedType, filter]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recentSearches');
      setRecentSearches(raw ? JSON.parse(raw) : []);
    } catch (err) {
      setRecentSearches([]);
    }
  }, [search, filter]);

  async function loadExplore() {
    try {
      setLoading(true);
      setError('');

      let projectsData = [];
      let usersData = [];

      if (search) {
        const query = encodeURIComponent(search);
        [projectsData, usersData] = await Promise.all([
          api(`/projects/search?q=${query}`),
          api(`/users/search?q=${query}`),
        ]);
      } else if (filter === 'users') {
        // show all users when on the Users tab and no search
        usersData = await api('/users');
      } else if (selectedType !== 'all') {
        projectsData = await api(`/projects/type/${selectedType}`);
      } else if (selectedCategory !== 'all') {
        projectsData = await api(`/projects/category/${selectedCategory}`);
      } else {
        projectsData = await api('/projects/explore');
      }

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar exploração.');
    } finally {
      setLoading(false);
    }
  }

  function handleUserFollow(updated) {
    // updated is { id, followers_count, following_count, is_following }
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
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
                Publicações
              </button>

              <button
                type="button"
                className={filter === 'users' ? styles.active : ''}
                onClick={() => setFilter('users')}
              >
                Usuários
              </button>
            </div>

            {filter === 'projects' && !search && (
              <div className={styles.filterGroups}>
                <div className={styles.categories}>
                  {publicationTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      className={selectedType === type.value ? styles.active : ''}
                      onClick={() => {
                        setSelectedType(type.value);
                        if (type.value !== 'all') setSelectedCategory('all');
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                <div className={styles.categories}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={selectedCategory === cat ? styles.active : ''}
                      onClick={() => {
                        setSelectedCategory(cat);
                        if (cat !== 'all') setSelectedType('all');
                      }}
                    >
                      {cat === 'all' ? 'Todas categorias' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
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
                    {sortedProjects.map((project) => {
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
                ) : (
                  <div className={styles.empty}>Nenhum projeto encontrado.</div>
                )
              )}

              {filter === 'users' && (
                <div>
                  {recentSearches && recentSearches.length > 0 && (
                    <div className={styles.recentSearches}>
                      <h3>Buscas recentes</h3>
                      <div className={styles.recentList}>
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            className={styles.recentItem}
                            onClick={() => router.push(`/explore?search=${encodeURIComponent(term)}`)}
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {users.length ? (
                    <div className={styles.usersList}>
                      {users.map((user) => (
                          <UserCard key={user.id} user={user} onFollow={handleUserFollow} />
                        ))}
                    </div>
                  ) : (
                    <div className={styles.empty}>Nenhum usuário encontrado.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
