import React from 'react';
import Link from 'next/link';
import styles from '../styles/components/StoryBar.module.css';

export default function StoryBar({ stories }) {
  return (
    <div className={styles.storyBar}>
      <div className={styles.storiesContainer}>
        {/* Story para adicionar nova */}
        <div className={styles.addStory}>
          <div className={styles.addBtn}>+</div>
          <p>Sua história</p>
        </div>

        {/* Stories existentes */}
        {stories && stories.map((story) => (
          <Link key={story.id} href={`/story/${story.id}`} className={styles.story}>
            <img src={story.image_url} alt="story" />
            <span>{story.user?.username}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
