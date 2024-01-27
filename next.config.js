
module.exports = (async () => {
  const remarkMath = await import('remark-math');
  const rehypeKatex = await import('rehype-katex');
  const rehypeHighlight = await import('rehype-prism-plus');

  const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeHighlight],
      providerImportSource: '@mdx-js/react'
    },
  });

  return withMDX({
    pageExtensions: ['js', 'jsx', 'md', 'mdx'],
    // other next.js config
  });
})();