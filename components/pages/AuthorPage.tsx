import Image from 'next/image';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import type { Author } from '@/lib/authors';
import type { Post } from '@/lib/posts';
import styles from './AuthorPage.module.scss';

type Props = {
  author: Author;
  posts: Post[];
};

function dateLong(d: string) {
  try { return format(parseISO(d), 'MMMM dd, yyyy'); } catch { return d; }
}

export function AuthorPage({ author, posts }: Props) {
  const earliestYear = posts.length
    ? posts.map((p) => p.date).sort()[0]?.slice(0, 4) ?? ''
    : '';
  const firstName = author.name.split(' ')[0];
  const lastName = author.name.split(' ').slice(1).join(' ');

  return (
    <div className={styles.root}>
      <div className={styles.masthead}>
        <div className={styles.avatar}>
          <Image src={author.avatar} alt={author.name} width={240} height={240} />
          <div className={styles.tag}>CO-AUTHOR</div>
          <div className={styles.handle}>{author.handle}</div>
        </div>
        <div className={styles.intro}>
          <h1>{firstName}<br /><span className={styles.last}>{lastName}.</span></h1>
          <div className={styles.role}>{author.role}</div>
          <p className={styles.bio}>{author.bio}</p>
          <div className={styles.links}>
            {author.social.github && (
              <a href={author.social.github} target="_blank" rel="noreferrer">
                <span className={styles.u}>github /</span> {author.social.github.split('/').pop()}
              </a>
            )}
            {author.social.linkedin && (
              <a href={author.social.linkedin} target="_blank" rel="noreferrer">
                <span className={styles.u}>linkedin /</span> in/{author.slug}
              </a>
            )}
            {author.social.cv && (
              <a href={author.social.cv}><span className={styles.u}>cv.pdf</span></a>
            )}
          </div>
        </div>
      </div>

      <div className={styles.metaRow}>
        <div className={styles.m}>
          <div className={styles.n}>{posts.length}<span className={styles.u}> posts</span></div>
          <div className={styles.l}>Published</div>
        </div>
        <div className={styles.m}>
          <div className={styles.n}>{posts.reduce((s, p) => s + (p.topics?.length ?? 0), 0)}<span className={styles.u}> tags</span></div>
          <div className={styles.l}>Topics covered</div>
        </div>
        <div className={styles.m}>
          <div className={styles.n}>{earliestYear}</div>
          <div className={styles.l}>Active since</div>
        </div>
      </div>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          {author.currentlyBuilding && (
            <div className={styles.block}>
              <div className={styles.hl}>Currently building</div>
              <p>{author.currentlyBuilding}</p>
            </div>
          )}
          {author.toolbox && (
            <div className={styles.block}>
              <div className={styles.hl}>Toolbox</div>
              <div className={styles.row}><span>Language</span><b>{author.toolbox.language}</b></div>
              <div className={styles.row}><span>Plotting</span><b>{author.toolbox.plotting}</b></div>
              <div className={styles.row}><span>Sim kit</span><b>{author.toolbox.sims}</b></div>
            </div>
          )}
        </aside>
        <div className={styles.right}>
          <h3>Posts · {posts.length}</h3>
          {posts.map((p) => (
            <Link href={`/posts/${p.id}`} className={styles.post} key={p.id}>
              <div>
                <div className={styles.d}>{dateLong(p.date)}</div>
                <div className={styles.t}>{p.title}</div>
                {p.summary && <div className={styles.s}>{p.summary}</div>}
                <div className={styles.meta}>
                  {p.topics?.map((t) => `#${t}`).join(' · ')}
                </div>
              </div>
              {p.imageSrc && (
                <Image src={p.imageSrc} alt="" width={180} height={120} style={{ objectFit: 'cover' }} />
              )}
            </Link>
          ))}
          {posts.length === 0 && <p style={{ color: 'var(--color-gray)', padding: '16px 0' }}>No posts yet.</p>}
        </div>
      </div>
    </div>
  );
}
