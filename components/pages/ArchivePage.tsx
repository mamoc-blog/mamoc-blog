'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import type { Post } from '@/lib/posts';
import styles from './ArchivePage.module.scss';

type Props = {
  posts: Post[];
  topicCounts: Array<[string, number]>;
};

function shortDate(d: string) {
  try { return format(parseISO(d), 'MMM dd'); } catch { return d; }
}

function readingTime(): string {
  return '~12 min';
}

export function ArchivePage({ posts, topicCounts }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlTopic = searchParams.get('topic');

  // Local state stays the source of truth for rendering so chip clicks update
  // synchronously without waiting for a router round-trip. We mirror it to the
  // URL via router.replace (so deep-linking + the command palette's
  // `/archive?topic=…` navigation works), and in turn sync FROM the URL when
  // it changes from outside this component (e.g. the palette while we're
  // already mounted on /archive, or back/forward).
  const [activeTopic, setActiveTopicState] = useState<string | null>(urlTopic);

  useEffect(() => {
    setActiveTopicState(urlTopic);
  }, [urlTopic]);

  const setActiveTopic = (next: string | null) => {
    setActiveTopicState(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next) params.set('topic', next);
    else params.delete('topic');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const visible = useMemo(
    () => (activeTopic ? posts.filter((p) => p.topics?.includes(activeTopic)) : posts),
    [posts, activeTopic],
  );

  const byYear = useMemo(() => {
    const groups = new Map<string, Post[]>();
    visible.forEach((p) => {
      const year = p.date.slice(0, 4);
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(p);
    });
    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [visible]);

  return (
    <div className={styles.root}>
      <div className={styles.head}>
        <h2>The <span className={styles.slash}>/</span> archive.</h2>
        <p className={styles.lede}>
          All posts, organised by year. Filter by topic on the left.
        </p>
      </div>

      <div className={styles.filters}>
        <button
          type="button"
          className={`${styles.chip} ${activeTopic === null ? styles.on : ''}`}
          onClick={() => setActiveTopic(null)}
        >
          all <span className={styles.n}>{posts.length}</span>
        </button>
        {topicCounts.map(([name, count]) => (
          <button
            key={name}
            type="button"
            className={`${styles.chip} ${activeTopic === name ? styles.on : ''}`}
            onClick={() => setActiveTopic(activeTopic === name ? null : name)}
          >
            #{name} <span className={styles.n}>{count}</span>
          </button>
        ))}
      </div>

      <div className={styles.split}>
        <aside className={styles.side}>
          <div className={styles.grp}>
            <div className={styles.hd}>Authors</div>
            <Link href="/authors/alex-cheetham">· Alex Cheetham</Link>
            <Link href="/authors/cameron-michie">· Cameron Michie</Link>
          </div>
        </aside>

        <div>
          {byYear.length === 0 && <p className={styles.empty}>No posts match #{activeTopic}.</p>}
          {byYear.map(([year, ps]) => (
            <div className={styles.year} key={year}>
              <div className={styles.yn}>
                {year}
                <span className={styles.sub}>{ps.length} {ps.length === 1 ? 'post' : 'posts'}</span>
              </div>
              <div className={styles.items}>
                {ps.map((p) => (
                  <Link key={p.id} href={`/posts/${p.id}`} className={styles.it}>
                    <div className={styles.d}>{shortDate(p.date)}</div>
                    <div>
                      <div className={styles.t}>{p.title}</div>
                      {p.topics?.[0] && <div className={styles.tg}>#{p.topics[0]}</div>}
                    </div>
                    <div className={styles.a}>{p.author}</div>
                    <div className={styles.rt}>{readingTime()}</div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
