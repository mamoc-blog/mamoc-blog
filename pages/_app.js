import '../styles/global.scss';
import '../styles/prism-theme.scss';
import 'katex/dist/katex.min.css';

import Head from 'next/head';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>MAMOC Blog</title>
        <meta name="description" content="Technical blog on Machine Learning, NeuroEvolution, and more." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IE" />
        <meta property="og:url" content="https://mamoc.blog/" />
        <meta property="og:site_name" content="MAMOC Blog" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}