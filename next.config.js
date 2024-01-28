module.exports = (async () => {
  const remarkMath = await import('remark-math');
  const rehypeKatex = await import('rehype-katex');
  const remarkGfm = await import('remark-gfm');
  const rehypeHighlight = await import('rehype-prism-plus');
  const rehypeSlug = await import('rehype-slug');
  const rehypeAutolinkHeadings = await import('rehype-autolink-headings');

  const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
<<<<<<< Updated upstream
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex, rehypeHighlight],
=======
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings],
      providerImportSource: '@mdx-js/react'
>>>>>>> Stashed changes
    },
  });

  return withMDX({
    pageExtensions: ['js', 'jsx', 'md', 'mdx'],
    // other next.js config
  });
})();