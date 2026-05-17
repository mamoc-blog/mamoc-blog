import fs from 'node:fs';
import path from 'node:path';
import pkg from '@/package.json';
import { AUTHORS } from './authors';
import { getSortedPostsData, type Post } from './posts';
import { SITE } from './site';

type Deps = Record<string, string>;
const deps = pkg.dependencies as Deps;

const STACK: Array<{ key: keyof typeof pkg.dependencies | string; label: string }> = [
  { key: 'next', label: 'Next.js' },
  { key: '@mdx-js/react', label: 'MDX' },
  { key: 'sass', label: 'Sass' },
];

function cleanVersion(spec: string | undefined): string {
  if (!spec) return '';
  return spec.replace(/^[\^~>=<\s]+/, '');
}

function majorOnly(v: string): string {
  return v.split('.')[0] ?? '';
}

/** Parse next/font/google imports out of the root layout so colophon and
 *  layout can't drift. Underscores in the export name (e.g. `Source_Serif_4`)
 *  map to spaces in the display name. */
function parseFonts(): string[] {
  try {
    const src = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf8');
    const fonts: string[] = [];
    const re = /import\s*\{([^}]+)\}\s*from\s*['"]next\/font\/google['"]/g;
    for (const m of src.matchAll(re)) {
      for (const name of m[1].split(',')) {
        const cleaned = name.trim().replace(/_/g, ' ');
        if (cleaned) fonts.push(cleaned);
      }
    }
    return fonts;
  } catch {
    return [];
  }
}

function detectHosting(): string {
  if (process.env.VERCEL) return 'Vercel';
  if (process.env.NETLIFY) return 'Netlify';
  if (process.env.CF_PAGES) return 'Cloudflare Pages';
  if (process.env.RENDER) return 'Render';
  return 'self-hosted';
}

function detectLicense(): string | null {
  for (const name of ['LICENSE', 'LICENSE.md', 'LICENSE.txt']) {
    const full = path.join(process.cwd(), name);
    if (fs.existsSync(full)) {
      const firstLine = fs.readFileSync(full, 'utf8').split('\n')[0]?.trim();
      return firstLine || name;
    }
  }
  return null;
}

function detectRepoUrl(): string | null {
  const url = (pkg as { repository?: { url?: string } }).repository?.url;
  if (!url) return null;
  return url.replace(/^git\+/, '').replace(/\.git$/, '');
}

export type Colophon = Awaited<ReturnType<typeof getColophon>>;

export async function getColophon() {
  const posts: Post[] = await getSortedPostsData();
  const topics = new Set<string>();
  posts.forEach((p) => p.topics?.forEach((t) => topics.add(t)));

  const latestPost = posts[0];
  const latestYear = latestPost
    ? new Date(latestPost.date).getUTCFullYear()
    : new Date().getUTCFullYear();

  return {
    authors: Object.values(AUTHORS).map((a) => ({ name: a.name, role: a.role })),
    stats: {
      posts: posts.length,
      authors: Object.keys(AUTHORS).length,
      topics: topics.size,
      since: SITE.launchYear,
      activeYears: latestYear - SITE.launchYear + 1,
      latestDate: latestPost?.date ?? null,
    },
    stack: STACK
      .map(({ key, label }) => ({ label, version: majorOnly(cleanVersion(deps[key])) }))
      .filter((s) => s.version),
    math: deps['rehype-katex'] ? 'KaTeX' : null,
    fonts: parseFonts(),
    hosting: detectHosting(),
    repo: detectRepoUrl(),
    license: detectLicense(),
    git: {
      sha: process.env.NEXT_PUBLIC_GIT_SHA || null,
      pushedAt: process.env.NEXT_PUBLIC_GIT_PUSHED_AT || null,
    },
  };
}
