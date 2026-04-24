import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/Sidebar.module.css';

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarContent}>
        <div className={styles.menu}>
          <h3>Menu</h3>
          <Link href="/feed" className={styles.menuItem}>
            🏠 Home
          </Link>
          <Link href="/explore" className={styles.menuItem}>
            🔍 Explorar
          </Link>
          <Link href="/trending" className={styles.menuItem}>
            🔥 Tendências
          </Link>
          <Link href="/saved" className={styles.menuItem}>
            💾 Salvos
          </Link>
        </div>

        <div className={styles.suggestions}>
          <h3>Sugestões</h3>
          <div className={styles.suggestionList}>
            {/* Será preenchido dinamicamente */}
          </div>
        </div>

        <div className={styles.footer}>
          <p>© 2026 ArcanjoHub - Rede Social de Projetos</p>
          <div className={styles.links}>
            <Link href="/about">Sobre</Link>
            <Link href="/privacy">Privacidade</Link>
            <Link href="/terms">Termos</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
