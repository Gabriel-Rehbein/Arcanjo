import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import FooterNav from '../components/FooterNav';
import { getUser, getToken } from '../utils/auth';
import { useRouter } from 'next/router';
import { apiFetch } from '../utils/api';
import styles from '../styles/pages/dashboard.module.css';

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUserName] = useState('');
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      router.replace('/');
      return;
    }

    const loggedUser = getUser();

    if (!loggedUser) {
      router.replace('/');
      return;
    }

    setUserName(loggedUser);
    loadProfile(loggedUser);
  }, [router]);

  async function loadProfile(username) {
    try {
      setLoading(true);
      setError('');

      const [profileData, projectsData] = await Promise.all([
        apiFetch(`/users/${username}`),
        apiFetch(`/users/${username}/projects`),
      ]);

      setProfile(profileData);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dashboard.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title="Dashboard">
      <div className={styles.profileShell}>
        <section className={styles.profileCard}>
          <div className={styles.profileBanner} />

          <div className={styles.profileBody}>
            {loading && <div className={styles.emptyState}>Carregando dados...</div>}

            {!loading && error && (
              <div className={styles.emptyState}>
                <p>{error}</p>
                <button type="button" onClick={() => loadProfile(user)}>
                  Tentar novamente
                </button>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className={styles.profileMain}>
                  <img
                    className={styles.avatar}
                    src={profile?.avatar_url || 'https://via.placeholder.com/150x150.png?text=Avatar'}
                    alt={profile?.username || user}
                  />

                  <div className={styles.profileInfo}>
                    <h2>{profile?.full_name || profile?.username || user}</h2>
                    <p>
                      {profile?.bio ||
                        'Bem-vindo ao seu espaço pessoal no Arcanjo. Veja seus projetos, estatísticas e navegue pelo app.'}
                    </p>
                  </div>

                  <div className={styles.profileActions}>
                    <button
                      className={styles.profileAction}
                      type="button"
                      onClick={() => router.push('/feed')}
                    >
                      Ver Feed
                    </button>

                    <button
                      className={styles.profileAction}
                      type="button"
                      onClick={() => router.push('/create-project')}
                    >
                      Novo Projeto
                    </button>
                  </div>
                </div>

                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <strong>{projects.length}</strong>
                    <span>Projetos</span>
                  </div>

                  <div className={styles.statCard}>
                    <strong>{profile?.followers_count || 0}</strong>
                    <span>Seguidores</span>
                  </div>

                  <div className={styles.statCard}>
                    <strong>{profile?.following_count || 0}</strong>
                    <span>Seguindo</span>
                  </div>
                </div>

                <div className={styles.projectPreview}>
                  <div className={styles.sectionHeader}>
                    <h3>Seus projetos recentes</h3>
                    <button type="button" onClick={() => router.push('/profile')}>
                      Ver perfil
                    </button>
                  </div>

                  {projects.length ? (
                    <div className={styles.previewGrid}>
                      {projects.slice(0, 4).map((project) => (
                        <div key={project.id} className={styles.previewCard}>
                          {project.image_url ? (
                            <img src={project.image_url} alt={project.title} />
                          ) : (
                            <div className={styles.emptyState}>Sem imagem</div>
                          )}

                          <div className={styles.previewCardContent}>
                            <h4>{project.title || 'Projeto sem título'}</h4>
                            <p>{project.description || 'Descrição ainda não adicionada.'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      Você ainda não tem projetos publicados.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <div className="card">
          <div className="nav-grid">
            {[
              { href: '/feed', label: 'Feed' },
              { href: '/profile', label: 'Perfil' },
              { href: '/explore', label: 'Explorar' },
              { href: '/trending', label: 'Tendências' },
              { href: '/messages', label: 'Mensagens' },
              { href: '/settings', label: 'Configurações' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="nav-card">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <FooterNav />
    </Layout>
  );
}