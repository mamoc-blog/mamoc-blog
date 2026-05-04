'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { CommandTrigger } from './CommandTrigger';
import { ThemeSwitch } from './ThemeSwitch';
import styles from './SiteHeader.module.scss';

type Props = { issueLabel: string };

export function SiteHeader({ issueLabel }: Props) {
  const pathname = usePathname() ?? '/';
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Frontpage renders its own editorial masthead (.hdr2) — skip the persistent
  // header there to avoid a doubled brand mark.
  if (pathname === '/') return null;

  const isDark = mounted && resolvedTheme === 'dark';
  const logoSrc = isDark ? '/images/mamoc-text-dark.png' : '/images/mamoc-text.png';

  return (
    <header className={styles.root}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="mamoc home">
          <Image src={logoSrc} alt="mamoc" width={140} height={22} priority />
          <span className={styles.dt}>{issueLabel}</span>
        </Link>

        <div className={styles.tools}>
          <CommandTrigger />
          <ThemeSwitch />
        </div>
      </div>
    </header>
  );
}
