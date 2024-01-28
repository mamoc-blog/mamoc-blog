import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const KaTeX = ({ children }) => {
  const html = katex.renderToString(children, {
    throwOnError: false
  });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

export default KaTeX;
