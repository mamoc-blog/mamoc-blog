/**
 * Single source of truth for site-wide config strings the chrome surfaces.
 * Edit values here, not inside chrome components.
 */

export const SITE = {
  name: 'mamoc.blog',
  description:
    'Long-form posts on maths and simulation by Cameron Michie & Alexander Cheetham.',
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
