import type { Metadata } from 'next';
import { Fira_Code, Source_Serif_4 } from 'next/font/google';
import { getSortedPostsData } from '@/lib/posts';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { CommandPaletteRoot } from '@/components/chrome/CommandPaletteRoot';
import { SiteHeader } from '@/components/chrome/SiteHeader';
import { SiteFooter } from '@/components/chrome/SiteFooter';
import { SITE } from '@/lib/site';
import 'katex/dist/katex.min.css';
import '@/styles/global.scss';

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-fira-code',
  display: 'swap',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { template: '%s · mamoc.blog', default: SITE.name },
  description: SITE.description,
  authors: [{ name: 'Cameron Michie' }, { name: 'Alexander Cheetham' }],
  icons: { icon: '/images/favicon-32x32.png', apple: '/images/apple-touch-icon.png' },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const allPosts = await getSortedPostsData();
  const palettePosts = allPosts.map((p: any) => ({
    id: p.id,
    title: p.title,
    summary: p.summary,
    author: p.author,
    date: p.date,
    topics: p.topics,
  }));

  return (
    <html lang="en" suppressHydrationWarning className={`${firaCode.variable} ${sourceSerif.variable}`}>
      <body>
        <ThemeProvider>
          <CommandPaletteRoot posts={palettePosts}>
            <SiteHeader />
            <main>{children}</main>
            <SiteFooter />
          </CommandPaletteRoot>
        </ThemeProvider>
      </body>
    </html>
  );
}
