import Head from 'next/head';
import Layout, { siteTitle } from '../components/layout/layout';
import styles from '../styles/post.module.scss';
import utilStyles from '../styles/utils.module.css';
import utilStyles2 from '../styles/utils2.module.scss';
import { getSortedPostsData } from '../lib/posts';
import Link from 'next/link';
import { Carousel } from '../components/utils/Carousel';
import carouselImages from '../data/carouselImages.json';
import { useState } from 'react';
import Image from 'next/image';
import { DateTime } from 'luxon';
import PostCard from '../components/ui/PostCard';
import SocialLinks from '../components/ui/SocialLinks';
import AuthorSection from '../components/ui/AuthorSection';
import { getAuthorByName } from '../data/authors';


export default function Home({ allPostsData, carouselProps }) {
  const [cursor, setCursor] = useState(0)

  const cameronPosts = allPostsData.filter(post => post.author === 'Cameron Michie').sort((a, b) => {
    const beforeDate = DateTime.fromISO(a.date);
    const afterDate = DateTime.fromISO(b.date);
    return afterDate.toMillis() - beforeDate.toMillis();
  });

  const alexPosts = allPostsData.filter(post => post.author === 'Alex Cheetham').sort((a, b) => {
    const beforeDate = DateTime.fromISO(a.date);
    const afterDate = DateTime.fromISO(b.date);
    return afterDate.toMillis() - beforeDate.toMillis();
  });

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section >
        <div className={utilStyles2.container}>
          <div className={utilStyles2.left}>
            <div className={utilStyles2.text}>
              <div className={utilStyles2.description}>
                <p>A blog project started by <span className={utilStyles.highlightText}><b>Cameron Michie</b></span> and <span className={utilStyles.highlightText}><b>Alexander Cheetham</b></span>.</p>
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
            />
          </div>
        </div>
      </section>
      <section className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <div className={utilStyles2.blogContainer}>
          <div className={utilStyles2.blogLeft}>
            <AuthorSection
              authorData={getAuthorByName("Cameron Michie")}
              posts={cameronPosts}
            />
          </div>
          <div />
          <div className={utilStyles2.blogRight}>
            <AuthorSection
              authorData={getAuthorByName("Alex Cheetham")}
              posts={alexPosts}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();

  // Start with manually curated carousel images
  let finalCarouselItems = [...carouselImages];

  const existingUrls = finalCarouselItems.map(item => item.blogPostUrl);

  allPostsData.forEach(post => {

    const postUrl = `/posts/${post.id}`;

    // Check if we already have this post
    if (!existingUrls.includes(postUrl)) {
      if (post.imageSrc) {
        finalCarouselItems.push({
          src: post.imageSrc,
          author: post.author, // Use full name from frontmatter
          blogPostTitle: post.title,
          blogPostUrl: postUrl,
          imageNumber: '1'
        });
      }
    }
  });

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  shuffleArray(finalCarouselItems);

  const srcs = finalCarouselItems.map(item => item.src);
  const authors = finalCarouselItems.map(item => item.author);
  const blogTitles = finalCarouselItems.map(item => item.blogPostTitle);
  const blogUrls = finalCarouselItems.map(item => item.blogPostUrl);

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
