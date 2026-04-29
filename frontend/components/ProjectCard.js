import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "../styles/components/projectCard.module.css";
import { apiFetch } from "../utils/api";

export default function ProjectCard({ project, onLike, onSave }) {
  const router = useRouter();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const image = project?.image_url || "/img/logoaba.png";
  const title = project?.title || "Projeto sem título";
  const description = project?.description || "Sem descrição disponível.";

  const username =
    project?.user?.username ||
    project?.author?.username ||
    project?.username ||
    "usuario";

  const avatar =
    project?.user?.avatar_url ||
    project?.author?.avatar_url ||
    "/img/logoaba.png";

  useEffect(() => {
    if (showComments) {
      loadComments();
    }
  }, [showComments]);

  async function loadComments() {
    try {
      setLoadingComments(true);
      const data = await apiFetch(`/projects/${project.id}/comments`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoadingComments(false);
    }
  }

  async function sendComment() {
    const content = commentText.trim();

    if (!content) return;

    try {
      const newComment = await apiFetch(`/projects/${project.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch (err) {
      console.error("Erro ao comentar:", err);
    }
  }

  function handleOpenProfile() {
    router.push(`/profile?username=${username}`);
  }

  function handleOpenProject() {
    if (project?.link) {
      window.open(project.link, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <button type="button" className={styles.userButton} onClick={handleOpenProfile}>
          <img
            className={styles.avatar}
            src={avatar}
            onError={(e) => (e.target.src = "/img/logoaba.png")}
          />

          <div>
            <strong>{project?.user?.full_name || username}</strong>
            <span>@{username}</span>
          </div>
        </button>

        <button type="button" className={styles.moreButton}>
          •••
        </button>
      </header>

      <div className={styles.imageBox} onDoubleClick={onLike}>
        <img src={image} alt={title} />
      </div>

      <section className={styles.content}>
        <div className={styles.actions}>
          <div className={styles.leftActions}>
            <button
              type="button"
              className={`${styles.actionBtn} ${project?.is_liked ? styles.activeLike : ""}`}
              onClick={onLike}
            >
              {project?.is_liked ? "❤️" : "🤍"}
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => setShowComments((prev) => !prev)}
            >
              💬
            </button>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => navigator.clipboard.writeText(project?.link || window.location.href)}
            >
              📤
            </button>
          </div>

          <button
            type="button"
            className={`${styles.actionBtn} ${project?.is_saved ? styles.activeSave : ""}`}
            onClick={onSave}
          >
            {project?.is_saved ? "🔖" : "📑"}
          </button>
        </div>

        <div className={styles.metrics}>
          <strong>{project?.likes_count || 0} curtidas</strong>
          <span>{comments.length || project?.comments_count || 0} comentários</span>
        </div>

        <h3>{title}</h3>
        <p className={styles.description}>{description}</p>

        {project?.category && (
          <span className={styles.category}>{project.category}</span>
        )}

        {project?.link && (
          <div className={styles.footer}>
            <button type="button" onClick={handleOpenProject}>
              Ver projeto
            </button>

            <small>
              {project?.created_at
                ? new Date(project.created_at).toLocaleDateString("pt-BR")
                : "Publicado recentemente"}
            </small>
          </div>
        )}

        {showComments && (
          <div className={styles.commentsBox}>
            <div className={styles.commentForm}>
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendComment();
                }}
              />

              <button type="button" onClick={sendComment}>
                Enviar
              </button>
            </div>

            <div className={styles.commentsList}>
              {loadingComments && <p>Carregando comentários...</p>}

              {!loadingComments && comments.length === 0 && (
                <p className={styles.emptyComments}>Nenhum comentário ainda.</p>
              )}

              {comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <strong>@{comment?.user?.username || "usuario"}</strong>
                  <span>{comment.content}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </article>
  );
}