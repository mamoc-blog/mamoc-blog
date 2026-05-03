# mamoc.blog

Long-form research blog by Cameron Michie & Alexander Cheetham — math, simulation, and the data they produce.

## Stack

- Next.js 16 · App Router · TypeScript
- MDX via `@next/mdx` (build-time, file-based) — posts live in `content/posts/*.mdx`
- Sass + CSS Modules (component-scoped) on a token-driven design system in `styles/global.scss`
- `next-themes` for light/dark/system theme · `cmdk` for the ⌘K palette
- KaTeX (math) · `rehype-prism-plus` (code) · Ably (realtime sims)
- Self-hosted Google Fonts via `next/font/google` (Fira Code + Source Serif 4)

## Prerequisites

- Node.js 18+
- npm

## Install

```bash
git clone https://github.com/mamoc-blog/mamoc-blog.git
cd mamoc-blog
npm install
```

## Run

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

## Routes

| Path | Notes |
|---|---|
| `/` | Frontpage (zine layout, hero + sidebar + numbered index) |
| `/posts/[slug]` | Per-post page — masthead + MDX body + subscribe block |
| `/archive` | All posts, organised by year, filterable by topic |
| `/authors/[slug]` | Author profile + their posts |
| `/about` | About + colophon |
| `/api/ably-token-request` | Ably token endpoint for the spatial-ecology sim |

## Authoring a post

1. Drop a new `.mdx` file into `content/posts/<slug>.mdx`.
2. Top of the file: an `export const metadata = {}` block (NOT YAML frontmatter — `@next/mdx` reads ESM exports). Required: `title`, `date` (`YYYY-MM-DD`), `summary`, `author`. Optional: `imageSrc`, `topics: []`, `featured: true`, `math: true`.
3. Add a blank line between the metadata export and the first markdown content.
4. Body is plain Markdown plus any of the components mapped in `mdx-components.tsx`: `Image`, `Link`, `Figure`, `ButtonTimer`, `LotkaVolterra`, `RK4ReactionDiffusion`, `CharacteristicLengthCalculator`, `WFCCONTAINER`. The interactive ones are wrapped in `dynamic({ ssr: false })` because they touch browser APIs at import.

The post automatically appears in the Frontpage index, the Archive, and (filtered by `author`) on the relevant `/authors/[slug]` page.

## Adding an author

Edit `lib/authors.ts`, add a new key under `AUTHORS`. The author's profile page at `/authors/<slug>` is built automatically from `generateStaticParams`.

## Theming

Theme state is managed by `next-themes` with three modes (`light`, `dark`, `system`). The toggle lives in `SiteHeader`'s segmented control. Tokens flip via `[data-theme="dark"]` selectors in `styles/global.scss`.

## Environment

- `ABLY_API_KEY` — required for `/api/ably-token-request` (spatial-ecology sim). Set in `.env.local`. Never committed.

## Project layout

```
app/                    App Router routes
  layout.tsx            root: fonts, theme, persistent chrome
  page.tsx              /
  about/page.tsx
  archive/page.tsx
  authors/[slug]/page.tsx
  posts/[slug]/{page,layout}.tsx
  api/ably-token-request/route.ts
components/
  chrome/               SiteHeader, SiteFooter, CommandPalette
  pages/                Frontpage, ArchivePage, AuthorPage, AboutPage
  post/                 PostSummary masthead
  marketing/            SubscribeBlock
  theme/                next-themes wrapper
  interactive/          chart / sim components (with _dynamic/ wrappers)
  frames/, WFC_components/  miscellaneous content components
content/posts/          .mdx posts
lib/
  posts.ts              slug + metadata reads
  authors.ts            author registry
  site.ts               site-wide config strings
styles/
  global.scss           tokens + element defaults
  variables.scss        legacy spacing/breakpoint Sass vars
  post.module.scss      legacy interactive-component styles
mdx-components.tsx      MDX component map (server, imports client wrappers)
next.config.mjs         createMDX with Turbopack-compatible string plugins
```

## Notes

- Turbopack is the default builder in Next 16; remark/rehype plugins must be specified as STRING names in `next.config.mjs` (no imported function references).
- `tsconfig.json` keeps `strict: true` but has `noImplicitAny: false` and skips `noUncheckedIndexedAccess` / `noUnused*` — pre-existing legacy interactive components have implicit-any errors that aren't worth fixing in the redesign PR. Ratchet up in a follow-up.
