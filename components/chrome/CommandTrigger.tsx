'use client';

import { useCommandPalette } from './CommandPaletteRoot';
import styles from './CommandTrigger.module.scss';

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export function CommandTrigger() {
  const { open } = useCommandPalette();
  return (
    <button
      type="button"
      className={styles.cmd}
      onClick={open}
      aria-label="Open search palette"
      aria-keyshortcuts="Meta+K"
    >
      <span className={styles.mobileIcon}><SearchIcon /></span>
      <span className={styles.p}>›</span>
      <span className={styles.sep}>find</span>
      <span className={styles.placeholder}>entropy, WFC, neuroev, Lotka-Volterra…</span>
      <span className={styles.k}>⌘K</span>
    </button>
  );
}
