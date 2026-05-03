import { notFound } from 'next/navigation';
import { getPostMetadata } from '@/lib/posts';
import { PostSummary } from '@/components/post/PostSummary';
import { SubscribeBlock } from '@/components/marketing/SubscribeBlock';

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
      <PostSummary slug={slug} metadata={metadata} />
      {children}
      <SubscribeBlock />
    </>
  );
}
