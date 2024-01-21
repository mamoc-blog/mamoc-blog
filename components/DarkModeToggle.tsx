import React from 'react';
import { useSettingsContext } from './Theme';
import Image from 'next/image';

export const DarkModeToggle = () => {
  const { darkTheme, toggleDarkTheme } = useSettingsContext();

  return (
    <button onClick={toggleDarkTheme} style={{ border: 'none', background: 'none', zIndex:2 }}>
      {darkTheme ? (
        <>
          <Image
            src="/images/dark-mode.png" // Path to your light mode image
            alt="Switch to Light Mode"
            width={100}  // Adjust size as needed
            height={40} // Adjust size as needed
          />
        </>
      ) : (
        <>
          <Image
            src="/images/light-mode.png" // Path to your dark mode image
            alt="Switch to Dark Mode"
            width={100}  // Adjust size as needed
            height={40} // Adjust size as needed
          />
        </>
      )}
    </button>
  );
};
