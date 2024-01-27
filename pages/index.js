import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout/layout';
import utilStyles from '../styles/utils.module.css';
import utilStyles2 from '../styles/utils2.module.scss';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link';
import Date from '../components/date';
import { Carousel } from '../components/utils/Carousel';
import carouselImages from '../data/carouselImages.json';
import { useState } from 'react';
import Image from 'next/image';


export default function Home({ allPostsData, carouselProps }) {
  const [cursor, setCursor] = useState(0)
  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section >
        <div className={utilStyles2.container}>
          <div className={utilStyles2.left}> 
            <div className={utilStyles2.text}>
              <h1>mamoc</h1> 
                <div className={utilStyles2.description}>
                 <p>A blog project started by Cameron Michie and Alexander Cheetham.</p> 
                  <p>Its core purpose is to produce long-form articles on mathematical and technical topics, with a focus on generating data to create interesting visuals.</p>
                </div>
            </div>
          </div>
          <div className={utilStyles2.right}>
          <Carousel
            srcs={carouselProps.srcs}
            authors={carouselProps.authors}
            blogTitles={carouselProps.blogTitles}
            blogUrls={carouselProps.blogUrls}
            onChangeCursor={setCursor}
          />
        </div>
        </div>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
          <div className={utilStyles2.blogContainer}>
            <div className={utilStyles2.blogLeft}>
            <h2 className={utilStyles.headingLg}>Cameron Michie</h2>
              <ul className={utilStyles.list}>
                {allPostsData.filter(post => post.author === 'Cameron Michie').map(({ id, date, title, summary, imageSrc }) => (
                  <li className={utilStyles.listItem} key={id}>
                    <Link href={`/posts/${id}`}>{title}</Link>
                    <br />
                    <small className={utilStyles.lightText}>
                      <Date dateString={date} />
                    </small>
                    <br/>
                    <small className={utilStyles.socials}>
                      {summary}
                    </small>
                  </li>
                ))}
              </ul>
            </div>
            <div className={utilStyles2.blogRight}>
            <h2 className={utilStyles.headingLg}>Alex Cheetham</h2>
              <ul className={utilStyles.list}>
                {allPostsData.filter(post => post.author === 'Alex Cheetham').map(({ id, date, title }) => (
                  <li className={utilStyles.listItem} key={id}>
                    <Link href={`/posts/${id}`}>{title}</Link>
                    <br />
                    <small className={utilStyles.lightText}>
                      <Date dateString={date} />
                    </small>
                  </li>
                ))}
              </ul>
            </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();

  const srcs = carouselImages.map(item => item.src);
  const authors = carouselImages.map(item => item.author);
  const blogTitles = carouselImages.map(item => item.blogPostTitle);
  const blogUrls = carouselImages.map(item => item.blogPostUrl);

  return {
    props: {
      allPostsData,
      carouselProps: {
        srcs,
        authors,
        blogTitles,
        blogUrls
      }
    },
  };
}