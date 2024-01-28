import Layout from '../../components/layout/layout';
import { getAllPostIds, getPostData } from '../../lib/posts';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';
<<<<<<< Updated upstream
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css'
import { MDXRemote } from 'next-mdx-remote';


export default function Post({ postData }) {
=======
import styles from '../../styles/post.module.scss';
import {useState, useEffect} from 'react';
import 'katex/dist/katex.min.css'
import { MDXRemote } from 'next-mdx-remote';
import Link from 'next/link';
// import {CustomH1, CustomH2, CustomH3} from '../../components/mdx/customHN';
// import your component


const components = {
  Image,
  Figure,
  ButtonTimer,

  // whatever component you want
};
export default function Post({ postData }) {
  const [toc, setToc] = useState([]);

  useEffect(() => {
    // Assuming MDX content is already rendered, find all headings in the document
    const headings = Array.from(document.querySelectorAll('article h2, article h3, article h4, article h5, article h6'));
    const tocItems = headings.map((heading) => {
      const level = parseInt(heading.tagName.substring(1), 10); // Extract level number from tagName
      const bars = '|'.repeat(level - 3); // Generate a string of '|' characters based on heading level
  
      return {
        id: heading.id,
        title: `${bars} ${heading.textContent}`, // Prepend bars to the title
        level: heading.tagName.toLowerCase(),
      };
    });
    setToc(tocItems);
  }, []);
  
  const authorImageSrc = postData.author.toLowerCase() === "cameron michie" ? "/images/cam.png" : "/images/alex.png";
  const linkedinUrl = postData.author.toLowerCase() === "cameron michie" ? "https://www.linkedin.com/in/cameron-michie/" : "https://www.linkedin.com/in/alexandercheetham/";
  const githubUrl = postData.author.toLowerCase() === "cameron michie" ? "https://github.com/cameron-michie" : "https://github.com/alexander-cheetham";
  const cvLink = "/"+(postData.author.toLowerCase() === "cameron michie" ? "cam" : "alex")+".pdf";
>>>>>>> Stashed changes
  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
<<<<<<< Updated upstream
        <div className={utilStyles.lightText}>
          <Date dateString={postData.date} />
=======
        <div className={styles.summarySection}>
          <div className={styles.contentRow}>
            <div className={styles.postMetadata}>
              <span className={`${styles.authorName} ${utilStyles.headingMd}`}><b>{postData.author}</b></span>
              <div className={`${utilStyles.lightText}`}>
                <Date dateString={postData.date} />  
              </div>
              <p><b>{postData.summary}</b></p>
              <div className={styles.authorContainer}>
                <Link href='.'>
                  <Image
                    priority
                    src={authorImageSrc}
                    height={50}
                    width={50}
                    alt={postData.author}
                    className={utilStyles.borderCircle}
                  />
                </Link>
                <Link href={githubUrl}>
                  <Image
                    priority
                    src={"/images/github.png"}
                    height={50}
                    width={50}
                    alt={postData.author}
                    className={utilStyles.borderCircle}
                  />
                </Link>
                <Link href={linkedinUrl}>
                  <Image
                    priority
                    src={"/images/linkedin.png"}
                    height={50}
                    width={50}
                    alt={postData.author}
                    className={utilStyles.borderCircle}
                  />
                </Link>
                <a href={"/cv/cam.pdf"}>
                  <Image
                    priority
                    src={"/images/cv.png"}
                    height={50}
                    width={50}
                    alt={postData.author}
                    className={utilStyles.borderCircle}
                  />
                </a>
              </div>
            </div>
          

          <div className={styles.tableOfContents}>
            {/* Table of Contents */}
            {toc.map(item => (
              <div key={item.id}>
                <a href={`#${item.id}`}>
                  <small>{item.title}</small>
                </a>
              </div>
            ))}
          </div>
        </div>
        </div>
        <div className={styles.postImageContainer}>
            <Image 
              priority
              src={postData.imageSrc}
              alt={`Cover image for ${postData.title}`}
              width={500}
              height={500}
            />
          </div>
        <div className={styles.postContent}>
          <MDXRemote {...postData.mdxSource} components={components}/>
>>>>>>> Stashed changes
        </div>
        <MDXRemote {...postData.mdxSource}/>
      </article>
   </Layout>
  );
}

export async function getStaticPaths() {
  const paths = getAllPostIds();
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  return {
    props: {
      postData,
    },
  };
}
