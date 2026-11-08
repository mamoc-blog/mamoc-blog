import type { Metadata } from 'next';
import { AboutPage } from '@/components/pages/AboutPage';
import { getColophon } from '@/lib/colophon';

export const metadata: Metadata = {
  title: 'About',
  description: 'A blog by Alex Cheetham and Cameron Michie.',
};

export default async function Page() {
  const colophon = await getColophon();
  return <AboutPage colophon={colophon} />;
}
