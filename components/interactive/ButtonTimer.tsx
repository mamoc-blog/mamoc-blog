import React from "react";
import {useState, useEffect} from "react";
import * as Ably from 'ably';
import {AblyProvider} from "ably/react";
import DisplayImg from "./DisplayImg";
import { useSettingsContext } from '../utils/Theme';

function triggerAzureFunction() {
  const url = 'https://spatial-ecology-no-users.azurewebsites.net/api/GameRunner?code=c41DwAgrjEXGAGHV-yVeWvkKVLbH_S0SEDnrsOFg8M5JAzFu2AzDvw==';

  fetch(url, { method: 'GET' })
  .then(response => {
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Handle the response as plain text
      return response.text();
  })
  .then(data => {
      console.log('Success:', data);
  })
  .catch((error) => {
      console.error('Error:', error);
  });
}
  

const ButtonTimer = () => {
    const [count, setCount] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [client, setClient] = useState<InstanceType<typeof Ably.Realtime.Promise> | null>(null);
    const { darkTheme } = useSettingsContext();
    const imgSrc = darkTheme
              ? `/posts/spatial-ecology/press-start-dark.png`
              : `/posts/spatial-ecology/press-start.png`;
  
    useEffect(() => {
      let timer;
      if (count > 0) {
        timer = setTimeout(() => setCount(count - 1), 1000);
      } else {
        // When the countdown ends or is cancelled
        if (client) {
          client.close();
          setClient(null);
        }
        setIsActive(false);
      }
  
      return () => clearTimeout(timer);
    }, [count, isActive, client]);
  
    const handleClick = () => {
      if (isActive) {
        // If active, cancel the game and countdown
        setIsActive(false);
        if (client) {
          client.close();
          setClient(null);
        }
        console.log("Client closed");
      } else {
        // If not active, start the game and countdown
        setIsActive(true);
        const client = new Ably.Realtime.Promise({ authUrl: '/api/ably-token-request', authMethod: 'POST' });
        setClient(client);
        console.log("Client opened");
        if (count == 0) {
          triggerAzureFunction();
          setCount(60);
        }
        
      }
    };
  
    return (
      <>
      <div className="button-container">
        <button className="myButton" onClick={handleClick}>
            {isActive ? `Hide (Countdown: ${count}s)` : 'Start'}
        </button>
      </div>

        <style>
          {
            `.container {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .button-container {
              display: flex; /* Use Flexbox */
              justify-content: center; /* Center horizontally */
              align-items: center; /* Center vertically */
            }

            .bigger-image {
              width: 50rem;
              image-rendering: pixelated;
            }
            
            .myButton {
              padding: 20px 40px; /* Increase padding to make the button larger */
              font-size: 20px; /* Increase font size */
              border: 4px solid #000; /* Stronger border with 4px thickness */
              border-radius: 10px; /* Optional: Adds rounded corners to your button */
              cursor: pointer; /* Changes the cursor to a pointer when you hover over the button */
            }`
          }
        </style>
        <div className="container">
          {client 
            ? (
              <AblyProvider client={client}>
                <DisplayImg />
              </AblyProvider>
            )
            : <img src={imgSrc} className="bigger-image" />            
          }
        </div>
        <br></br>
      </>
    );
  };
export default ButtonTimer;