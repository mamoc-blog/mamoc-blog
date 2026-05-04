import path from 'node:path';
import { execSync } from 'node:child_process';
import createMDX from '@next/mdx';

/**
 * Read the current git SHA + last commit timestamp at build time so the
 * chrome can show real deploy info instead of fabricated placeholders.
 * Prefers Vercel's injected env vars when available; falls back to local git.
 */
function gitBuildInfo() {
  const vercelSha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (vercelSha) {
    return {
      sha: vercelSha.slice(0, 7),
      // Vercel doesn't always set a timestamp env, fall back to build time
      pushedAt: process.env.VERCEL_GIT_COMMIT_TIMESTAMP ?? String(Date.now() / 1000),
    };
  }
  try {
    const sha = execSync('git rev-parse --short HEAD').toString().trim();
    const ts = execSync('git log -1 --format=%ct').toString().trim();
    return { sha, pushedAt: ts };
  } catch {
    return { sha: 'unknown', pushedAt: '' };
  }
}

const git = gitBuildInfo();

// Set on process.env BEFORE Next initialises so Turbopack inlines
// NEXT_PUBLIC_* references at build time. The next.config `env` field works
// for webpack but isn't picked up by Turbopack as of 16.2.x.
process.env.NEXT_PUBLIC_GIT_SHA = git.sha;
process.env.NEXT_PUBLIC_GIT_PUSHED_AT = git.pushedAt;

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'mdx'],
  turbopack: {
    // Pin workspace root so Next doesn't latch onto a stray sibling lockfile.
    root: path.resolve('.'),
  },
};

const withMDX = createMDX({
  options: {
    // Use string plugin names — Turbopack passes options to a Rust runtime
    // that can't accept JS function references.
    remarkPlugins: ['remark-gfm', 'remark-math'],
    rehypePlugins: [
      'rehype-katex',
      'rehype-prism-plus',
      'rehype-slug',
      ['rehype-autolink-headings', { behavior: 'wrap' }],
    ],
  },
});

export default withMDX(nextConfig);
