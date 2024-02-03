import React from "react";
import {useState, useEffect} from "react";
import * as Ably from 'ably';
import {AblyProvider} from "ably/react";
import DisplayImg from "./DisplayImg";

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
        <button onClick={handleClick}>
          {isActive ? `Hide (Countdown: ${count}s)` : 'Start'}
        </button>
        <style>
          {
            `.container {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh; /* Adjust this value as needed */
            }

            .bigger-image {
              width: 50rem;
              image-rendering: pixelated;
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
            : <img src={"/images/press-start.png"} className="bigger-image" />
          }
        </div>
      </>
    );
  };
export default ButtonTimer;