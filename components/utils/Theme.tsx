import React, { useState, useEffect, useContext } from 'react';
import cs from 'classnames';
import style from './Theme.module.scss'; // Adjust the path as needed

// Simplified context interface
interface ISettingsContext {
  darkTheme: boolean;
  toggleDarkTheme: () => void;
}

const defaultCtx: ISettingsContext = {
  darkTheme: false, // Default theme setting
  toggleDarkTheme: () => { },
};

export const SettingsContext = React.createContext<ISettingsContext>(defaultCtx);
export const useSettingsContext = () => useContext<ISettingsContext>(SettingsContext);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [darkTheme, setDarkTheme] = useState(defaultCtx.darkTheme);

  const toggleDarkTheme = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  useEffect(() => {
    // Initial load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkTheme(true);
    } else {
      setDarkTheme(false);
    }
  }, []);

  useEffect(() => {
    if (darkTheme) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkTheme]);

  return (
    <SettingsContext.Provider value={{ darkTheme, toggleDarkTheme }}>
      <div className={cs(style.root_wrapper)}>{children}</div>
    </SettingsContext.Provider>
  );
}
