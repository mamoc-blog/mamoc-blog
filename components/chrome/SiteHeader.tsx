'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useCommandPalette } from './CommandPaletteRoot';
import styles from './SiteHeader.module.scss';

function Breadcrumb({ pathname }: { pathname: string }) {
  if (pathname === '/') {
    return (
      <span className={styles.cur}>~/</span>
    );
  }
  const parts = pathname.split('/').filter(Boolean);
  return (
    <>
      <span className={styles.sep}>~/</span>
      {parts.map((p, i) => (
        <span key={i}>
          <span className={i === parts.length - 1 ? styles.cur : undefined}>{p}</span>
          {i < parts.length - 1 && <span className={styles.sep}>/</span>}
        </span>
      ))}
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname() ?? '/';
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { open } = useCommandPalette();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Frontpage renders its own editorial masthead (.hdr2) — skip the persistent
  // header there to avoid a doubled brand mark.
  if (pathname === '/') return null;

  const isDark = mounted && resolvedTheme === 'dark';
  const logoSrc = isDark ? '/images/mamoc-text-dark.png' : '/images/mamoc-text.png';

  const themes = ['light', 'dark', 'system'] as const;

  return (
    <header className={styles.root}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="mamoc home">
          <Image src={logoSrc} alt="mamoc" width={120} height={22} priority />
          <div className={styles.bc} aria-hidden="true">
            <Breadcrumb pathname={pathname} />
          </div>
        </Link>

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

        <div className={styles.right}>
          <div className={styles.theme} role="group" aria-label="Theme">
            {themes.map((t) => (
              <button
                key={t}
                type="button"
                className={`${styles.o} ${mounted && theme === t ? styles.on : ''}`}
                aria-pressed={mounted && theme === t}
                onClick={() => setTheme(t)}
              >
                {t === 'system' ? 'sys' : t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
