import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from "next/router";
import styles from "../styles/components/ProjectCard.module.css";
import { useApiFetch } from "../utils/api";
import { getToken, getUser } from "../utils/auth";
import { getPublicationTypeLabel } from "../utils/publicationTypes";
import { assetPath } from "../utils/paths";

export default function ProjectCard({ project, onLike, onSave, onDelete }) {
  const router = useRouter();
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
  const isAuthenticated = Boolean(getToken());
  const ownerUsername = project?.user?.username || project?.author?.username || project?.username || null;
  const ownerId = project?.user?.id || project?.author?.id || project?.user_id || null;
  const isOwnProject = currentUser && ownerUsername === currentUser;
  const hasOwnerActions = isOwnProject && onDelete;
  const hasVisitorActions = !isOwnProject;

  const fallbackImage = assetPath("/img/logoaba.png");
  const image = project?.image_url || fallbackImage;
  const avatar =
    project?.user?.avatar_url ||
    project?.author?.avatar_url ||
    fallbackImage;

  const username =
    project?.user?.username ||
    project?.author?.username ||
    project?.username ||
    "Usuário";

  const displayName =
    project?.user?.full_name ||
    project?.author?.full_name ||
    username;
  const postTypeLabel = project?.post_type_label || getPublicationTypeLabel(project?.post_type);

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
    setCommentError("");
    setShowCommentsModal(true);
    await loadComments();
  }

  async function openTechnicalFeedback() {
    setShowMenu(false);
    setCommentText((current) => current || "Feedback técnico: ");
    await openComments();
  }

  function openGithub() {
    if (!project?.link) return;

    setShowMenu(false);
    window.open(project.link, "_blank", "noopener,noreferrer");
  }

  function requestCollaboration() {
    setShowMenu(false);

    if (ownerId) {
      router.push(`/messages?user=${ownerId}`);
      return;
    }

    if (ownerUsername) {
      router.push(`/profile?username=${ownerUsername}`);
    }
  }

  async function sendComment() {
    if (sendingComment) return;

    const content = commentText.trim();

    setCommentError("");

    if (!content) return;

    if (!isAuthenticated) {
      setCommentError("Entre na sua conta para comentar.");
      return;
    }

    if (content.length > 500) {
      setCommentError("O comentário pode ter no máximo 500 caracteres.");
      return;
    }

    try {
      setSendingComment(true);
      const newComment = await api(`/projects/${project.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      setComments((prev) => [newComment, ...prev]);
      setCommentsCount((c) => Number(c || 0) + 1);
      setCommentText("");
      setCommentError("");
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
            <Link
              href={`/profile?username=${username}`}
              className={styles.userLink}
              onClick={(e) => e.stopPropagation()}
            >
                <img
                  className={styles.avatar}
                  src={avatar}
                  alt={username}
                  onError={(e) => (e.currentTarget.src = fallbackImage)}
                />
            </Link>

            <div>
              <Link
                href={`/profile?username=${username}`}
                className={styles.nameLink}
                onClick={(e) => e.stopPropagation()}
              >
                  <strong>{displayName}</strong>
                  <span>@{username}</span>
              </Link>
            </div>
          </div>

          {(hasOwnerActions || hasVisitorActions) && (
            <div className={styles.moreMenuWrapper}>
              <button
                type="button"
                className={styles.moreButton}
                onClick={() => setShowMenu((prev) => !prev)}
                aria-label="Mais opções"
              >
                •••
              </button>

              {showMenu && (
                <div className={styles.moreMenu}>
                  {hasOwnerActions ? (
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
                  ) : (
                    <>
                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={openGithub}
                        disabled={!project?.link}
                      >
                        Ver GitHub
                      </button>

                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={requestCollaboration}
                        disabled={!ownerId && !ownerUsername}
                      >
                        Pedir colaboração
                      </button>

                      <button
                        type="button"
                        className={styles.menuItem}
                        onClick={openTechnicalFeedback}
                      >
                        Dar feedback técnico
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </header>

        <div className={styles.imageBox} onDoubleClick={handleLikeClick}>
          <img
            src={image}
            alt={project?.title || "Projeto"}
            onError={(e) => (e.currentTarget.src = fallbackImage)}
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

          <div className={styles.metaBadges}>
            <span className={styles.postType}>{postTypeLabel}</span>

            {project?.category && (
              <span className={styles.category}>{project.category}</span>
            )}
          </div>
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
                    src={comment?.user?.avatar_url || fallbackImage}
                    alt="avatar"
                    onError={(e) => (e.currentTarget.src = fallbackImage)}
                  />

                  <div>
                    <strong>
                      {comment?.user?.username ? (
                        <Link
                          href={`/profile?username=${comment.user.username}`}
                          className={styles.commentAuthorLink}
                          onClick={(e) => e.stopPropagation()}
                        >
                            @{comment.user.username}
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
              <textarea
                placeholder="Adicione um comentário..."
                value={commentText}
                maxLength={500}
                rows={2}
                disabled={!isAuthenticated}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendComment();
                  }
                }}
              />
              <small className={styles.commentCounter}>{commentText.length}/500</small>

              {!isAuthenticated ? (
                <button type="button" onClick={() => router.push("/")}>
                  Entrar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={sendComment}
                  disabled={sendingComment || !commentText.trim()}
                >
                  {sendingComment ? "Enviando..." : "Publicar"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
