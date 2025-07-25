import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout/layout';
import utilStyles from '../styles/utils.module.css';
import shellStyles from '../styles/shell.module.scss';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link';


export default function Home({ allPostsData }) {
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={shellStyles.shellContainer}>
        <p><span className={shellStyles.prompt}>$</span> welcome to mamoc blog</p>
        <details className={shellStyles.dropdown} open>
          <summary>Cameron Michie</summary>
          <ul className={utilStyles.list}>
            {allPostsData
              .filter((post) => post.author === 'Cameron Michie')
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(({ id, date, title }) => (
                <li className={utilStyles.listItem} key={id}>
                  <Link href={`/posts/${id}`}>{title}</Link>{' '}
                  <small className={utilStyles.lightText}>{date}</small>
                </li>
              ))}
          </ul>
        </details>
        <details className={shellStyles.dropdown}>
          <summary>Alexander Cheetham</summary>
          <ul className={utilStyles.list}>
            {allPostsData
              .filter((post) =>
                post.author === 'Alex Cheetham' || post.author === 'Alexander Cheetham'
              )
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(({ id, date, title }) => (
                <li className={utilStyles.listItem} key={id}>
                  <Link href={`/posts/${id}`}>{title}</Link>{' '}
                  <small className={utilStyles.lightText}>{date}</small>
                </li>
              ))}
          </ul>
        </details>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}
