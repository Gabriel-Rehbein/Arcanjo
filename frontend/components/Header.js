import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/components/Header.module.css';

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
      router.push(`/explore?search=${encodeURIComponent(searchQuery)}`).finally(() => {
        setIsSearching(false);
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      handleSearch(e);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/feed" className={styles.logo}>
          <h1>📱 ArcanjoHub</h1>
        </Link>

        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="🔍 Pesquisar projetos, usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
          />
          <button 
            type="submit" 
            disabled={isSearching || !searchQuery.trim()}
            title="Clique para buscar ou pressione Enter"
          >
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        <nav className={styles.nav}>
          <Link href="/feed" className={router.pathname === '/feed' ? styles.active : ''}>
            Home
          </Link>
          <Link href="/explore" className={router.pathname === '/explore' ? styles.active : ''}>
            Explorar
          </Link>
          <Link href="/messages" className={router.pathname === '/messages' ? styles.active : ''}>
            💬
          </Link>
          <Link href="/notifications" className={router.pathname === '/notifications' ? styles.active : ''}>
            🔔
          </Link>
          <Link href="/dashboard" className={router.pathname === '/dashboard' ? styles.active : ''}>
            Perfil
          </Link>
        </nav>
      </div>
    </header>
  );
}
