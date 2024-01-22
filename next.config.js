module.exports = (async () => {
  const remarkMath = await import('remark-math');
  const rehypeKatex = await import('rehype-katex');

  const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
      remarkPlugins: [remarkMath.default],
      rehypePlugins: [rehypeKatex.default],
    },
  });

  return withMDX({
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    // other next.js config
  });
})();
