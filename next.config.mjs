import path from 'node:path';
import createMDX from '@next/mdx';

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
