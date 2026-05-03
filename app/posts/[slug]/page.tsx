import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPostSlugs, getPostMetadata } from '@/lib/posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const meta = await getPostMetadata(slug);
    return { title: meta.title, description: meta.summary };
  } catch {
    return { title: 'Not found' };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const { default: PostBody } = await import(`@/content/posts/${slug}.mdx`);
    return (
      <article style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <PostBody />
      </article>
    );
  } catch {
    notFound();
  }
}
