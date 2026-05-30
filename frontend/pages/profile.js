import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import ProjectCard from "../components/ProjectCard";
import styles from "../styles/pages/profile.module.css";
import { useApiFetch } from "../utils/api";
import { getUser } from "../utils/auth";

export default function Profile() {
  const router = useRouter();
  const { username } = router.query;

  const [profileUsername, setProfileUsername] = useState(null);
  const [user, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [socialLoading, setSocialLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const api = useApiFetch();

  const galleryProjects = useMemo(() => {
    return projects.filter((project) => project.image_url);
  }, [projects]);

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
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.profile}>
          <section className={styles.hero}>
            <div className={styles.banner}>
              <img
                src={user.banner_url || "/img/logoaba.png"}
                alt="Banner do perfil"
              />
            </div>

            <div className={styles.info}>
              <img
                src={user.avatar_url || "/img/logoaba.png"}
                alt={user.username}
                className={styles.avatar}
                onError={(e) => (e.target.src = "/img/logoaba.png")}
              />

              <div className={styles.userInfo}>
                <h1>{user.full_name || user.username}</h1>
                <span className={styles.username}>@{user.username}</span>

                <p className={styles.bio}>
                  {user.bio || "Este usuário ainda não adicionou uma bio."}
                </p>
              </div>

              <div className={styles.actions}>
                {isOwnProfile ? (
                  <>
                    <button onClick={() => router.push("/edit-profile")}>
                      Editar perfil
                    </button>

                    <button onClick={() => router.push("/create-project")}>
                      Novo projeto
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
              <span>Projetos</span>
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
          </section>

          <nav className={styles.tabs}>
            <button
              className={activeTab === "projects" ? styles.active : ""}
              onClick={() => setActiveTab("projects")}
            >
              Projetos
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

            {isOwnProfile && (
              <button onClick={() => router.push("/saved")}>
                Salvos
              </button>
            )}
          </nav>

          <section className={styles.content}>
            {activeTab === "projects" && (
              projects.length ? (
                <div className={styles.projectsList}>
                  {projects.map((project) => (
                    <div key={project.id} className={styles.projectWrapper}>
                      <ProjectCard
                        project={project}
                        onDelete={() => handleDeleteProject(project.id)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <h3>Nenhum projeto publicado</h3>
                  <p>Quando houver projetos, eles aparecerão aqui.</p>
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
                        <span>{project.category || "Projeto"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  <h3>Galeria vazia</h3>
                  <p>Publique projetos com imagem para aparecerem aqui.</p>
                </div>
              )
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
            src={profileUser.avatar_url || "/img/logoaba.png"}
            alt={profileUser.username}
            onError={(e) => (e.target.src = "/img/logoaba.png")}
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
