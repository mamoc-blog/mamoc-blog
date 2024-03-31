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
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex, rehypeHighlight, rehypeSlug, rehypeAutolinkHeadings],
      providerImportSource: '@mdx-js/react'
    },
  });


  return withMDX({
    pageExtensions: ['js', 'jsx', 'md', 'mdx'],
    webpack(config) {
      config.resolve.fallback = {
  
        // if you miss it, all the other options in fallback, specified
        // by next.js will be dropped.
        ...config.resolve.fallback,  
  
        fs: false, // the solution
        path:false,
      };
      
       return config;
    },
  });
})();

