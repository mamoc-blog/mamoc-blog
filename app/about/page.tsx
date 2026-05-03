import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';
import { SubscribeBlock } from '@/components/marketing/SubscribeBlock';

export const metadata: Metadata = {
  title: 'About',
  description: 'About mamoc.blog — what it is, why we write it, and the colophon.',
};

export default function Page() {
  return (
    <>
      <AboutPage />
      <SubscribeBlock />
    </>
  );
}
