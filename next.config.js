module.exports = (async () => {
  const remarkMath = await import('remark-math');
  const rehypeKatex = await import('rehype-katex');
  const remarkGfm = await import('remark-gfm');
  const rehypeHighlight = await import('rehype-prism-plus');

  const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex, rehypeHighlight],
    },
  });

  return withMDX({
    pageExtensions: ['js', 'jsx', 'md', 'mdx'],
    // other next.js config
  });
})();