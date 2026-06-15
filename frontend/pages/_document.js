import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="icon" type="image/png" href="/img/logoaba.png" />
        <link rel="apple-touch-icon" href="/img/logoaba.png" />
        <meta name="theme-color" content="#07111f" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
