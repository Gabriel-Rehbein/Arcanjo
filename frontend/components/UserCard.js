import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/components/userCard.module.css';
import { useApiFetch } from '../utils/api';

export default function UserCard({ user, onFollow }) {
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(Boolean(user?.is_following));
  const [followersCount, setFollowersCount] = useState(user?.followers_count || 0);
  const api = useApiFetch();

  const username = user?.username || 'Usuário';
  const fullName = user?.full_name || username;
  const avatar = user?.avatar_url || '/img/logoaba.png';
  const bio = user?.bio || 'Usuário da rede Arcanjo.';

  async function handleFollow(e) {
    e.stopPropagation();

    try {
      if (isFollowing) {
        const res = await api(`/users/${user.id}/unfollow`, { method: 'POST' });
        setIsFollowing(Boolean(res.is_following));
        setFollowersCount(res.followers_count || Math.max(followersCount - 1, 0));
        if (onFollow) onFollow({ id: user.id, ...res });
      } else {
        const res = await api(`/users/${user.id}/follow`, { method: 'POST' });
        setIsFollowing(Boolean(res.is_following));
        setFollowersCount(res.followers_count || (followersCount + 1));
        if (onFollow) onFollow({ id: user.id, ...res });
      }
    } catch (err) {
      console.error('Erro follow/unfollow', err);
    }
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
        <Link href={`/profile?username=${username}`} legacyBehavior>
          <a className={styles.avatarLink} onClick={(e) => e.stopPropagation()}>
            <img src={avatar} alt={username} />
          </a>
        </Link>
      </div>

      <div className={styles.info}>
        <Link href={`/profile?username=${username}`} legacyBehavior>
          <a className={styles.nameLink} onClick={(e) => e.stopPropagation()}>
            <h3>{fullName}</h3>
            <span>@{username}</span>
          </a>
        </Link>
        <p>{bio}</p>

        <div className={styles.stats}>
          <strong>{followersCount}</strong>
          <span>seguidores</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={handleFollow}>
          {isFollowing ? 'Deixar de seguir' : 'Seguir'}
        </button>

        <button type="button" onClick={openMessages}>
          Mensagem
        </button>
      </div>
    </article>
  );
}