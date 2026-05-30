import React, { useState } from 'react';
import styles from '../styles/components/storyBar.module.css';
import { useApiFetch } from '../utils/api';

const botStories = [
  {
    id: 'bot-luna-dev',
    image_url: 'https://picsum.photos/seed/story1/800/1200',
    content: 'Planejando um novo evento para a comunidade UX.',
    user: {
      username: 'luna.dev',
      full_name: 'Luna Carvalho',
      avatar_url: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  },
  {
    id: 'bot-bruno-code',
    image_url: 'https://picsum.photos/seed/story2/800/1200',
    content: 'Lancando uma nova funcionalidade de metas financeiras.',
    user: {
      username: 'bruno.code',
      full_name: 'Bruno Azevedo',
      avatar_url: 'https://randomuser.me/api/portraits/men/56.jpg',
    },
  },
  {
    id: 'bot-camila-art',
    image_url: 'https://picsum.photos/seed/story3/800/1200',
    content: 'Mostrando meu processo de ilustracao para a semana.',
    user: {
      username: 'camila.art',
      full_name: 'Camila Martins',
      avatar_url: 'https://randomuser.me/api/portraits/women/65.jpg',
    },
  },
  {
    id: 'bot-diego-tech',
    image_url: 'https://picsum.photos/seed/story4/800/1200',
    content: 'Convidando a comunidade para nosso proximo meetup.',
    user: {
      username: 'diego.tech',
      full_name: 'Diego Ferreira',
      avatar_url: 'https://randomuser.me/api/portraits/men/28.jpg',
    },
  },
  {
    id: 'bot-elisa-music',
    image_url: 'https://picsum.photos/seed/story5/800/1200',
    content: 'Testando uma integracao com novas trilhas sonoras.',
    user: {
      username: 'elisa.music',
      full_name: 'Elisa Souza',
      avatar_url: 'https://randomuser.me/api/portraits/women/12.jpg',
    },
  },
  {
    id: 'bot-felipe-gamer',
    image_url: 'https://picsum.photos/seed/story6/800/1200',
    content: 'Lancando uma demo do jogo nesta semana.',
    user: {
      username: 'felipe.gamer',
      full_name: 'Felipe Lima',
      avatar_url: 'https://randomuser.me/api/portraits/men/33.jpg',
    },
  },
  {
    id: 'bot-gabriela-bio',
    image_url: 'https://picsum.photos/seed/story7/800/1200',
    content: 'Compartilhando novas iniciativas para a semana.',
    user: {
      username: 'gabriela.bio',
      full_name: 'Gabriela Costa',
      avatar_url: 'https://randomuser.me/api/portraits/women/47.jpg',
    },
  },
  {
    id: 'bot-hugo-ux',
    image_url: 'https://picsum.photos/seed/story8/800/1200',
    content: 'Revisando padroes de acessibilidade para meu novo projeto.',
    user: {
      username: 'hugo.ux',
      full_name: 'Hugo Pereira',
      avatar_url: 'https://randomuser.me/api/portraits/men/39.jpg',
    },
  },
];

export default function StoryBar({ stories = [], onOpenStory, onStoryCreated }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [storyData, setStoryData] = useState({ image_url: '', content: '' });
  const [selectedStory, setSelectedStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const api = useApiFetch();

  const fallbackStories = [
    {
      id: 'create',
      username: 'Criar',
      avatar_url: '/img/logoaba.png',
      isCreate: true,
    },
  ];

  const visibleStories = stories.length > 0 ? stories : botStories;
  const storyList = [...fallbackStories, ...visibleStories];

  function handleClick(story) {
    if (story.isCreate) {
      setIsCreateModalOpen(true);
      return;
    }

    setSelectedStory(story);

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
      await api('/stories', {
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
                src={story.avatar_url || story.user?.avatar_url || '/img/logoaba.png'}
                alt={story.username || story.user?.full_name || story.user?.username || 'Story'}
                onError={(e) => {
                  e.currentTarget.src = '/img/logoaba.png';
                }}
              />
            </div>
          </button>
        ))}
      </section>

      {selectedStory && (
        <div className={styles.modalOverlay} onClick={() => setSelectedStory(null)}>
          <div className={styles.storyViewer} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setSelectedStory(null)}
            >
              ×
            </button>
            <img
              src={selectedStory.image_url}
              alt={selectedStory.user?.full_name || selectedStory.user?.username ? `${selectedStory.user?.full_name || selectedStory.user.username} Story` : 'Story'}
            />
            <div className={styles.storyMeta}>
              <strong>{selectedStory.user?.full_name || selectedStory.user?.username || 'Usuário'}</strong>
              {selectedStory.content && <p>{selectedStory.content}</p>}
            </div>
          </div>
        </div>
      )}

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
