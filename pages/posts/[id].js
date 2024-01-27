import Layout from '../../components/layout/layout';
import Figure from '../../components/frames/Figure';
import ButtonTimer from '../../components/interactive/ButtonTimer';
import { getAllPostIds, getPostData } from '../../lib/posts';
import Head from 'next/head';
import Image from 'next/image';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';
import utilStyles2 from '../../styles/utils2.module.scss';
import 'katex/dist/katex.min.css'
import { MDXRemote } from 'next-mdx-remote';
// import your component

const components = {
  Image,
  Figure,
  ButtonTimer
  // whatever component you want
};
export default function Post({ postData }) {
  // Determine the author image file name
  const authorImageSrc = postData.author.toLowerCase() === "cameron michie" ? "/images/cam.png" : "/images/alex.png";

  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>
        <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        
        <div className={`${utilStyles.lightText} ${utilStyles.postMetadata}`}>
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
        
        <div className={utilStyles.summarySection}>
          <p>{postData.summary}</p>
        </div>

        <div className={utilStyles.postImageContainer}>
          <Image 
            src={postData.imageSrc}
            alt={`Cover image for ${postData.title}`}
            width={500}
            height={500}
            layout="responsive"
          />
        </div>
        
        <div className={utilStyles.postContent}>
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
