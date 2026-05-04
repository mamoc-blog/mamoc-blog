'use client';

import { useCommandPalette } from './CommandPaletteRoot';
import styles from './CommandTrigger.module.scss';

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
      <span className={styles.p}>›</span>
      <span className={styles.sep}>find</span>
      <span className={styles.placeholder}>entropy, WFC, neuroev, Lotka-Volterra…</span>
      <span className={styles.k}>⌘K</span>
    </button>
  );
}
