import Layout from '../../components/layout/layout';
import Figure from '/components/frames/Figure';
import ButtonTimer from '/components/interactive/ButtonTimer';
import WFCCONTAINER from '../../components/WFC_components/WFCCONTAINER';
import CharacteristicLengthCalculator from '/components/interactive/CharacteristicLengthCalculator';
import RK4ReactionDiffusion from '/components/interactive/RK4ReactionDiffusion';
import { getAllPostIds, getPostData } from '../../lib/posts';
import Head from 'next/head';
import Date from '../../components/date';
import utilStyles from '../../styles/utils.module.css';
import utilStyles2 from '../../styles/utils2.module.scss';
import dynamic from 'next/dynamic';
import 'katex/dist/katex.min.css'
import { MDXRemote } from 'next-mdx-remote';
import styles from '../../styles/post.module.scss';
import { useState, useEffect } from 'react';
import SocialLinks from '../../components/ui/SocialLinks';
import 'katex/dist/katex.min.css'
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs'
import path from 'path'
// import {CustomH1, CustomH2, CustomH3} from '../../components/mdx/customHN';
// import your component
const LotkaVolterra = dynamic(() => import('/components/interactive/LotkaVolterra'), {
  ssr: false,
});

import CodeBlock from '../../components/mdx/CodeBlock';
import PostHeader from '../../components/posts/PostHeader';
import TableOfContents from '../../components/ui/TableOfContents';
import { getAuthorByName } from '../../data/authors';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

const components = {
  Image,
  Figure,
  ButtonTimer,
  LotkaVolterra,
  RK4ReactionDiffusion,
  Link,
  CharacteristicLengthCalculator,
  WFCCONTAINER,
  pre: CodeBlock,
  // Table components
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};

export default function Post({ postData, wfc_paths }) {




  return (
    <Layout>
      <Head>
        <title>{postData.title}</title>
      </Head>
      <article>

        <PostHeader
          title={postData.title}
          author={postData.author}
          date={postData.date}
          summary={postData.summary}
          imageSrc={postData.imageSrc}
          readingTime={postData.readingTime}
          toc={<TableOfContents />}
        />
        <div hidden id="imageholder">
          {wfc_paths.map((image) => (
            <img src={image} key={image} alt={image} />
          ))}
        </div>
        <div className={styles.postContent}>
          <MDXRemote {...postData.mdxSource} components={components} />
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

export function* readAllFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    if (file.isDirectory()) {
      yield* readAllFiles(path.join(dir, file.name));
    } else {
      yield path.join(dir, file.name);
    }
  }
}

export async function getStaticProps({ params }) {
  const postData = await getPostData(params.id);
  var wfc_paths = []
  if (postData.title == 'Creating Maps with Wave Function Collapse') {
    for (const file of readAllFiles('./public/posts/WFC/')) {
      wfc_paths.push(file.split('public')[1])
    }
  }

  return {
    props: {
      postData,
      wfc_paths,
    },
  };
}
