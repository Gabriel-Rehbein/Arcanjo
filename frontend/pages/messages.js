
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/messages.module.css';
import { apiFetch } from '../utils/api';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await apiFetch('/messages/conversations');
      setConversations(data);
    } catch (err) {
      console.error('Erro ao carregar conversas:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (userId) => {
    try {
      const data = await apiFetch(`/messages/${userId}`);
      setMessages(data);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    loadMessages(user.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await apiFetch(`/messages/send`, {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          content: newMessage,
        }),
      });

      setMessages([...messages, {
        id: Date.now(),
        content: newMessage,
        is_own: true,
        created_at: new Date(),
      }]);
      setNewMessage('');
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.main}>
        <Sidebar />
        <div className={styles.messagesContainer}>
          <div className={styles.conversationsList}>
            <div className={styles.header}>
              <h2>Mensagens</h2>
              <button className={styles.newBtn}>✏️</button>
            </div>
            <input type="text" placeholder="🔍 Pesquisar conversas..." className={styles.search} />

            <div className={styles.conversations}>
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`${styles.conversation} ${selectedUser?.id === conv.id ? styles.active : ''}`}
                  onClick={() => handleSelectUser(conv)}
                >
                  <img src={conv.avatar_url || '/img/default-avatar.png'} alt={conv.username} />
                  <div className={styles.info}>
                    <h4>{conv.full_name || conv.username}</h4>
                    <p>{conv.last_message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.chatArea}>
            {selectedUser ? (
              <>
                <div className={styles.chatHeader}>
                  <img src={selectedUser.avatar_url || '/img/default-avatar.png'} alt={selectedUser.username} />
                  <h3>{selectedUser.full_name || selectedUser.username}</h3>
                </div>

                <div className={styles.messagesBox}>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${msg.is_own ? styles.own : styles.other}`}
                    >
                      <p>{msg.content}</p>
                      <span className={styles.time}>
                        {new Date(msg.created_at).toLocaleTimeString()}
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
                  <button type="submit">📤</button>
                </form>
              </>
            ) : (
              <div className={styles.empty}>
                <p>Selecione uma conversa para começar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
