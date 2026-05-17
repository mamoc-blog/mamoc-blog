import { format, parseISO } from 'date-fns';
import type { Colophon } from '@/lib/colophon';
import styles from './AboutPage.module.scss';

function joinNames(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
}

function safeDate(iso: string | null): string | null {
  if (!iso) return null;
  try { return format(parseISO(iso), 'MMM d, yyyy'); } catch { return iso; }
}

function safePushed(unixSec: string | null): string | null {
  if (!unixSec) return null;
  const n = Number(unixSec);
  if (!Number.isFinite(n) || n <= 0) return null;
  try { return format(new Date(n * 1000), 'MMM d, yyyy'); } catch { return null; }
}

function hostname(url: string): string {
  try { return new URL(url).host + new URL(url).pathname.replace(/\/$/, ''); }
  catch { return url; }
}

export function AboutPage({ colophon }: { colophon: Colophon }) {
  const names = colophon.authors.map((a) => a.name);
  const latestDate = safeDate(colophon.stats.latestDate);
  const pushedDate = safePushed(colophon.git.pushedAt);

  return (
    <div className={styles.root}>
      <h1>About <span className={styles.slash}>/</span> mamoc.</h1>
      <p className={styles.sub}>
        A blog by {joinNames(names)}. Long-form posts on maths and adjacent things — usually started because one of us wanted to understand something better.
      </p>

      <div className={styles.grid}>
        <div>
          <h4>What this is</h4>
          <p>
            Most posts start with something we read and didn&apos;t fully get, work through the maths, and end with an interactive you can poke at. Less a publication, more a notebook we left the lid off.
          </p>
          <p>
            The maths is as careful as we can make it. The prose, less so. If we&apos;ve got something wrong, tell us.
          </p>
          <h4 style={{ marginTop: 28 }}>Why</h4>
          <p>
            Writing things down is how we actually learn them — explaining something makes it obvious when we don&apos;t really understand it. Statically generated, no client-side trackers, no email gates, no engagement metrics. Source is on GitHub.
          </p>
        </div>
        <div>
          <h4>By the numbers</h4>
          <dl className={styles.tech}>
            <dt>posts</dt><dd>{colophon.stats.posts}</dd>
            <dt>authors</dt><dd>{colophon.stats.authors}</dd>
            <dt>topics</dt><dd>{colophon.stats.topics}</dd>
            <dt>since</dt><dd>{colophon.stats.since} ({colophon.stats.activeYears}y)</dd>
            {latestDate && <><dt>latest</dt><dd>{latestDate}</dd></>}
          </dl>

          <h4 style={{ marginTop: 28 }}>Colophon</h4>
          <dl className={styles.tech}>
            {colophon.stack.length > 0 && (
              <>
                <dt>stack</dt>
                <dd>{colophon.stack.map((s) => `${s.label} ${s.version}`).join(' · ')}</dd>
              </>
            )}
            {colophon.fonts.length > 0 && (
              <>
                <dt>type</dt>
                <dd>{colophon.fonts.join(' · ')}</dd>
              </>
            )}
            {colophon.math && <><dt>math</dt><dd>{colophon.math}</dd></>}
            <dt>hosted</dt><dd>{colophon.hosting}</dd>
            {colophon.repo && (
              <>
                <dt>code</dt>
                <dd><a href={colophon.repo}>{hostname(colophon.repo)}</a></dd>
              </>
            )}
            {colophon.license && <><dt>licence</dt><dd>{colophon.license}</dd></>}
            {colophon.git.sha && (
              <>
                <dt>build</dt>
                <dd>{colophon.git.sha}{pushedDate ? ` · ${pushedDate}` : ''}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      <div className={styles.pull}>
        <p>vibes based articles that make cam happy</p>
      </div>
    </div>
  );
}
