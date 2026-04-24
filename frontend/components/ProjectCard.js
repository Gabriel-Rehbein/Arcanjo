import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/components/projectCard.module.css';

export default function ProjectCard({
  project,
  onLike,
  onSave,
  onComment,
  onShare,
}) {
  const router = useRouter();

  const [showFullDescription, setShowFullDescription] = useState(false);

  const image = project?.image_url || '/img/logoaba.png';
  const title = project?.title || 'Projeto sem título';
  const description = project?.description || 'Sem descrição disponível.';
  const username =
    project?.user?.username ||
    project?.author?.username ||
    project?.username ||
    'usuario';

  function handleOpenProfile() {
    router.push(`/profile?username=${username}`);
  }

  function handleOpenProject() {
    if (project?.link) {
      window.open(project.link, '_blank', 'noopener,noreferrer');
    }
  }

  function handleShare() {
    if (onShare) {
      onShare(project);
      return;
    }

    const shareText = `${title} - ${description}`;

    if (navigator.share) {
      navigator.share({
        title,
        text: shareText,
        url: project?.link || window.location.href,
      });
    } else {
      navigator.clipboard.writeText(project?.link || window.location.href);
      alert('Link copiado!');
    }
  }

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        <button type="button" className={styles.userButton} onClick={handleOpenProfile}>
          <img
            className={styles.avatar}
            src={project?.user?.avatar_url || project?.author?.avatar_url || '/img/default-avatar.png'}
            alt={username}
          />

          <div>
            <strong>{project?.user?.full_name || project?.author?.full_name || username}</strong>
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
              className={`${styles.actionBtn} ${project?.is_liked ? styles.activeLike : ''}`}
              onClick={onLike}
            >
              {project?.is_liked ? '❤️' : '🤍'}
            </button>

            <button type="button" className={styles.actionBtn} onClick={onComment}>
              💬
            </button>

            <button type="button" className={styles.actionBtn} onClick={handleShare}>
              📤
            </button>
          </div>

          <button
            type="button"
            className={`${styles.actionBtn} ${project?.is_saved ? styles.activeSave : ''}`}
            onClick={onSave}
          >
            {project?.is_saved ? '🔖' : '📑'}
          </button>
        </div>

        <div className={styles.metrics}>
          <strong>{project?.likes_count || 0} curtidas</strong>
          <span>{project?.comments_count || 0} comentários</span>
        </div>

        <h3>{title}</h3>

        <p className={styles.description}>
          {showFullDescription
            ? description
            : description.length > 140
              ? `${description.slice(0, 140)}...`
              : description}
        </p>

        {description.length > 140 && (
          <button
            type="button"
            className={styles.readMore}
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            {showFullDescription ? 'Ver menos' : 'Ver mais'}
          </button>
        )}

        {project?.category && (
          <span className={styles.category}>
            {project.category}
          </span>
        )}

        {project?.tags?.length > 0 && (
          <div className={styles.tags}>
            {project.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          {project?.link && (
            <button type="button" onClick={handleOpenProject}>
              Ver projeto
            </button>
          )}

          <small>
            {project?.created_at
              ? new Date(project.created_at).toLocaleDateString('pt-BR')
              : 'Publicado recentemente'}
          </small>
        </div>
      </section>
    </article>
  );
}