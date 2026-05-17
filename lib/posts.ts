import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';

const POSTS_DIR = path.join(process.cwd(), 'content/posts');

export type PostMetadata = {
  title: string;
  date: string;
  summary?: string;
  author?: string;
  imageSrc?: string;
  topics?: string[];
  featured?: boolean;
  math?: boolean;
};

export type Post = PostMetadata & { id: string };

export function getAllPostSlugs(): string[] {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}

/** Compiles the MDX module to read its ESM `export const metadata`. Wrapped
 *  in React.cache so a per-request render tree only pays the compile cost once
 *  per slug, even if multiple components ask for the same post's metadata. */
export const getPostMetadata = cache(async (slug: string): Promise<PostMetadata> => {
  const mod: { metadata: PostMetadata } = await import(`@/content/posts/${slug}.mdx`);
  return mod.metadata;
});

/** Same cache treatment: the root layout, frontpage, archive, and per-author
 *  pages all call this — without dedup, each would re-compile every MDX file. */
export const getSortedPostsData = cache(async (): Promise<Post[]> => {
  const slugs = getAllPostSlugs();
  const all = await Promise.all(
    slugs.map(async (slug) => ({ id: slug, ...(await getPostMetadata(slug)) })),
  );
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
});
