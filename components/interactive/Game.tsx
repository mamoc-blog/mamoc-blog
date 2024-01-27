import React, { useState } from 'react';
import { useChannel } from 'ably/react';
import {Types} from "ably";


export default function GameComponent () {
  const [imageSrc, setImageSrc] = useState('');

  const {channel} = useChannel("spatial-ecology-game", (message: Types.Message) => {
    if (message.name == 'image-message') {
      setImageSrc(message.data);
    }
  });

  return (
    
    <>
    <style>
      {
      `.container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh; /* Adjust this value as needed */
      }

      .bigger-image {
        width: 700px;
        image-rendering: pixelated;
      }`
    }
    </style>
    <div className="container">
      {imageSrc && <img src={`data:image/png;base64,${imageSrc}`} alt="Game State" className="bigger-image" />}
    </div>
    </>
  );
}
