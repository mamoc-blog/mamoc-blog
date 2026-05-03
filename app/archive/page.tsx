import type { Metadata } from 'next';
import { getSortedPostsData } from '@/lib/posts';
import { ArchivePage } from '@/components/pages/ArchivePage';

export const metadata: Metadata = {
  title: 'Archive',
  description: 'Every post, organised by year and topic.',
};

export default async function Page() {
  const posts = await getSortedPostsData();
  const counts = new Map<string, number>();
  posts.forEach((p) => p.topics?.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
  const topicCounts = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return <ArchivePage posts={posts} topicCounts={topicCounts} />;
}
