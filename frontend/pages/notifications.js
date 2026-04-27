import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/notifications.module.css';
import { apiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';

export default function Notifications() {
  useAuthGuard();

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = [
    { value: 'all', label: 'Tudo' },
    { value: 'like', label: 'Curtidas' },
    { value: 'comment', label: 'Comentários' },
    { value: 'follow', label: 'Seguidores' },
    { value: 'message', label: 'Mensagens' },
  ];

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  async function loadNotifications() {
    try {
      setLoading(true);
      setError('');

      const url = filter === 'all' ? '/notifications' : `/notifications?type=${filter}`;
      const data = await apiFetch(url);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar notificações.');
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(notifId) {
    try {
      await apiFetch(`/notifications/${notifId}/read`, { method: 'PUT' });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  }

  async function markAllAsRead() {
    try {
      await apiFetch('/notifications/read-all', { method: 'PUT' });

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
    }
  }

  function getNotificationIcon(type) {
    const icons = {
      like: '❤️',
      comment: '💬',
      follow: '👤',
      message: '📩',
    };

    return icons[type] || '🔔';
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.notifications}>
          <div className={styles.header}>
            <div>
              <h2>Notificações</h2>
              <p>{unreadCount} não lidas</p>
            </div>

            <button
              className={styles.clearBtn}
              type="button"
              onClick={markAllAsRead}
              disabled={!unreadCount}
            >
              Marcar todas como lidas
            </button>
          </div>

          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f.value}
                type="button"
                className={filter === f.value ? styles.active : ''}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading && <div className={styles.loading}>Carregando...</div>}

          {!loading && error && (
            <div className={styles.error}>
              <p>{error}</p>
              <button type="button" onClick={loadNotifications}>
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className={styles.empty}>
              <p>Nenhuma notificação encontrada.</p>
            </div>
          )}

          {!loading && !error && notifications.length > 0 && (
            <div className={styles.list}>
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  className={`${styles.notifItem} ${!notif.is_read ? styles.unread : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <img
                    src={notif.from_user?.avatar_url || 'https://via.placeholder.com/150x150.png?text=Avatar'}
                    alt={notif.from_user?.username || 'Usuário'}
                  />

                  <div className={styles.content}>
                    <p>
                      <strong>{notif.from_user?.username || 'Usuário'}</strong>{' '}
                      {notif.message || 'interagiu com você.'}
                    </p>

                    <span className={styles.time}>
                      {new Date(notif.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <span className={styles.icon}>{getNotificationIcon(notif.type)}</span>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}