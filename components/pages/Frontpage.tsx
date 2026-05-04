'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { type Issue } from '@/lib/site';
import { CommandTrigger } from '@/components/chrome/CommandTrigger';
import styles from './Frontpage.module.scss';

export type FrontpagePost = {
  id: string;
  title: string;
  date: string;
  summary?: string;
  author?: string;
  imageSrc?: string;
  topics?: string[];
  readingTime?: string;
  featured?: boolean;
};

type Props = { posts: FrontpagePost[]; issue: Issue };

function dateLong(d: string) {
  try { return format(parseISO(d), 'MMMM dd, yyyy'); } catch { return d; }
}

export function Frontpage({ posts, issue }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && resolvedTheme === 'dark';
  const logoSrc = isDark ? '/images/mamoc-text-dark.png' : '/images/mamoc-text.png';

  if (posts.length === 0) {
    return <div className={styles.root}><p style={{ padding: 48 }}>No posts yet.</p></div>;
  }

  const hero = posts.find((p) => p.featured) ?? posts[0]!;
  const rest = posts.filter((p) => p.id !== hero.id);

  return (
    <div className={styles.root}>
      <header className={styles.hdr2}>
        <div className={styles.ml}>
          <Image src={logoSrc} alt="mamoc" width={140} height={22} />
          <span className={styles.dt}>{issue.label}</span>
        </div>
        <nav>
          <Link href="/" className={styles.active}>Index</Link>
          <Link href="/archive">Archive</Link>
          <Link href="/authors/alex-cheetham">Authors</Link>
          <Link href="/about">About</Link>
          <CommandTrigger />
        </nav>
      </header>

      <section className={styles.masthead}>
        <h1>Notes <span className={styles.amp}>&amp;</span><br />simulations.</h1>
        <div className={styles.issue}>
          Issue<span className={styles.big}>{issue.number}</span>volume {issue.volume}
        </div>
        <p className={styles.tag}>
          Long-form articles on mathematical and technical topics, with a focus on generating data to create interesting visuals. Written in the first person by Cameron Michie and Alexander Cheetham — often with an interactive component at the bottom of each post.
        </p>
      </section>

      <section className={styles.hero2}>
        <Link href={`/posts/${hero.id}`} className={styles.main}>
          <div className={styles.lbl}>Featured · Editor&apos;s pick</div>
          {hero.imageSrc && (
            <div className={styles.img}>
              <Image src={hero.imageSrc} alt={hero.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1200px) 100vw, 800px" />
            </div>
          )}
          <h2>{hero.title}</h2>
          <div className={styles.meta}>
            <b>{hero.author}</b>
            <span>{dateLong(hero.date)}</span>
            {hero.readingTime && <span>{hero.readingTime} read</span>}
          </div>
          {hero.summary && <p className={styles.sum}>{hero.summary}</p>}
        </Link>

        <aside className={styles.side}>
          <div className={styles.t}>Also in this issue</div>
          {rest.slice(0, 4).map((p, i) => (
            <Link href={`/posts/${p.id}`} className={styles.it} key={p.id}>
              <div className={styles.th}>
                {p.imageSrc && <Image src={p.imageSrc} alt="" width={56} height={56} style={{ objectFit: 'cover' }} />}
              </div>
              <div>
                <div className={styles.n}>0{i + 2} · {(p.topics?.[0] ?? 'note').toUpperCase()}</div>
                <div className={styles.h}>{p.title}</div>
              </div>
            </Link>
          ))}
        </aside>
      </section>

      <div className={styles.indexTitle}>
        <h3>The Index · All Posts</h3>
        <div className={styles.n}>{posts.length} entries</div>
      </div>
      <div className={styles.indx}>
        {posts.map((p, i) => (
          <Link href={`/posts/${p.id}`} className={styles.r} key={p.id}>
            <div className={styles.n}>{String(i + 1).padStart(2, '0')}</div>
            <div>
              <div className={styles.t}>{p.title}</div>
              {p.topics && p.topics.length > 0 && (
                <div className={styles.a}>{p.topics.map((t) => '#' + t).join(' · ')}</div>
              )}
            </div>
            <div className={styles.a}>{p.author}</div>
            <div className={styles.d}>{dateLong(p.date)}</div>
            {p.readingTime && <div className={styles.rt}>{p.readingTime}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
