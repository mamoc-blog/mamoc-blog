'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import * as Ably from 'ably';
import { AblyProvider } from 'ably/react';
import { useTheme } from 'next-themes';
import DisplayImg from './DisplayImg';
import styles from './ButtonTimer.module.scss';

function triggerAzureFunction() {
  const url = 'https://spatial-ecology-no-users.azurewebsites.net/api/GameRunner?code=c41DwAgrjEXGAGHV-yVeWvkKVLbH_S0SEDnrsOFg8M5JAzFu2AzDvw==';

  fetch(url, { method: 'GET' })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then((data) => {
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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const imgSrc = isDark
    ? '/posts/spatial-ecology/press-start-dark.png'
    : '/posts/spatial-ecology/press-start.png';

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (count > 0) {
      timer = setTimeout(() => setCount(count - 1), 1000);
    } else {
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
      setIsActive(false);
      if (client) {
        client.close();
        setClient(null);
      }
      console.log('Client closed');
    } else {
      setIsActive(true);
      const next = new Ably.Realtime.Promise({ authUrl: '/api/ably-token-request', authMethod: 'POST' });
      setClient(next);
      console.log('Client opened');
      if (count === 0) {
        triggerAzureFunction();
        setCount(60);
      }
    }
  };

  return (
    <>
      <div className={styles.buttonContainer}>
        <button className={styles.myButton} onClick={handleClick}>
          {isActive ? `Hide (Countdown: ${count}s)` : 'Start'}
        </button>
      </div>

      <div className={styles.container}>
        {client ? (
          <AblyProvider client={client}>
            <DisplayImg />
          </AblyProvider>
        ) : (
          <Image
            src={imgSrc}
            alt="press start"
            width={800}
            height={600}
            className={styles.biggerImage}
            unoptimized
          />
        )}
      </div>
    </>
  );
};

export default ButtonTimer;
