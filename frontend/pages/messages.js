import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import styles from '../styles/pages/messages.module.css';
import { useApiFetch } from '../utils/api';
import { useAuthGuard } from '../utils/useAuthGuard';

export default function Messages() {
  useAuthGuard();

  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [conversationSearch, setConversationSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);
  const api = useApiFetch();

  const { user: userQuery } = router.query;

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

  useEffect(() => {
    if (selectedUser && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedUser]);

  async function loadConversations() {
    try {
      setLoading(true);
      const data = await api('/messages/conversations');
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

      const data = await api(`/messages/${userId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar mensagens:', err);
    }
  }

  useEffect(() => {
    // scroll to bottom when messages change
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  async function loadUserById(userId) {
    try {
      setLoading(true);
      const user = await api(`/users/id/${userId}`);
      setSelectedUser(user);
      setMessages([]);
      await loadMessages(userId, false);
    } catch (err) {
      console.error('Erro ao carregar usuário:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const selectedId = Number(userQuery);
    if (!userQuery || Number.isNaN(selectedId)) return;

    const existing = conversations.find((conv) => conv.id === selectedId);
    if (existing) {
      handleSelectUser(existing);
    } else {
      loadUserById(selectedId);
    }
  }, [userQuery, conversations]);

  function handleSelectUser(user) {
    setSelectedUser(user);
    setEditingMessageId(null);
    setEditingText('');
    loadMessages(user.id);
  }

  const emojiList = ['😀', '😂', '😍', '😎', '👍', '🔥', '💬', '🥳', '🙏', '❤️'];

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

      await api('/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          receiver_id: selectedUser.id,
          content,
        }),
      });

      await loadMessages(selectedUser.id, false);
      await loadConversations();
      setEditingMessageId(null);
      setEditingText('');
      setTimeout(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }, 50);
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

  function handleAddEmoji(emoji) {
    setNewMessage((prev) => `${prev}${emoji}`);
  }

  function handleStartEdit(message) {
    setEditingMessageId(message.id);
    setEditingText(message.content);
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setEditingText('');
  }

  async function handleSaveEdit(messageId) {
    if (!editingText.trim() || !selectedUser) return;

    try {
      await api(`/messages/${messageId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: editingText.trim() }),
      });

      await loadMessages(selectedUser.id, false);
      await loadConversations();
      setEditingMessageId(null);
      setEditingText('');
    } catch (err) {
      console.error('Erro ao editar mensagem:', err);
    }
  }

  async function handleDeleteMessage(messageId) {
    if (!selectedUser) return;

    const confirmed = window.confirm('Tem certeza que deseja apagar esta mensagem?');
    if (!confirmed) return;

    try {
      await api(`/messages/${messageId}`, {
        method: 'DELETE',
      });

      await loadMessages(selectedUser.id, false);
      await loadConversations();
    } catch (err) {
      console.error('Erro ao apagar mensagem:', err);
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
              value={conversationSearch}
              onChange={(e) => setConversationSearch(e.target.value)}
            />

            <div className={styles.conversations}>
              {loading && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  <p>Carregando conversas...</p>
                </div>
              )}

              {!loading && conversations.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>
                  <p>Nenhuma conversa encontrada.</p>
                </div>
              )}

              {conversations
                .filter((conv) => {
                  const term = conversationSearch.trim().toLowerCase();
                  if (!term) return true;
                  return (
                    (conv.full_name || conv.username || '')
                      .toLowerCase()
                      .includes(term) ||
                    (conv.last_message || '')
                      .toLowerCase()
                      .includes(term)
                  );
                })
                .map((conv) => (
                  <button
                    key={conv.id}
                    type="button"
                    className={`${styles.conversation} ${
                      selectedUser?.id === conv.id ? styles.active : ''
                    }`}
                    onClick={() => handleSelectUser(conv)}
                    title={conv.full_name || conv.username}
                  >
                  <img
                    src={conv.avatar_url || 'https://via.placeholder.com/150x150.png?text=Avatar'}
                    alt={conv.username}
                    loading="lazy"
                  />

                  <div className={styles.info}>
                    <h4>{conv.full_name || conv.username}</h4>
                    <p title={conv.last_message || 'Sem mensagens ainda'}>
                      {conv.last_message || 'Sem mensagens ainda'}
                    </p>
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

                  <button
                    type="button"
                    className={styles.profileButton}
                    onClick={() => router.push(`/profile?username=${selectedUser.username}`)}
                  >
                    Ver perfil
                  </button>
                </div>

                <div className={styles.messagesBox} ref={messagesRef}>
                  {messages.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#94a3b8',
                      marginTop: 'auto',
                      marginBottom: 'auto'
                    }}>
                      <p>Inicie a conversa enviando a primeira mensagem</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isEditing = editingMessageId === msg.id;
                      const isDeleted = msg.is_deleted || msg.content === '[Mensagem removida]';

                      return (
                        <div
                          key={msg.id}
                          className={`${styles.message} ${
                            msg.is_own ? styles.own : styles.other
                          }`}
                        >
                          {isEditing ? (
                            <div className={styles.editBox}>
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className={styles.editInput}
                                rows={3}
                              />
                              <div className={styles.editActions}>
                                <button
                                  type="button"
                                  className={styles.cancelBtn}
                                  onClick={handleCancelEdit}
                                >
                                  Cancelar
                                </button>
                                <button
                                  type="button"
                                  className={styles.saveBtn}
                                  onClick={() => handleSaveEdit(msg.id)}
                                >
                                  Salvar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p>{msg.content}</p>
                              <div className={styles.messageMeta}>
                                <span className={styles.time}>
                                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {msg.edited_at && !isDeleted && ' • editado'}
                                  {msg.sending && ' • enviando...'}
                                  {msg.error && ' • erro'}
                                </span>
                                {msg.is_own && !isDeleted && (
                                  <div className={styles.messageActions}>
                                    <button
                                      type="button"
                                      className={styles.iconBtn}
                                      onClick={() => handleStartEdit(msg)}
                                      title="Editar mensagem"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      type="button"
                                      className={styles.iconBtn}
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      title="Apagar mensagem"
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <form className={styles.messageForm} onSubmit={handleSendMessage}>
                  <div className={styles.emojiPicker}>
                    {emojiList.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={styles.emojiButton}
                        onClick={() => handleAddEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  <input
                    ref={inputRef}
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
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                <h3>Selecione uma conversa</h3>
                <p>Escolha alguém da lista para começar a conversar.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}