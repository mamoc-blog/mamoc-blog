import { getSortedPostsData } from '@/lib/posts';
import { Frontpage, type FrontpagePost } from '@/components/pages/Frontpage';
import { SubscribeBlock } from '@/components/marketing/SubscribeBlock';

export default async function Page() {
  const raw = await getSortedPostsData();
  const posts: FrontpagePost[] = raw.map((p) => ({
    id: p.id,
    title: p.title,
    date: p.date,
    summary: p.summary,
    author: p.author,
    imageSrc: p.imageSrc,
    topics: p.topics ?? [],
    featured: p.featured ?? false,
  }));
  return (
    <>
      <Frontpage posts={posts} />
      <SubscribeBlock />
    </>
  );
}
