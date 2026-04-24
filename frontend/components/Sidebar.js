import React from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/components/sidebar.module.css';

const menuItems = [
  { href: '/feed', label: 'Feed', icon: '🏠' },
  { href: '/explore', label: 'Explorar', icon: '🔎' },
  { href: '/trending', label: 'Tendências', icon: '🔥' },
  { href: '/create-project', label: 'Publicar', icon: '➕' },
  { href: '/saved', label: 'Salvos', icon: '🔖' },
  { href: '/messages', label: 'Mensagens', icon: '💬' },
  { href: '/notifications', label: 'Notificações', icon: '🔔' },
  { href: '/profile', label: 'Perfil', icon: '👤' },
  { href: '/settings', label: 'Configurações', icon: '⚙️' },
];

export default function Sidebar() {
  const router = useRouter();

  function isActive(href) {
    return router.pathname === href;
  }

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <button
            key={item.href}
            type="button"
            className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
            onClick={() => router.push(item.href)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.card}>
        <h3>Arcanjo</h3>
        <p>Publique projetos, conecte-se com devs e construa seu portfólio social.</p>

        <button type="button" onClick={() => router.push('/create-project')}>
          Novo Projeto
        </button>
      </div>
    </aside>
  );
}