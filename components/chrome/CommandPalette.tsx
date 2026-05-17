'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';
import styles from './CommandPalette.module.scss';

export type PalettePost = {
  id: string;
  title: string;
  summary?: string;
  author?: string;
  date?: string;
  topics?: string[];
};

type Props = {
  posts: PalettePost[];
  open: boolean;
  onClose: () => void;
};

export function CommandPalette({ posts, open, onClose }: Props) {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => p.topics?.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [posts]);

  const navigate = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(o) => !o && onClose()}
      label="Command palette"
      className={styles.dialog}
      overlayClassName={styles.overlay}
      contentClassName={styles.content}
    >
      <div className={styles.hd}>
        <div className={styles.pfx}>
          <span className={styles.gt}>›</span>find
        </div>
        <Command.Input placeholder="Search posts, authors, topics…" className={styles.input} autoFocus />
        <div className={styles.hint}>
          <span className={styles.k}>↑↓</span>
          <span className={styles.k}>↵</span>
          <span className={styles.k}>esc</span>
        </div>
      </div>

      <Command.List className={styles.list}>
        <Command.Empty className={styles.empty}>No results.</Command.Empty>

        {posts.length > 0 && (
          <Command.Group heading={`Posts · ${posts.length}`} className={styles.grp}>
            {posts.map((p) => (
              <Command.Item
                key={p.id}
                value={`post ${p.title} ${p.summary ?? ''} ${p.author ?? ''} ${(p.topics ?? []).join(' ')}`}
                onSelect={() => navigate(`/posts/${p.id}`)}
                className={styles.row}
              >
                <div className={styles.g}>#</div>
                <div>
                  <div className={styles.t}>{p.title}</div>
                  <div className={styles.s}>
                    {[p.author, p.date].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {p.topics?.[0] && <div className={styles.tag}>{p.topics[0]}</div>}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {topics.length > 0 && (
          <Command.Group heading={`Topics · ${topics.length}`} className={styles.grp}>
            {topics.map(([name, count]) => (
              <Command.Item
                key={name}
                value={`topic ${name}`}
                onSelect={() => navigate(`/archive?topic=${encodeURIComponent(name)}`)}
                className={styles.row}
              >
                <div className={styles.g}>§</div>
                <div>
                  <div className={styles.t}>#{name}</div>
                  <div className={styles.s}>{count} {count === 1 ? 'post' : 'posts'}</div>
                </div>
                <div className={styles.tag}>topic</div>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Actions · 2" className={styles.grp}>
          <Command.Item
            value="action toggle theme"
            onSelect={() => {
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              onClose();
            }}
            className={styles.row}
          >
            <div className={styles.g}>›</div>
            <div>
              <div className={styles.t}>Toggle theme</div>
              <div className={styles.s}>{resolvedTheme === 'dark' ? 'dark → light' : 'light → dark'}</div>
            </div>
            <div className={styles.tag}>⌘⇧L</div>
          </Command.Item>
          <Command.Item
            value="action open archive"
            onSelect={() => navigate('/archive')}
            className={styles.row}
          >
            <div className={styles.g}>›</div>
            <div>
              <div className={styles.t}>Browse archive</div>
              <div className={styles.s}>All posts by year + topic</div>
            </div>
            <div className={styles.tag}>nav</div>
          </Command.Item>
        </Command.Group>
      </Command.List>

      <div className={styles.foot}>
        <div>
          <span className={styles.k}>↵</span> open
        </div>
      </div>
    </Command.Dialog>
  );
}
