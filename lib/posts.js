import * as fs from 'node:fs';import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize'
import katex from 'rehype-katex'
import highlight from 'rehype-prism-plus'
import gfm from 'remark-gfm'
import rehypeCodeTitles from 'rehype-code-titles';
import math from 'remark-math'
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import 'katex/dist/katex.min.css'


const postsDirectory = path.join(process.cwd(), 'posts');

export function getSortedPostsData() {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.mdx$/, '');

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Combine the data with the id
    return {
      id,
      ...matterResult.data,
    };
  });
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      params: {
        id: fileName.replace(/\.mdx$/, ''),
      },
    };
  });
}


export async function getPostData(id) {
  const fullPathMd = path.join(postsDirectory, `${id}.md`);
  const fullPathMdx = path.join(postsDirectory, `${id}.mdx`);
  const fullPath = fs.existsSync(fullPathMd) ? fullPathMd : fullPathMdx;

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Process the MDX content
  const mdxSource = await mdxToHtml(matterResult.content);

  // Combine the data with the id and mdxSource
  return {
    id,
    mdxSource, // This is the serialized MDX content
    ...matterResult.data,
  };
}


export async function mdxToHtml(content) {
  const rehypeSlug = (await import('rehype-slug')).default;

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [gfm, math ],
      rehypePlugins: [katex, highlight, rehypeCodeTitles, rehypeSlug, rehypeAutolinkHeadings],
      format: 'mdx'
    }
  });

  return mdxSource;
}
