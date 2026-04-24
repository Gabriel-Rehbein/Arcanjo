import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/components/footerNav.module.css';

const items = [
  { href: '/feed', label: 'Feed', icon: '🏠' },
  { href: '/explore', label: 'Explorar', icon: '🔎' },
  { href: '/create-project', label: 'Publicar', icon: '➕' },
  { href: '/messages', label: 'Chat', icon: '💬' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
];

export default function FooterNav() {
  const router = useRouter();

  return (
    <nav className={styles.footerNav}>
      {items.map((item) => (
        <button
          key={item.href}
          type="button"
          className={`${styles.item} ${
            router.pathname === item.href ? styles.active : ''
          }`}
          onClick={() => router.push(item.href)}
        >
          <span>{item.icon}</span>
          <small>{item.label}</small>
        </button>
      ))}
    </nav>
  );
}