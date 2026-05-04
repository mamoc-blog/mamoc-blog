'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import styles from './ThemeSwitch.module.scss';

const ICONS = {
  light: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  system: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none" />
    </svg>
  ),
} as const;

const THEMES = ['light', 'dark', 'system'] as const;

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className={styles.slot}>
      <div className={styles.pill} role="group" aria-label="Theme">
        {THEMES.map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.o} ${mounted && theme === t ? styles.on : ''}`}
            aria-pressed={mounted && theme === t}
            aria-label={`Theme: ${t}`}
            onClick={() => setTheme(t)}
          >
            <span className={styles.ic}>{ICONS[t]}</span>
            <span className={styles.lb}>{t === 'system' ? 'sys' : t}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
