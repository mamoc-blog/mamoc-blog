import React from 'react';

const Figure = ({ src, caption, number }) => {
    return (
      <figure>
        {src && <img src={src} alt={caption} style={{ maxWidth: '100%' }} />}
        <figcaption>Figure {number}: {caption}</figcaption>
  
        <style >{`
          figure {
            margin: 20px 0;
            text-align: center; /* Center the caption */
          }
          figcaption {
            margin-top: 8px;
            font-style: italic;
          }
        `}</style>
      </figure>
    );
  };

export default Figure;
