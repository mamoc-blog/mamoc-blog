'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { getAuthorByName } from '@/lib/authors';
import type { PostMetadata } from '@/lib/posts';
import styles from './PostSummary.module.scss';

type Props = {
  slug: string;
  metadata: PostMetadata;
};

type TocEntry = { id: string; text: string; depth: number };

function dateLong(d: string) {
  try { return format(parseISO(d), 'MMMM dd, yyyy'); } catch { return d; }
}

export function PostSummary({ slug, metadata }: Props) {
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>('article h2, article h3'),
    ).filter((h) => h.id);
    setToc(
      headings.map((h) => ({
        id: h.id,
        text: h.textContent ?? '',
        depth: h.tagName === 'H3' ? 2 : 1,
      })),
    );

    if (headings.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 },
    );
    headings.forEach((h) => obs.observe(h));
    observerRef.current = obs;
    return () => obs.disconnect();
  }, [slug]);

  const author = getAuthorByName(metadata.author);
  const topic = metadata.topics?.[0];

  return (
    <div className={styles.root}>
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <Link href="/">~/mamoc</Link>
        <span className={styles.sep}>/</span>
        <Link href="/archive">posts</Link>
        {topic && (
          <>
            <span className={styles.sep}>/</span>
            <span className={styles.tag}>#{topic}</span>
          </>
        )}
        <span className={styles.sep}>/</span>
        <span>{slug}</span>
      </nav>

      <div className={styles.kicker}>
        <span className={styles.dot} aria-hidden="true" />
        <span>Research Post · {metadata.date.slice(0, 4)}</span>
      </div>

      <h1 className={styles.ti}>{metadata.title}</h1>

      <div className={styles.by}>
        {author && (
          <Link href={`/authors/${author.slug}`} className={styles.author}>
            <Image src={author.avatar} alt={author.name} width={44} height={44} />
            <div>
              <div className={styles.na}>{author.name}</div>
              <div className={styles.ro}>{author.role}</div>
            </div>
          </Link>
        )}
        <div />
        <div className={styles.stats}>
          <div><b>{dateLong(metadata.date)}</b>Published</div>
          <div><b>~12 min</b>Reading</div>
          <div><b>{toc.length}</b>Sections</div>
        </div>
      </div>

      <div className={styles.body}>
        <div>
          <span className={styles.abstractLbl}>Abstract</span>
          <p className={styles.abstract}>{metadata.summary}</p>
        </div>
        <aside className={styles.aside}>
          {metadata.imageSrc && (
            <div className={styles.cover}>
              <Image src={metadata.imageSrc} alt={metadata.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1200px) 100vw, 500px" />
            </div>
          )}
          <div className={styles.tocLbl}>
            <span>Contents</span>
            <span>{toc.length} {toc.length === 1 ? 'section' : 'sections'}</span>
          </div>
          <nav className={styles.toc} aria-label="Table of contents">
            {toc.length === 0 && <div className={styles.tocEmpty}>—</div>}
            {toc.map((entry, i) => (
              <a
                key={entry.id}
                href={`#${entry.id}`}
                className={`${styles.node} ${entry.depth === 2 ? styles.depth2 : ''} ${activeId === entry.id ? styles.active : ''}`}
              >
                <span className={styles.num}>{entry.depth === 2 ? '' : `${i + 1}.0`}</span>
                <span>{entry.text}</span>
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
