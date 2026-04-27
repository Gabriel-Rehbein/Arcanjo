import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/messages.module.css';
import { apiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';

export default function Messages() {
  useAuthGuard();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const interval = setInterval(() => {
      loadMessages(selectedUser.id, false);
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedUser]);

  async function loadConversations() {
    try {
      setLoading(true);
      const data = await apiFetch('/messages/conversations');
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(userId, showLoading = true) {
    try {
      if (showLoading) setMessages([]);

      const data = await apiFetch(`/messages/${userId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  }

  function handleSelectUser(user) {
    setSelectedUser(user);
    loadMessages(user.id);
  }

  async function handleSendMessage(e) {
    e.preventDefault();

    const content = newMessage.trim();

    if (!content || !selectedUser || sending) return;

    const temporaryMessage = {
      id: `temp-${Date.now()}`,
      content,
      is_own: true,
      created_at: new Date().toISOString(),
      sending: true,
    };

    setMessages((prev) => [...prev, temporaryMessage]);
    setNewMessage('');

    try {
      setSending(true);

      await apiFetch('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          content,
        }),
      });

      await loadMessages(selectedUser.id, false);
      await loadConversations();
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === temporaryMessage.id
            ? { ...msg, sending: false, error: true }
            : msg
        )
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.main}>
        <Sidebar />

        <main className={styles.messagesContainer}>
          <section className={styles.conversationsList}>
            <div className={styles.header}>
              <h2>Mensagens</h2>
              <button className={styles.newBtn} type="button">
                ✏️
              </button>
            </div>

            <input
              type="text"
              placeholder="Pesquisar conversas..."
              className={styles.search}
            />

            <div className={styles.conversations}>
              {loading && <p>Carregando conversas...</p>}

              {!loading && conversations.length === 0 && (
                <p>Nenhuma conversa encontrada.</p>
              )}

              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  className={`${styles.conversation} ${
                    selectedUser?.id === conv.id ? styles.active : ''
                  }`}
                  onClick={() => handleSelectUser(conv)}
                >
                  <img
                    src={conv.avatar_url || 'https://via.placeholder.com/150x150.png?text=Avatar'}
                    alt={conv.username}
                  />

                  <div className={styles.info}>
                    <h4>{conv.full_name || conv.username}</h4>
                    <p>{conv.last_message || 'Sem mensagens ainda'}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.chatArea}>
            {selectedUser ? (
              <>
                <div className={styles.chatHeader}>
                  <img
                    src={selectedUser.avatar_url || 'https://via.placeholder.com/150x150.png?text=Avatar'}
                    alt={selectedUser.username}
                  />

                  <div>
                    <h3>{selectedUser.full_name || selectedUser.username}</h3>
                    <span>@{selectedUser.username}</span>
                  </div>
                </div>

                <div className={styles.messagesBox}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${
                        msg.is_own ? styles.own : styles.other
                      }`}
                    >
                      <p>{msg.content}</p>

                      <span className={styles.time}>
                        {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}

                        {msg.sending && ' • enviando...'}
                        {msg.error && ' • erro'}
                      </span>
                    </div>
                  ))}
                </div>

                <form className={styles.messageForm} onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="Escreva uma mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />

                  <button type="submit" disabled={sending || !newMessage.trim()}>
                    Enviar
                  </button>
                </form>
              </>
            ) : (
              <div className={styles.empty}>
                <h3>Selecione uma conversa</h3>
                <p>Escolha alguém para começar a conversar.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}