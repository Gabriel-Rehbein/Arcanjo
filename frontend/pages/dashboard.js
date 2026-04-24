
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
  const [user, setUser] = useState('');
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push('/');
      return;
    }

    const loggedUser = getUser() || 'usuário';
    setUser(loggedUser);
    loadProfile(loggedUser);
  }, [router]);

  async function loadProfile(username) {
    try {
      const [profileData, projectsData] = await Promise.all([
        apiFetch(`/users/${username}`),
        apiFetch(`/users/${username}/projects`),
      ]);

      setProfile(profileData);
      setProjects(projectsData || []);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
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
            <div className={styles.profileMain}>
              <img
                className={styles.avatar}
                src={profile?.avatar_url || '/img/default-avatar.png'}
                alt={profile?.username || user}
              />
              <div className={styles.profileInfo}>
                <h2>{profile?.full_name || profile?.username || user}</h2>
                <p>{profile?.bio || 'Bem-vindo ao seu espaço pessoal no Arcanjo. Aqui você pode ver seus projetos, estatísticas e navegar pelo app.'}</p>
              </div>
              <div className={styles.profileActions}>
                <button className={styles.profileAction} type="button" onClick={() => router.push('/feed')}>
                  Ver Feed
                </button>
                <button className={styles.profileAction} type="button" onClick={() => router.push('/settings')}>
                  Configurações
                </button>
              </div>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <strong>{projects?.length || 0}</strong>
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
              <h3>Seus projetos recentes</h3>
              {loading ? (
                <div className={styles.emptyState}>Carregando projetos...</div>
              ) : projects.length ? (
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
                        <p>{project.description || 'Descrição rápida ainda não adicionada.'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>Você ainda não tem projetos publicados.</div>
              )}
            </div>
          </div>
        </section>

        <div className="card">
          <div className="nav-grid">
            {[
              { href: '/feed', label: 'Feed' },
              { href: '/dashboard', label: 'Perfil' },
              { href: '/calendar', label: 'Calendário' },
              { href: '/diary', label: 'Diário' },
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
