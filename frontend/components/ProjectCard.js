import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/components/ProjectCard.module.css';
import { apiFetch } from '../utils/api';

export default function ProjectCard({ project, onLike, onComment }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(project.likes_count || 0);
  const [comments, setComments] = useState(project.comments_count || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      setLikes(isLiked ? likes - 1 : likes + 1);
      if (onLike) onLike(project.id);
    } catch (err) {
      console.error('Erro ao dar like:', err);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Chamar API para salvar comentário
      setComments(comments + 1);
      setNewComment('');
      if (onComment) onComment(project.id, newComment);
    } catch (err) {
      console.error('Erro ao comentar:', err);
    }
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <img src={project.user?.avatar_url || '/img/default-avatar.png'} alt="Avatar" />
          <div className={styles.userDetails}>
            <Link href={`/user/${project.user_id}`}>
              <strong>{project.user?.full_name || 'Usuário'}</strong>
            </Link>
            <span className={styles.username}>@{project.user?.username}</span>
          </div>
        </div>
        <button className={styles.menuBtn}>⋯</button>
      </div>

      {/* Imagem do projeto */}
      {project.image_url && (
        <div className={styles.imageContainer}>
          <img src={project.image_url} alt={project.title} />
        </div>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${isLiked ? styles.active : ''}`}
          onClick={handleLike}
        >
          {isLiked ? '❤️' : '🤍'} {likes}
        </button>
        <button className={styles.btn} onClick={() => setShowComments(!showComments)}>
          💬 {comments}
        </button>
        <button className={styles.btn}>
          ↗️
        </button>
        <button
          className={`${styles.btn} ${styles.save} ${isSaved ? styles.active : ''}`}
          onClick={handleSave}
        >
          {isSaved ? '💾' : '🔖'}
        </button>
      </div>

      {/* Conteúdo */}
      <div className={styles.content}>
        <h3>{project.title}</h3>
        <p>{project.description}</p>

        {project.tags && (
          <div className={styles.tags}>
            {project.tags.split(',').map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {project.category && (
          <span className={styles.category}>{project.category}</span>
        )}

        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
            Visitar Projeto →
          </a>
        )}
      </div>

      {/* Comentários */}
      {showComments && (
        <div className={styles.commentsSection}>
          <form onSubmit={handleCommentSubmit}>
            <input
              type="text"
              placeholder="Adicione um comentário..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Enviar</button>
          </form>
          <div className={styles.commentsList}>
            {/* Lista de comentários */}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className={styles.timestamp}>
        {new Date(project.created_at).toLocaleDateString('pt-BR')}
      </div>
    </div>
  );
}
