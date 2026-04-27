import React, { useState } from 'react';
import styles from '../styles/components/storyBar.module.css';
import { apiFetch } from '../utils/api';

export default function StoryBar({ stories = [], onOpenStory, onStoryCreated }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [storyData, setStoryData] = useState({ image_url: '', content: '' });
  const [loading, setLoading] = useState(false);

  const fallbackStories = [
    {
      id: 'create',
      username: 'Criar',
      avatar_url: '/img/logoaba.png',
      isCreate: true,
    },
  ];

  const storyList = stories.length > 0 ? [...fallbackStories, ...stories] : fallbackStories;

  function handleClick(story) {
    if (story.isCreate) {
      setIsCreateModalOpen(true);
      return;
    }

    if (onOpenStory) {
      onOpenStory(story);
    }
  }

  async function handleCreateStory(e) {
    e.preventDefault();
    if (!storyData.image_url.trim()) {
      alert('URL da imagem é obrigatória');
      return;
    }

    setLoading(true);
    try {
      await apiFetch('/stories', {
        method: 'POST',
        body: JSON.stringify(storyData),
      });

      alert('Story criada com sucesso!');
      setIsCreateModalOpen(false);
      setStoryData({ image_url: '', content: '' });
      if (onStoryCreated) onStoryCreated();
    } catch (error) {
      alert(error.message || 'Erro ao criar story');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <section className={styles.storyBar}>
        {storyList.map((story) => (
          <button
            key={story.id}
            type="button"
            className={`${styles.story} ${story.isCreate ? styles.createStory : ''}`}
            onClick={() => handleClick(story)}
          >
            <div className={styles.avatarRing}>
              <img
                src={story.avatar_url || story.user?.avatar_url || 'https://via.placeholder.com/150x150.png?text=Avatar'}
                alt={story.username || story.user?.username || 'Story'}
              />
            </div>

            <span>
              {story.username || story.user?.username || 'usuário'}
            </span>
          </button>
        ))}
      </section>

      {isCreateModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCreateModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Criar Story</h2>
            <form onSubmit={handleCreateStory}>
              <div>
                <label htmlFor="image_url">URL da Imagem:</label>
                <input
                  type="url"
                  id="image_url"
                  value={storyData.image_url}
                  onChange={(e) => setStoryData({ ...storyData, image_url: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="content">Conteúdo (opcional):</label>
                <textarea
                  id="content"
                  value={storyData.content}
                  onChange={(e) => setStoryData({ ...storyData, content: e.target.value })}
                  rows={3}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}