import React, { useEffect, useState } from "react";
import Link from 'next/link';
import styles from "../styles/components/projectCard.module.css";
import { useApiFetch } from "../utils/api";
import { getUser } from "../utils/auth";

export default function ProjectCard({ project, onLike, onSave, onDelete }) {
  const [likedAnimation, setLikedAnimation] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(project?.comments_count || 0);
  const [commentError, setCommentError] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const currentUser = getUser();
  const ownerUsername = project?.user?.username || project?.author?.username || project?.username || null;
  const isOwnProject = currentUser && ownerUsername === currentUser;

  const image = project?.image_url || "/img/logoaba.png";
  const avatar =
    project?.user?.avatar_url ||
    project?.author?.avatar_url ||
    "/img/logoaba.png";

  const username =
    project?.user?.username ||
    project?.author?.username ||
    project?.username ||
    "Usuário";

  const displayName =
    project?.user?.full_name ||
    project?.author?.full_name ||
    username;

  const api = useApiFetch();

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
      const data = await api(`/projects/${project.id}/comments`);
      const list = Array.isArray(data) ? data : [];
      setComments(list);
      setCommentsCount(list.length || project?.comments_count || 0);
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
    if (sendingComment) return;

    const content = commentText.trim();

    setCommentError("");

    if (!content) return;

    try {
      setSendingComment(true);
      const newComment = await api(`/projects/${project.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      setComments((prev) => [newComment, ...prev]);
      setCommentsCount((c) => Number(c || 0) + 1);
      setCommentText("");
    } catch (err) {
      console.error("Erro ao comentar:", err);
      setCommentError(err.message || "Erro ao enviar comentário.");
    } finally {
      setSendingComment(false);
    }
  }

  return (
    <>
      <article className={styles.card}>
        <header className={styles.header}>
          <div className={styles.userButton}>
            <Link href={`/profile?username=${username}`} legacyBehavior>
              <a className={styles.userLink} onClick={(e) => e.stopPropagation()}>
                <img
                  className={styles.avatar}
                  src={avatar}
                  alt={username}
                  onError={(e) => (e.currentTarget.src = "/img/logoaba.png")}
                />
              </a>
            </Link>

            <div>
              <Link href={`/profile?username=${username}`} legacyBehavior>
                <a className={styles.nameLink} onClick={(e) => e.stopPropagation()}>
                  <strong>{displayName}</strong>
                  <span>@{username}</span>
                </a>
              </Link>
            </div>
          </div>

          {isOwnProject && onDelete && (
            <div className={styles.moreMenuWrapper}>
              <button
                type="button"
                className={styles.moreButton}
                onClick={() => setShowMenu((prev) => !prev)}
              >
                •••
              </button>

              {showMenu && (
                <div className={styles.moreMenu}>
                  <button
                    type="button"
                    className={styles.deleteMenuItem}
                    onClick={() => {
                      setShowMenu(false);
                      onDelete();
                    }}
                  >
                    Excluir publicação
                  </button>
                </div>
              )}
            </div>
          )}
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
            <span>{commentsCount || comments.length || 0} comentários</span>
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
                    <strong>
                      {comment?.user?.username ? (
                        <Link href={`/profile?username=${comment.user.username}`} legacyBehavior>
                          <a className={styles.commentAuthorLink} onClick={(e) => e.stopPropagation()}>
                            @{comment.user.username}
                          </a>
                        </Link>
                      ) : (
                        comment?.user?.full_name || "Usuário"
                      )}
                    </strong>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.commentModalForm}>
              {commentError && (
                <p className={styles.commentError}>{commentError}</p>
              )}
              <input
                type="text"
                placeholder="Adicione um comentário..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendComment();
                  }
                }}
              />

              <button
                type="button"
                onClick={sendComment}
                disabled={sendingComment || !commentText.trim()}
              >
                {sendingComment ? "Enviando..." : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
