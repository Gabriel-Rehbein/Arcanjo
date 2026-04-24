
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/profile.module.css';
import { apiFetch } from '../utils/api';
import { getUser } from '../utils/auth';

export default function Profile() {
  const router = useRouter();
  const { username } = router.query;
  const [profileUsername, setProfileUsername] = useState(null);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    const targetUsername = username || currentUser;

    if (!targetUsername) {
      router.replace('/login');
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

  const loadProfile = async (targetUsername) => {
    try {
      const userData = await apiFetch(`/users/${targetUsername}`);
      setUser(userData);

      const projectsData = await apiFetch(`/users/${targetUsername}/projects`);
      setProjects(projectsData);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await apiFetch(`/users/${user.id}/unfollow`, { method: 'POST' });
      } else {
        await apiFetch(`/users/${user.id}/follow`, { method: 'POST' });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Erro ao seguir/deseguir:', err);
    }
  };

  if (loading) return <div>Carregando...</div>;
  if (!user) return <div>Usuário não encontrado</div>;

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.profile}>
          {/* Banner */}
          <div className={styles.banner}>
            <img src={user.banner_url || '/img/default-banner.jpg'} alt="Banner" />
          </div>

          {/* Info */}
          <div className={styles.info}>
            <div className={styles.header}>
              <img src={user.avatar_url || '/img/default-avatar.png'} alt="Avatar" className={styles.avatar} />
              <div className={styles.userInfo}>
                <h1>{user.full_name}</h1>
                <p className={styles.username}>@{user.username}</p>
                <p className={styles.bio}>{user.bio}</p>
              </div>
              <div className={styles.actions}>
                {isOwnProfile ? (
                  <>
                    <button className={styles.btn} onClick={() => setShowEditModal(true)}>
                      ✏️ Editar Perfil
                    </button>
                    <button className={styles.btn}>⚙️ Configurações</button>
                  </>
                ) : (
                  <>
                    <button
                      className={`${styles.btn} ${isFollowing ? styles.following : ''}`}
                      onClick={handleFollow}
                    >
                      {isFollowing ? '✓ Seguindo' : '+ Seguir'}
                    </button>
                    <button className={styles.btn}>💬 Mensagem</button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
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
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={activeTab === 'projects' ? styles.active : ''}
              onClick={() => setActiveTab('projects')}
            >
              📌 Projetos
            </button>
            <button
              className={activeTab === 'gallery' ? styles.active : ''}
              onClick={() => setActiveTab('gallery')}
            >
              🖼️ Galeria
            </button>
            {isOwnProfile && (
              <button
                className={activeTab === 'saved' ? styles.active : ''}
                onClick={() => setActiveTab('saved')}
              >
                💾 Salvos
              </button>
            )}
          </div>

          {/* Content */}
          <div className={styles.content}>
            {activeTab === 'projects' && (
              <div className={styles.projectsGrid}>
                {projects.map((project) => (
                  <div key={project.id} className={styles.projectCard}>
                    {project.image_url && <img src={project.image_url} alt={project.title} />}
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
