'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { AUTHORS } from '@/lib/authors';
import styles from './AuthorsMenu.module.scss';

const HOVER_CLOSE_DELAY_MS = 120;

export function AuthorsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openNow = () => {
    cancelClose();
    setOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  const authors = Object.values(AUTHORS);

  return (
    <div
      className={styles.root}
      ref={rootRef}
      onMouseEnter={openNow}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
        onFocus={openNow}
      >
        Authors
        <span className={styles.caret} aria-hidden="true">▾</span>
      </button>

      {/* Mobile bottom-sheet backdrop. Hidden on desktop via CSS; on touch
          viewports it darkens the page behind the sheet and dismisses on tap,
          matching the CommandPalette dialog behaviour. */}
      <div
        className={`${styles.backdrop} ${open ? styles.open : ''}`}
        aria-hidden="true"
        onClick={() => setOpen(false)}
      />

      <div
        className={`${styles.panel} ${open ? styles.open : ''}`}
        role="menu"
        aria-hidden={!open}
      >
        <div className={styles.label}>
          <span>Authors</span>
          <span className={styles.count}>· {authors.length}</span>
        </div>
        {authors.map((a) => (
          <Link
            key={a.slug}
            href={`/authors/${a.slug}`}
            className={styles.item}
            role="menuitem"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            <div className={styles.avatar}>
              <Image src={a.avatar} alt="" width={44} height={44} />
            </div>
            <div className={styles.meta}>
              <div className={styles.name}>{a.shortName ?? a.name}</div>
              <div className={styles.role}>{a.role.toLowerCase()}</div>
            </div>
            <div className={styles.arrow} aria-hidden="true">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
