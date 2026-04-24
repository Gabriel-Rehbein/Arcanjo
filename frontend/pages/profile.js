import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ProjectCard from '../components/ProjectCard';
import styles from '../styles/pages/profile.module.css';
import { apiFetch } from '../utils/api';
import { getUser } from '../utils/auth';
import { useAuthGuard } from '../utils/useAuthGuard';

export default function Profile() {
  useAuthGuard();

  const router = useRouter();
  const { username } = router.query;

  const [profileUsername, setProfileUsername] = useState(null);
  const [user, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = getUser();
    const targetUsername = username || currentUser;

    if (!targetUsername) {
      router.replace('/');
      return;
    }

    setProfileUsername(targetUsername);
    setIsOwnProfile(targetUsername === currentUser);
  }, [username, router]);

  useEffect(() => {
    if (profileUsername) {
      loadProfile(profileUsername);
    }
  }, [profileUsername]);

  async function loadProfile(targetUsername) {
    try {
      setLoading(true);
      setError('');

      const [userData, projectsData] = await Promise.all([
        apiFetch(`/users/${targetUsername}`),
        apiFetch(`/users/${targetUsername}/projects`),
      ]);

      setUserData(userData);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setIsFollowing(Boolean(userData?.is_following));
    } catch (err) {
      setError(err.message || 'Erro ao carregar perfil.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFollow() {
    if (!user) return;

    try {
      const endpoint = isFollowing
        ? `/users/${user.id}/unfollow`
        : `/users/${user.id}/follow`;

      await apiFetch(endpoint, { method: 'POST' });

      setIsFollowing((prev) => !prev);

      setUserData((prev) => ({
        ...prev,
        followers_count: isFollowing
          ? Math.max((prev.followers_count || 1) - 1, 0)
          : (prev.followers_count || 0) + 1,
      }));
    } catch (err) {
      console.error('Erro ao seguir/deseguir:', err);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => router.push('/feed')}>Voltar ao feed</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <p>Usuário não encontrado.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.profile}>
          <div className={styles.banner}>
            <img
              src={user.banner_url || '/img/default-banner.jpg'}
              alt="Banner do perfil"
            />
          </div>

          <section className={styles.info}>
            <div className={styles.header}>
              <img
                src={user.avatar_url || '/img/default-avatar.png'}
                alt={user.username}
                className={styles.avatar}
              />

              <div className={styles.userInfo}>
                <h1>{user.full_name || user.username}</h1>
                <p className={styles.username}>@{user.username}</p>
                <p className={styles.bio}>
                  {user.bio || 'Este usuário ainda não adicionou uma bio.'}
                </p>
              </div>

              <div className={styles.actions}>
                {isOwnProfile ? (
                  <>
                    <button
                      className={styles.btn}
                      onClick={() => router.push('/settings')}
                    >
                      Editar Perfil
                    </button>

                    <button
                      className={styles.btn}
                      onClick={() => router.push('/create-project')}
                    >
                      Novo Projeto
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={`${styles.btn} ${
                        isFollowing ? styles.following : ''
                      }`}
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>

                    <button
                      className={styles.btn}
                      onClick={() => router.push(`/messages?user=${user.id}`)}
                    >
                      Mensagem
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <strong>{projects.length}</strong>
                <span>Projetos</span>
              </div>

              <div className={styles.stat}>
                <strong>{user.followers_count || 0}</strong>
                <span>Seguidores</span>
              </div>

              <div className={styles.stat}>
                <strong>{user.following_count || 0}</strong>
                <span>Seguindo</span>
              </div>
            </div>
          </section>

          <div className={styles.tabs}>
            <button
              className={activeTab === 'projects' ? styles.active : ''}
              onClick={() => setActiveTab('projects')}
            >
              Projetos
            </button>

            <button
              className={activeTab === 'gallery' ? styles.active : ''}
              onClick={() => setActiveTab('gallery')}
            >
              Galeria
            </button>

            {isOwnProfile && (
              <button
                className={activeTab === 'saved' ? styles.active : ''}
                onClick={() => router.push('/saved')}
              >
                Salvos
              </button>
            )}
          </div>

          <section className={styles.content}>
            {activeTab === 'projects' && projects.length > 0 && (
              <div className={styles.projectsGrid}>
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}

            {activeTab === 'projects' && projects.length === 0 && (
              <div className={styles.empty}>
                <h3>Nenhum projeto publicado</h3>
                <p>Quando houver projetos, eles aparecerão aqui.</p>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className={styles.empty}>
                <h3>Galeria em desenvolvimento</h3>
                <p>Essa área pode mostrar imagens dos projetos futuramente.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}