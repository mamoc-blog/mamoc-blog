import React, { useState, useEffect } from 'react';
import Image from 'next/image';

let figureCount = 0;

const Figure = ({ src, alt, caption, width, height }) => {
    console.log("Figure component is rendering", { src, alt, caption });

  const [figureNumber, setFigureNumber] = useState(0);

  useEffect(() => {
    figureCount += 1;
    setFigureNumber(figureCount);
    return () => {
      figureCount -= 1;
    };
  }, []);

  return (
    <figure>
      <Image src={src} alt={alt} width={width} height={height}/>
      <figcaption>{`Figure ${figureNumber}: ${caption}`}</figcaption>
      <style >{`
        figure {
          text-align: center;
          margin: 20px 0;
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