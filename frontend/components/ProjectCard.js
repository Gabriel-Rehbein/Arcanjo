import React, { useEffect, useState } from "react";
import styles from "../styles/components/projectCard.module.css";
import { apiFetch } from "../utils/api";

export default function ProjectCard({ project, onLike, onSave }) {
  const [likedAnimation, setLikedAnimation] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const image = project?.image_url || "/img/logoaba.png";
  const avatar =
    project?.user?.avatar_url ||
    project?.author?.avatar_url ||
    "/img/logoaba.png";

  const username =
    project?.user?.username ||
    project?.author?.username ||
    project?.username ||
    "usuario";

  async function handleLikeClick() {
    setLikedAnimation(true);
    setTimeout(() => setLikedAnimation(false), 750);

    if (onLike) {
      onLike();
    }
  }

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

  async function openComments() {
    setShowCommentsModal(true);
    await loadComments();
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

  return (
    <>
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.userButton}>
            <img
              className={styles.avatar}
              src={avatar}
              alt={username}
              onError={(e) => (e.currentTarget.src = "/img/logoaba.png")}
            />

            <div>
              <strong>{project?.user?.full_name || username}</strong>
              <span>@{username}</span>
            </div>
          </div>

          <button type="button" className={styles.moreButton}>
            •••
          </button>
        </header>

        <div className={styles.imageBox} onDoubleClick={handleLikeClick}>
          <img
            src={image}
            alt={project?.title || "Projeto"}
            onError={(e) => (e.currentTarget.src = "/img/logoaba.png")}
          />

          {likedAnimation && (
            <div className={styles.likeExplosion}>❤️</div>
          )}
        </div>

        <section className={styles.content}>
          <div className={styles.actions}>
            <div className={styles.leftActions}>
              <button
                type="button"
                className={`${styles.actionBtn} ${
                  project?.is_liked ? styles.activeLike : ""
                }`}
                onClick={handleLikeClick}
              >
                {project?.is_liked ? "❤️" : "🤍"}
              </button>

              <button
                type="button"
                className={styles.actionBtn}
                onClick={openComments}
              >
                💬
              </button>

              <button
                type="button"
                className={styles.actionBtn}
                onClick={() =>
                  navigator.clipboard.writeText(
                    project?.link || window.location.href
                  )
                }
              >
                📤
              </button>
            </div>

            <button
              type="button"
              className={`${styles.actionBtn} ${
                project?.is_saved ? styles.activeSave : ""
              }`}
              onClick={onSave}
            >
              {project?.is_saved ? "🔖" : "📑"}
            </button>
          </div>

          <div className={styles.metrics}>
            <strong>{project?.likes_count || 0} curtidas</strong>
            <span>{project?.comments_count || comments.length || 0} comentários</span>
          </div>

          <h3>{project?.title || "Projeto sem título"}</h3>

          <p className={styles.description}>
            {project?.description || "Sem descrição disponível."}
          </p>

          {project?.category && (
            <span className={styles.category}>{project.category}</span>
          )}
        </section>
      </article>

      {showCommentsModal && (
        <div
          className={styles.commentModalOverlay}
          onClick={() => setShowCommentsModal(false)}
        >
          <div
            className={styles.commentModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.commentModalHeader}>
              <h3>Comentários</h3>

              <button
                type="button"
                onClick={() => setShowCommentsModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.commentModalList}>
              {loadingComments && <p>Carregando comentários...</p>}

              {!loadingComments && comments.length === 0 && (
                <p className={styles.emptyComments}>
                  Nenhum comentário ainda.
                </p>
              )}

              {comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <img
                    src={comment?.user?.avatar_url || "/img/logoaba.png"}
                    alt="avatar"
                    onError={(e) => (e.currentTarget.src = "/img/logoaba.png")}
                  />

                  <div>
                    <strong>@{comment?.user?.username || "usuario"}</strong>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.commentModalForm}>
              <input
                type="text"
                placeholder="Adicione um comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendComment();
                }}
              />

              <button type="button" onClick={sendComment}>
                Publicar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}