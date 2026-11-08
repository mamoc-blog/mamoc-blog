import { notFound } from 'next/navigation';
import { getPostMetadata, getReadingTime } from '@/lib/posts';
import { PostSummary } from '@/components/post/PostSummary';
import { ScrollToTopOnNav } from '@/components/post/ScrollToTopOnNav';

export default async function PostLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let metadata;
  try {
    metadata = await getPostMetadata(slug);
  } catch {
    notFound();
  }
  return (
    <>
      <ScrollToTopOnNav />
      <PostSummary slug={slug} metadata={metadata} readingTime={getReadingTime(slug)} />
      {children}
    </>
  );
}
