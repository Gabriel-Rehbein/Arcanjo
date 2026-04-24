import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/UserCard.module.css';

export default function UserCard({ user, onFollow, isFollowing = false }) {
  return (
    <div className={styles.card}>
      <img src={user.avatar_url || '/img/default-avatar.png'} alt={user.username} className={styles.avatar} />
      <div className={styles.info}>
        <Link href={`/user/${user.id}`}>
          <h4>{user.full_name || user.username}</h4>
        </Link>
        <span className={styles.username}>@{user.username}</span>
        <p className={styles.bio}>{user.bio}</p>
      </div>
      <button
        className={`${styles.followBtn} ${isFollowing ? styles.following : ''}`}
        onClick={() => onFollow(user.id)}
      >
        {isFollowing ? 'Seguindo' : 'Seguir'}
      </button>
    </div>
  );
}
