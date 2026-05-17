/**
 * Single source of truth for author profiles.
 * Replaces the duplicated ternaries that used to live inside index.js +
 * posts/[id].js. Add a new author by adding a key here.
 */

export type Author = {
  slug: string;
  name: string;          // matches the `author` field in post frontmatter
  shortName?: string;    // casual display name for marketing copy; falls back to `name`
  handle: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    github?: string;
    linkedin?: string;
    cv?: string;
  };
  toolbox?: { language: string; plotting: string; sims: string };
  currentlyBuilding?: string;
};

export const AUTHORS = {
  'alex-cheetham': {
    slug: 'alex-cheetham',
    name: 'Alex Cheetham',
    shortName: 'Alex Cheetham',
    handle: '@alex.cheetham',
    role: 'Maths · Machine Learning · Simulation',
    bio: "Posts on the topics I've read about and decided I want to understand better. Hopefully, some of it is interesting.",
    avatar: '/images/alex.png',
    social: {
      github: 'https://github.com/alexander-cheetham',
      linkedin: 'https://www.linkedin.com/in/alexandercheetham/',
    },
    toolbox: { language: 'TypeScript · Python', plotting: 'd3 · matplotlib', sims: 'p5 · WebGPU' },
    currentlyBuilding: 'Website overhaul.',
  },
  'cameron-michie': {
    slug: 'cameron-michie',
    name: 'Cameron Michie',
    shortName: 'Cam Michie',
    handle: '@cameron.michie',
    role: 'spatial ecology · finance · agent-based modeling',
    bio: "I'm a sick lad, i love maths and im a qualified chartered slutty A",
    avatar: '/images/cam.png',
    social: {
      github: 'https://github.com/cameron-michie',
      linkedin: 'https://www.linkedin.com/in/cameron-michie/',
      cv: '/cv/cam.pdf',
    },
    toolbox: { language: 'Python · R', plotting: 'matplotlib · ggplot', sims: 'NetLogo · Mesa' },
    currentlyBuilding: 'A reaction-diffusion sandbox with adjustable kinetics and live phase-portrait readout.',
  },
} satisfies Record<string, Author>;

export const AUTHOR_SLUGS = Object.keys(AUTHORS);

export function getAuthorByName(name: string | undefined): Author | undefined {
  if (!name) return undefined;
  return Object.values(AUTHORS).find((a) => a.name === name);
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return (AUTHORS as Record<string, Author>)[slug];
}
