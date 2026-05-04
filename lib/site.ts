/**
 * Single source of truth for site-wide config strings the chrome surfaces.
 * Edit values here, not inside chrome components.
 */

export const SITE = {
  name: 'mamoc.blog',
  description:
    'A working notebook by Cameron Michie & Alexander Cheetham. Long-form posts on math, simulation, and the data they produce.',
  buttondownUsername: 'mamoc',

  issue: {
    label: "VOL.02 · APR '26",
    number: '07',
    volume: 2,
  },

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
  // The fake "LIVE · neuroev sim" pill and "● online" indicator have been
  // removed from chrome — there's no live source for either on a static site.
  // Build-time git deploy info is wired via NEXT_PUBLIC_GIT_* (see
  // next.config.mjs) and consumed in the chrome directly.
} as const;

export type Site = typeof SITE;
