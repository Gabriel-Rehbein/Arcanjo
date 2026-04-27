import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/components/header.module.css';
import { getUser } from '../utils/auth';

export default function Header() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [username, setUsername] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUsername(getUser());
  }, []);

  function handleSearch(e) {
    e.preventDefault();

    const term = search.trim();

    if (!term) return;

    router.push(`/explore?search=${encodeURIComponent(term)}`);
    setSearch('');
  }

  function handleSearch(e) {
    e.preventDefault();

    const term = search.trim();

    if (!term) return;

    router.push(`/explore?search=${encodeURIComponent(term)}`);
    setSearch('');
  }

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.logo}
        onClick={() => router.push('/feed')}
      >
        <img src="/img/logoaba.png" alt="Arcanjo" />
        <span>Arcanjo</span>
      </button>

      <form className={styles.searchBox} onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Buscar projetos, usuários ou tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">
          Buscar
        </button>
      </form>

      <nav className={styles.actions}>
        <button type="button" onClick={() => router.push('/create-project')}>
          Publicar
        </button>

        <button type="button" onClick={() => router.push('/notifications')}>
          🔔
        </button>

        <button type="button" onClick={() => router.push('/messages')}>
          💬
        </button>

        <button
          type="button"
          className={styles.profileBtn}
          onClick={() => router.push('/profile')}
        >
          <img src="https://via.placeholder.com/150x150.png?text=Avatar" alt={username || 'Perfil'} />
          <span>{username || 'Perfil'}</span>
        </button>
      </nav>
    </header>
  );
}