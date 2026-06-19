import { Head, Html, Main, NextScript } from 'next/document';

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/Arcanjo';

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <link rel="icon" type="image/png" href={`${basePath}/img/logoaba.png`} />
        <link rel="apple-touch-icon" href={`${basePath}/img/logoaba.png`} />
        <meta name="theme-color" content="#07111f" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
