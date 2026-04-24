import Head from 'next/head';
import styles from '../styles/components/layout.module.css';

export default function Layout({ title = 'Arcanjo', children }) {
  const pageTitle = `${title} • Arcanjo`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content="Arcanjo é uma rede social de projetos, portfólios e conexões profissionais."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className={styles.layout}>
        <div className={styles.backgroundGlow} />
        <section className={styles.content}>{children}</section>
      </main>
    </>
  );
}