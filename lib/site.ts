/**
 * Single source of truth for site-wide config strings the chrome surfaces.
 * Edit values here, not inside chrome components.
 */

export const SITE = {
  name: 'mamoc.blog',
  description:
    'A working notebook by Cameron Michie & Alexander Cheetham. Long-form posts on math, simulation, and the data they produce.',
  buttondownUsername: 'mamoc',
  launchYear: 2023,

  social: {
    github: 'https://github.com/mamoc-blog',
    rss: '/rss.xml',
    atom: '/atom.xml',
    json: '/feed.json',
  },

  // TODO: replace placeholders with real wiring.
  //   - subscribers: Buttondown API call at build time (needs BUTTONDOWN_API_KEY env)
  //   - nextPost: a `status: 'in-progress'` flag on a post's metadata, or a
  //     dedicated `lib/upcoming.ts` registry
} as const;

export type Site = typeof SITE;

const MONTH_ABBR = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export type Issue = {
  /** Two-digit total post count, e.g. "08". */
  number: string;
  /** Years-since-launch (1-indexed), e.g. 4 for 2026 if launched 2023. */
  volume: number;
  /** Magazine-style banner string, e.g. "VOL.04 · MAY '26". Tracks the most
   *  recent post's date so it advances when content ships, not on rebuilds. */
  label: string;
};

/** Derive issue metadata from the post list. The label's date follows the
 *  most recent post; volume counts years since SITE.launchYear (year 1 = launch year). */
export function getIssue(posts: { date: string }[]): Issue {
  const latest = posts.reduce<Date | null>((acc, p) => {
    const d = new Date(p.date);
    if (Number.isNaN(d.valueOf())) return acc;
    return acc && acc > d ? acc : d;
  }, null) ?? new Date();
  const volume = latest.getUTCFullYear() - SITE.launchYear + 1;
  const number = String(posts.length).padStart(2, '0');
  const label = `VOL.${String(volume).padStart(2, '0')} · ${MONTH_ABBR[latest.getUTCMonth()]} '${String(latest.getUTCFullYear()).slice(-2)}`;
  return { number, volume, label };
}
