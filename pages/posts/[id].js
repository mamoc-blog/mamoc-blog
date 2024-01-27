import Layout from '../../components/layout/layout';
import Figure from '../../components/frames/Figure';
import ButtonTimer from '../../components/interactive/ButtonTimer';
import { getAllPostIds, getPostData } from '../../lib/posts';
import Head from 'next/head';
import Image from 'next/image';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';
import styles from '../../styles/post.module.css';
import {useState, useEffect} from 'react';
import 'katex/dist/katex.min.css'
import { MDXRemote } from 'next-mdx-remote';
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
  const headings = Array.from(document.querySelectorAll('article h1, article h2, article h3, article h4, article h5, article h6'));
  const tocItems = headings.map((heading) => {
    const level = parseInt(heading.tagName.substring(1), 10); // Extract level number from tagName
    const indentSize = 20; // Size of indent in pixels, adjust as needed
    const indent = (level - 1) * indentSize; // Calculate indent based on level

    return {
      id: heading.id,
      title: heading.textContent,
      level: heading.tagName.toLowerCase(),
      indent, // Add indent property
    };
  });
  setToc(tocItems);
}, []);


  // Determine the author image file name
  const authorImageSrc = postData.author.toLowerCase() === "cameron michie" ? "/images/cam.png" : "/images/alex.png";

  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        
        <div className={`${utilStyles.lightText} ${styles.postMetadata}`}>
          <Date dateString={postData.date} />
          <div className={utilStyles.authorContainer}>
            <Image
              priority
              src={authorImageSrc}
              height={50}
              width={50}
              alt={postData.author}
              className={utilStyles.borderCircle}
            />
            <span className={utilStyles.authorName}>{postData.author}</span>
          </div>
        </div>
        
        <div className={styles.summarySection}>
          <p>{postData.summary}</p>
          <div className="toc">
            {toc.map(item => (
              <div key={item.id} style={{ marginLeft: `${item.indent}px` }}>
                <a href={`#${item.id}`}>{item.title}</a>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.postImageContainer}>
          <Image 
            src={postData.imageSrc}
            alt={`Cover image for ${postData.title}`}
            width={500}
            height={500}
            layout="responsive"
          />
        </div>
        
        <div className={styles.postContent}>
          <MDXRemote {...postData.mdxSource} components={components}/>
        </div>
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
