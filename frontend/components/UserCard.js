import React, { useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/components/userCard.module.css';

export default function UserCard({ user, onFollow }) {
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(Boolean(user?.is_following));
  const [followersCount, setFollowersCount] = useState(user?.followers_count || 0);

  const username = user?.username || 'usuario';
  const fullName = user?.full_name || username;
  const avatar = user?.avatar_url || '/img/default-avatar.png';
  const bio = user?.bio || 'Usuário da rede Arcanjo.';

  async function handleFollow(e) {
    e.stopPropagation();

    if (onFollow) {
      await onFollow(user);
    }

    setIsFollowing((prev) => !prev);
    setFollowersCount((prev) => (isFollowing ? Math.max(prev - 1, 0) : prev + 1));
  }

  function openProfile() {
    router.push(`/profile?username=${username}`);
  }

  function openMessages(e) {
    e.stopPropagation();
    router.push(`/messages?user=${user?.id}`);
  }

  return (
    <article className={styles.card} onClick={openProfile}>
      <div className={styles.avatarBox}>
        <img src={avatar} alt={username} />
      </div>

      <div className={styles.info}>
        <h3>{fullName}</h3>
        <span>@{username}</span>
        <p>{bio}</p>

        <div className={styles.stats}>
          <strong>{followersCount}</strong>
          <span>seguidores</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={handleFollow}>
          {isFollowing ? 'Seguindo' : 'Seguir'}
        </button>

        <button type="button" onClick={openMessages}>
          Mensagem
        </button>
      </div>
    </article>
  );
}