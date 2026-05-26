import React from 'react';
import styles from '../styles/components/loadingOverlay.module.css';
import { useLoading } from '../contexts/LoadingContext';

export default function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className={styles.overlay} aria-hidden={!isLoading}>
      <div className={styles.spinner} />
    </div>
  );
}
