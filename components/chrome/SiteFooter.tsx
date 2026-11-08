'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import styles from './SiteFooter.module.scss';

const GIT_SHA = process.env.NEXT_PUBLIC_GIT_SHA;

export function SiteFooter() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isLight = mounted && resolvedTheme === 'light';

  return (
    <footer className={`${styles.root} ${isLight ? styles.light : ''}`}>
      <div className={styles.sig} aria-hidden="true">
        ma<span className={styles.dot}>·</span>moc<span className={styles.cur}>_</span>
      </div>

      <div className={styles.grid}>
        <div className={`${styles.col} ${styles.main}`}>
          <div className={styles.h}>{SITE.name}</div>
          <p>{SITE.description}</p>
        </div>
        <div className={styles.col}>
          <div className={styles.h}>Read</div>
          <Link href="/">Latest</Link>
          <Link href="/archive">Archive</Link>
        </div>
        <div className={styles.col}>
          <div className={styles.h}>Authors</div>
          <Link href="/authors/alex-cheetham">Alex Cheetham</Link>
          <Link href="/authors/cameron-michie">Cameron Michie</Link>
        </div>
        <div className={styles.col}>
          <div className={styles.h}>Elsewhere</div>
          <a href={SITE.social.github} target="_blank" rel="noreferrer">GitHub ↗</a>
          <a href={`https://buttondown.com/${SITE.buttondownUsername}`} target="_blank" rel="noreferrer">Buttondown ↗</a>
        </div>
      </div>

      <div className={styles.strip}>
        <div className={styles.l}>
          <span>© {new Date().getFullYear()} {SITE.name}</span>
          {/* TODO: post licence — confirm CC-BY-4.0 (or pick another) and add a
              LICENSE-content file to back the claim before re-surfacing it here. */}
        </div>
        <div className={styles.r}>
          {GIT_SHA && <span>{GIT_SHA}</span>}
        </div>
      </div>
    </footer>
  );
}
