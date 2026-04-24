import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/notifications.module.css';
import { apiFetch } from '../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const filters = ['all', 'likes', 'comments', 'follows', 'messages'];

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      let url = '/notifications';
      if (filter !== 'all') {
        url += `?type=${filter}`;
      }
      const data = await apiFetch(url);
      setNotifications(data);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notifId) => {
    try {
      await apiFetch(`/notifications/${notifId}/read`, { method: 'PUT' });
      setNotifications(
        notifications.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      case 'message':
        return '📩';
      default:
        return '🔔';
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.notifications}>
          <div className={styles.header}>
            <h2>Notificações</h2>
            <button className={styles.clearBtn}>Limpar todas</button>
          </div>

          <div className={styles.filters}>
            {filters.map((f) => (
              <button
                key={f}
                className={filter === f ? styles.active : ''}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? 'Tudo' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className={styles.empty}>
              <p>Nenhuma notificação</p>
            </div>
          ) : (
            <div className={styles.list}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`${styles.notifItem} ${!notif.is_read ? styles.unread : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <img src={notif.from_user?.avatar_url || '/img/default-avatar.png'} alt="Avatar" />
                  <div className={styles.content}>
                    <p>
                      <strong>{notif.from_user?.username}</strong> {notif.message}
                    </p>
                    <span className={styles.time}>
                      {new Date(notif.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <span className={styles.icon}>{getNotificationIcon(notif.type)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
