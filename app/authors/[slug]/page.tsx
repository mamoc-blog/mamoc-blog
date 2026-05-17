import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AUTHOR_SLUGS, getAuthorBySlug } from '@/lib/authors';
import { getSortedPostsData } from '@/lib/posts';
import { AuthorPage } from '@/components/pages/AuthorPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return AUTHOR_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  return {
    title: author ? `${author.name} · author` : 'Not found',
    description: author?.bio,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();
  const allPosts = await getSortedPostsData();
  const posts = allPosts.filter((p) => p.author === author.name);
  return <AuthorPage author={author} posts={posts} />;
}
