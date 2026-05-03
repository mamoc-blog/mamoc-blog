import fs from 'node:fs';
import path from 'node:path';

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

export async function getPostMetadata(slug: string): Promise<PostMetadata> {
  // Dynamic import compiles MDX at build/request time and exposes the
  // ESM `export const metadata = {}` declared at the top of each post file.
  const mod: { metadata: PostMetadata } = await import(`@/content/posts/${slug}.mdx`);
  return mod.metadata;
}

export async function getSortedPostsData(): Promise<Post[]> {
  const slugs = getAllPostSlugs();
  const all = await Promise.all(
    slugs.map(async (slug) => ({ id: slug, ...(await getPostMetadata(slug)) })),
  );
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}
