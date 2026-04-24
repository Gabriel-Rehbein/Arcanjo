import React from 'react';
import styles from '../styles/components/storyBar.module.css';

export default function StoryBar({ stories = [], onOpenStory }) {
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
      alert('Função de criar story será implementada.');
      return;
    }

    if (onOpenStory) {
      onOpenStory(story);
    }
  }

  return (
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
              src={story.avatar_url || story.user?.avatar_url || '/img/default-avatar.png'}
              alt={story.username || story.user?.username || 'Story'}
            />
          </div>

          <span>
            {story.username || story.user?.username || 'usuário'}
          </span>
        </button>
      ))}
    </section>
  );
}