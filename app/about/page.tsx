import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';
import { getColophon } from '@/lib/colophon';

export const metadata: Metadata = {
  title: 'About',
  description: 'About mamoc.blog — what it is, why we write it, and the colophon.',
};

export default async function Page() {
  const colophon = await getColophon();
  return <AboutPage colophon={colophon} />;
}
