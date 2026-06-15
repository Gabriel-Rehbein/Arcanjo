import { useEffect, useState } from 'react';
import styles from '../styles/components/SplashScreen.module.css';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = window.setTimeout(() => setVisible(false), reducedMotion ? 700 : 2400);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className={styles.splash} role="status" aria-label="Carregando Arcanjo">
      <div className={styles.network} aria-hidden="true">
        <i className={styles.connectionOne} />
        <i className={styles.connectionTwo} />
        <i className={styles.connectionThree} />
        <i className={styles.connectionFour} />
      </div>

      <div className={styles.content}>
        <div className={styles.mark} aria-hidden="true">
          <div className={styles.aura} />
          <svg viewBox="0 0 260 150" className={styles.wings}>
            <defs>
              <linearGradient id="arcanjo-wing-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#e2e8f0" />
                <stop offset="0.48" stopColor="#38bdf8" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
              <filter id="arcanjo-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <g className={styles.leftWing}>
              <path d="M126 83 C99 79 72 61 38 24 C56 67 78 92 116 101" />
              <path d="M122 91 C91 94 59 83 20 55 C48 99 77 113 116 109" />
              <path d="M119 101 C87 111 61 111 34 102 C66 128 92 128 122 113" />
              <circle cx="38" cy="24" r="3.5" />
              <circle cx="20" cy="55" r="3.5" />
              <circle cx="34" cy="102" r="3.5" />
              <circle cx="75" cy="70" r="2.6" />
            </g>

            <g className={styles.rightWing}>
              <path d="M134 83 C161 79 188 61 222 24 C204 67 182 92 144 101" />
              <path d="M138 91 C169 94 201 83 240 55 C212 99 183 113 144 109" />
              <path d="M141 101 C173 111 199 111 226 102 C194 128 168 128 138 113" />
              <circle cx="222" cy="24" r="3.5" />
              <circle cx="240" cy="55" r="3.5" />
              <circle cx="226" cy="102" r="3.5" />
              <circle cx="185" cy="70" r="2.6" />
            </g>

            <g className={styles.core} filter="url(#arcanjo-glow)">
              <circle cx="130" cy="82" r="10" />
              <circle cx="130" cy="82" r="3.5" className={styles.coreDot} />
              <path d="M130 94 L130 126" />
              <path d="M119 130 L130 120 L141 130" />
            </g>
          </svg>
          <span className={styles.shine} />
        </div>

        <div className={styles.copy}>
          <h1>Arcanjo</h1>
          <p>Sua rede social de projetos</p>
        </div>
      </div>
    </div>
  );
}
