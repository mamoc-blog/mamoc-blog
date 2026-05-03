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
    label: 'VOL.02 · APR \'26',
    number: '07',
    volume: 2,
  },

  status: {
    lastPush: { label: '2d ago', sha: '0a1f9c2' },
    subscribers: 1284,
    nextPost: { title: 'RK4 reaction-diffusion', eta: '03-12' },
    livePill: 'LIVE · neuroev sim',
  },

  social: {
    github: 'https://github.com/mamoc-blog',
    rss: '/rss.xml',
    atom: '/atom.xml',
    json: '/feed.json',
  },
} as const;

export type Site = typeof SITE;
