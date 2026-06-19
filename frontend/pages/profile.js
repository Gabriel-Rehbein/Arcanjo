import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProjectCard from "../components/ProjectCard";
import styles from "../styles/pages/profile.module.css";
import { useApiFetch } from "../utils/api";
import { getUser } from "../utils/auth";
import { assetPath } from "../utils/paths";

export default function Profile({ initialProfile = null, initialProjects = [], initialUsername = null, initialViewer = null, initialError = "" }) {
  const router = useRouter();
  const { username } = router.query;

  const [profileUsername, setProfileUsername] = useState(initialUsername);
  const [user, setUserData] = useState(initialProfile);
  const [projects, setProjects] = useState(initialProjects);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(Boolean(initialProfile?.is_following));
  const [isOwnProfile, setIsOwnProfile] = useState(initialUsername === initialViewer);
  const [activeTab, setActiveTab] = useState("projects");
  const [socialLoading, setSocialLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const serverUsername = useRef(initialUsername);
  const api = useApiFetch();

  const galleryProjects = useMemo(() => {
    return projects.filter((project) => project.image_url);
  }, [projects]);

  const featuredProjects = useMemo(() => {
    const featured = projects.filter((project) => project.is_featured);

    if (featured.length) {
      return featured;
    }

    return [...projects]
      .sort((a, b) => {
        const scoreA = Number(a.likes_count || 0) + Number(a.comments_count || 0);
        const scoreB = Number(b.likes_count || 0) + Number(b.comments_count || 0);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }, [projects]);

  const recentProjects = useMemo(() => projects.slice(0, 8), [projects]);
  const profileLinks = useMemo(() => getProfileLinks(user), [user]);

  useEffect(() => {
    const currentUser = getUser();
    const targetUsername = username || currentUser;

    if (!targetUsername) {
      router.push('/feed');
      return;
    }

    setProfileUsername(targetUsername);
    setIsOwnProfile(targetUsername === currentUser);
  }, [username]);

  useEffect(() => {
    if (profileUsername) {
      if (serverUsername.current === profileUsername) {
        serverUsername.current = null;
        return;
      }
      loadProfile(profileUsername);
    }
  }, [profileUsername]);

  useEffect(() => {
    if (!profileUsername || !["followers", "following"].includes(activeTab)) {
      return;
    }

    loadSocialList(activeTab, profileUsername);
  }, [activeTab, profileUsername]);

  async function loadProfile(targetUsername) {
    try {
      setLoading(true);
      setError("");

      const [userData, projectsData] = await Promise.all([
        api(`/users/${targetUsername}`),
        api(`/users/${targetUsername}/projects`),
      ]);

      setUserData(userData);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setFollowers([]);
      setFollowing([]);
      setIsFollowing(Boolean(userData?.is_following));
    } catch (err) {
      setError(err.message || "Erro ao carregar perfil.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSocialList(type, targetUsername) {
    try {
      setSocialLoading(true);
      const data = await api(`/users/${targetUsername}/${type}`);
      const list = Array.isArray(data) ? data : [];

      if (type === "followers") {
        setFollowers(list);
      } else {
        setFollowing(list);
      }
    } catch (err) {
      console.error("Erro ao carregar lista:", err);
    } finally {
      setSocialLoading(false);
    }
  }

  async function handleFollow() {
    if (!user) return;

    try {
      const endpoint = isFollowing
        ? `/users/${user.id}/unfollow`
        : `/users/${user.id}/follow`;

      await api(endpoint, { method: "POST" });

      setIsFollowing((prev) => !prev);

      setUserData((prev) => ({
        ...prev,
        followers_count: isFollowing
          ? Math.max((prev.followers_count || 1) - 1, 0)
          : (prev.followers_count || 0) + 1,
      }));
    } catch (err) {
      console.error("Erro ao seguir/deseguir:", err);
    }
  }

  async function handleDeleteProject(projectId) {
    if (!confirm("Deseja excluir esta publicação?")) return;

    try {
      await api(`/projects/${projectId}`, {
        method: "DELETE",
      });

      setProjects((prev) => prev.filter((project) => project.id !== projectId));
    } catch (err) {
      alert(err.message || "Erro ao excluir publicação.");
    }
  }

  if (loading) {
    return <div className={styles.loading}>Carregando perfil...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => router.push("/feed")}>Voltar ao feed</button>
      </div>
    );
  }

  if (!user) {
    return <div className={styles.error}>Usuário não encontrado.</div>;
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>{`${user.full_name || user.username} - Arcanjo`}</title>
        <meta
          name="description"
          content={user.bio || `Conheca os projetos de ${user.username} no Arcanjo.`}
        />
      </Head>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.profile}>
          <section className={styles.hero}>
            <div className={styles.banner}>
              <img
                src={user.banner_url || assetPath("/img/logoaba.png")}
                alt="Banner do perfil"
              />
            </div>

            <div className={styles.info}>
              <img
                src={user.avatar_url || assetPath("/img/logoaba.png")}
                alt={user.username}
                className={styles.avatar}
                onError={(e) => (e.target.src = assetPath("/img/logoaba.png"))}
              />

              <div className={styles.userInfo}>
                <h1>{user.full_name || user.username}</h1>
                <span className={styles.username}>@{user.username}</span>

                {user.is_bot && <span className={styles.botBadge}>BOT</span>}

                {user.role && <strong className={styles.role}>{user.role}</strong>}

                {user.available_for_work && (
                  <span className={styles.workStatus}>Disponível para trabalho</span>
                )}

                <p className={styles.bio}>
                  {user.bio || "Este usuário ainda não adicionou uma bio."}
                </p>
              </div>

              {user.technologies?.length > 0 && (
                <div className={styles.techList}>
                  {user.technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>
              )}

              {profileLinks.length > 0 && (
                <div className={styles.profileLinks}>
                  {profileLinks.map((link) => (
                    <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              <div className={styles.actions}>
                {isOwnProfile ? (
                  <>
                    <button onClick={() => router.push("/edit-profile")}>
                      Editar perfil
                    </button>

                    <button onClick={() => router.push("/create-project")}>
                      Nova publicação
                    </button>

                    <button onClick={() => router.push("/calendar")}>
                      Programar publicação
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={isFollowing ? styles.following : styles.followBtn}
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Seguindo ✓" : "Seguir +"}
                    </button>

                    <button onClick={() => router.push(`/messages?user=${user.id}`)}>
                      Mensagem
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>

          <section className={styles.stats}>
            <button
              type="button"
              className={activeTab === "projects" ? styles.statActive : ""}
              onClick={() => setActiveTab("projects")}
            >
              <strong>{projects.length}</strong>
              <span>Publicações</span>
            </button>

            <button
              type="button"
              className={activeTab === "followers" ? styles.statActive : ""}
              onClick={() => setActiveTab("followers")}
            >
              <strong>{user.followers_count || 0}</strong>
              <span>Seguidores</span>
            </button>

            <button
              type="button"
              className={activeTab === "following" ? styles.statActive : ""}
              onClick={() => setActiveTab("following")}
            >
              <strong>{user.following_count || 0}</strong>
              <span>Seguindo</span>
            </button>

            <button
              type="button"
              className={activeTab === "reputation" ? styles.statActive : ""}
              onClick={() => setActiveTab("reputation")}
            >
              <strong>{user.reputation || 0}</strong>
              <span>Reputação</span>
            </button>
          </section>

          <section className={styles.profilePanels}>
            <article>
              <span>Reputação</span>
              <strong>{user.reputation || 0}</strong>
            </article>

            <article>
              <span>Selos</span>
              <div className={styles.selos}>
                {user.selos?.length ? (
                  user.selos.map((selo) => <Selo key={`${selo.symbol}-${selo.label}`} selo={selo} />)
                ) : (
                  <small>Nenhum selo ainda</small>
                )}
              </div>
            </article>
          </section>

          <nav className={styles.tabs}>
            <button
              className={activeTab === "featured" ? styles.active : ""}
              onClick={() => setActiveTab("featured")}
            >
              Destaques
            </button>

            <button
              className={activeTab === "projects" ? styles.active : ""}
              onClick={() => setActiveTab("projects")}
            >
              Publicações
            </button>

            <button
              className={activeTab === "gallery" ? styles.active : ""}
              onClick={() => setActiveTab("gallery")}
            >
              Galeria
            </button>

            <button
              className={activeTab === "followers" ? styles.active : ""}
              onClick={() => setActiveTab("followers")}
            >
              Seguidores
            </button>

            <button
              className={activeTab === "following" ? styles.active : ""}
              onClick={() => setActiveTab("following")}
            >
              Seguindo
            </button>

            <button
              className={activeTab === "reputation" ? styles.active : ""}
              onClick={() => setActiveTab("reputation")}
            >
              Reputação
            </button>

            {isOwnProfile && (
              <button onClick={() => router.push("/saved")}>
                Salvos
              </button>
            )}
          </nav>

          <section className={styles.content}>
            {activeTab === "featured" && (
              featuredProjects.length ? (
                <>
                  <h2 className={styles.sectionTitle}>Projetos em destaque</h2>
                  <div className={styles.projectsList}>
                    {featuredProjects.map((project) => (
                      <div key={project.id} className={styles.projectWrapper}>
                        <ProjectCard
                          project={project}
                          onDelete={() => handleDeleteProject(project.id)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.empty}>
                  <h3>Nenhum destaque ainda</h3>
                  <p>Projetos em destaque aparecerão aqui.</p>
                </div>
              )
            )}

            {activeTab === "projects" && (
              recentProjects.length ? (
                <>
                  <h2 className={styles.sectionTitle}>Posts recentes</h2>
                  <div className={styles.projectsList}>
                    {recentProjects.map((project) => (
                      <div key={project.id} className={styles.projectWrapper}>
                        <ProjectCard
                          project={project}
                          onDelete={() => handleDeleteProject(project.id)}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.empty}>
                  <h3>Nenhuma publicação ainda</h3>
                  <p>Ideias, protótipos e projetos aparecerão aqui.</p>
                </div>
              )
            )}

            {activeTab === "gallery" && (
              galleryProjects.length ? (
                <div className={styles.galleryGrid}>
                  {galleryProjects.map((project) => (
                    <button
                      key={project.id}
                      className={styles.galleryItem}
                      onClick={() => setActiveTab("projects")}
                    >
                      <img src={project.image_url} alt={project.title} />
                      <div>
                        <strong>{project.title}</strong>
                        <span>{project.post_type_label || project.category || "Publicação"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <h3>Galeria vazia</h3>
                  <p>Publique qualquer progresso com imagem para aparecer aqui.</p>
                </div>
              )
            )}

            {activeTab === "reputation" && (
              <div className={styles.reputationPanel}>
                <h3>Reputação</h3>
                <strong>{user.reputation || 0}</strong>
                <p>Calculada a partir de seguidores, curtidas, comentários e visualizações das publicações.</p>

                <div className={styles.selos}>
                  {user.selos?.length ? (
                    user.selos.map((selo) => <Selo key={`${selo.symbol}-${selo.label}`} selo={selo} />)
                  ) : (
                    <small>Nenhum selo ainda</small>
                  )}
                </div>
              </div>
            )}

            {activeTab === "followers" && (
              <SocialList
                users={followers}
                loading={socialLoading}
                emptyTitle="Nenhum seguidor ainda"
                emptyText="Quando alguem seguir este perfil, a pessoa aparecera aqui."
                onOpenProfile={(targetUsername) => router.push(`/profile?username=${targetUsername}`)}
              />
            )}

            {activeTab === "following" && (
              <SocialList
                users={following}
                loading={socialLoading}
                emptyTitle="Nao esta seguindo ninguem"
                emptyText="Os perfis seguidos por este usuario aparecerao aqui."
                onOpenProfile={(targetUsername) => router.push(`/profile?username=${targetUsername}`)}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function SocialList({ users, loading, emptyTitle, emptyText, onOpenProfile }) {
  if (loading) {
    return <div className={styles.empty}>Carregando lista...</div>;
  }

  if (!users.length) {
    return (
      <div className={styles.empty}>
        <h3>{emptyTitle}</h3>
        <p>{emptyText}</p>
      </div>
    );
  }

  return (
    <div className={styles.socialList}>
      {users.map((profileUser) => (
        <button
          key={profileUser.id}
          type="button"
          className={styles.socialItem}
          onClick={() => onOpenProfile(profileUser.username)}
        >
          <img
            src={profileUser.avatar_url || assetPath("/img/logoaba.png")}
            alt={profileUser.username}
            onError={(e) => (e.target.src = assetPath("/img/logoaba.png"))}
          />

          <div>
            <strong>{profileUser.full_name || profileUser.username}</strong>
            <span>@{profileUser.username}</span>
            <p>{profileUser.bio || "Usuario da rede Arcanjo."}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

function getProfileLinks(user) {
  if (!user) return [];

  return [
    { label: "GitHub", href: user.github_url },
    { label: "LinkedIn", href: user.linkedin_url },
    { label: "Portfólio", href: user.portfolio_url },
    { label: "Currículo", href: user.resume_url },
  ].filter((link) => link.href);
}

function Selo({ selo }) {
  const normalized = typeof selo === "string" ? { symbol: "◆", label: selo } : selo;

  return (
    <em>
      <span>{normalized.symbol || "◆"}</span>
      {normalized.label}
    </em>
  );
}
