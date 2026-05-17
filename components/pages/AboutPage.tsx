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
        A blog project started by {joinNames(names)} — long-form articles on
        mathematical and technical topics, focused on generating data that produces interesting
        visuals.
      </p>

      <div className={styles.grid}>
        <div>
          <h4>What this is</h4>
          <p>
            Every post starts with an algorithm or a derivation, builds a simulation to probe it,
            and ends with an interactive you can actually play with. Think of it as a shared
            research notebook that we happen to publish.
          </p>
          <p>
            We lean academic on the math, casual on the prose, and obsessive on the interactive
            bits. If a footnote is missing from a claim, tell us.
          </p>
          <h4 style={{ marginTop: 28 }}>Why</h4>
          <p>
            Writing the posts is how we understand our own work. Publishing them forces us to
            explain properly. The blog is entirely a side project — no sponsors, no ads, no
            tracking.
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
        <p>We write the posts we wish existed when we were first trying to figure these things out.</p>
        <cite>— the mamoc notebook, forever-draft</cite>
      </div>
    </div>
  );
}
