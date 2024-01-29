import React, {useState} from 'react';
import { useChannel } from 'ably/react';
import * as Ably from 'ably';

export default function DisplayImg () {
    const [imageSrc, setImageSrc] = useState('');
    const {channel} = useChannel("spatial-ecology-game", (message: Ably.Types.Message) => {
      if (message.name == 'image-message') {
        setImageSrc(message.data);
      }
    });
  
    return (
      <>
      <div>
        {imageSrc && <img src={`data:image/png;base64,${imageSrc}`} alt="Game State" className="bigger-image" />}
        <style>
          {`
            .bigger-image {
              width: 700px;
              image-rendering: pixelated;
            }
          `}
        </style>
      </div>
      </>
    );
  }
  