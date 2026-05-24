<div align="center">

  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/images/mamoc-text-dark.png">
    <img alt="MAMOC" src="public/images/mamoc-text.png" width="520">
  </picture>

  <p><em>Long-form research blog by Cameron Michie &amp; Alexander Cheetham — math, simulation, and the data they produce.</em></p>

  <p>
    <img src="public/images/cam.png" alt="Cameron Michie" width="72" height="72">
    &nbsp;&nbsp;
    <img src="public/images/alex.png" alt="Alexander Cheetham" width="72" height="72">
  </p>

  <sub>Cameron Michie · Alexander Cheetham</sub>

</div>

---

## Stack

- Next.js 16 · App Router · TypeScript · Turbopack
- MDX via `@next/mdx` (build-time, file-based) — posts live in `content/posts/*.mdx`
- Sass + CSS Modules (component-scoped) on a token-driven design system in `styles/global.scss`
- `next-themes` for light/dark/system theme · `cmdk` for the ⌘K palette
- KaTeX (math) · `rehype-prism-plus` (code) · Ably (realtime sims)
- Self-hosted Google Fonts via `next/font/google` (Fira Code + Source Serif 4)
- Playwright e2e suite (chromium / firefox / webkit / mobile-chrome) with per-PR video reports

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
npm run dev          # http://localhost:3000
npm run build        # production build
npm run start        # serve the production build
npm run typecheck    # tsc --noEmit
npm run test:e2e     # Playwright suite
npm run test:e2e:ui  # Playwright UI mode
```

`typecheck` is the only static check; there is no lint script.

## Routes

| Path | Notes |
|---|---|
| `/` | Frontpage (zine layout, hero + sidebar + numbered index) |
| `/posts/[slug]` | Per-post page — masthead + MDX body |
| `/archive` | All posts, organised by year, filterable by topic |
| `/authors/[slug]` | Author profile + their posts |
| `/about` | About + colophon (fully derived — see `lib/colophon.ts`) |
| `/api/ably-token-request` | Ably token endpoint for the spatial-ecology sim |

## Authoring a post

1. Drop a new `.mdx` file into `content/posts/<slug>.mdx`.
2. Top of the file: an `export const metadata = {}` block (NOT YAML frontmatter — `@next/mdx` reads ESM exports). Required: `title`, `date` (`YYYY-MM-DD`), `summary`, `author`. Optional: `imageSrc`, `topics: []`, `featured: true`, `math: true`.
3. Add a blank line between the metadata export and the first markdown content.
4. Body is plain Markdown plus any of the components mapped in `mdx-components.tsx`: `Image`, `Link`, `Figure`, the `Table` family (`Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`), `ButtonTimer`, `LotkaVolterra`, `RK4ReactionDiffusion`, `CharacteristicLengthCalculator`, `WFCCONTAINER`. The interactive ones are wrapped in `dynamic({ ssr: false })` because they touch browser APIs at import.

The post automatically appears in the Frontpage index, the Archive, and (filtered by `author`) on the relevant `/authors/[slug]` page.

## Adding an author

Edit `lib/authors.ts`, add a new key under `AUTHORS`. The author's profile page at `/authors/<slug>` is built automatically from `generateStaticParams`. The `author` string in post metadata must match an `AUTHORS[*].name` exactly.

## Theming

Theme state is managed by `next-themes` with three modes (`light`, `dark`, `system`). The toggle lives in `SiteHeader`'s segmented control. Tokens flip via `[data-theme="dark"]` selectors in `styles/global.scss`.

## Testing

Playwright runs on every PR via `.github/workflows/playwright.yml` across chromium, firefox, webkit, and a Pixel 5 mobile-chrome target. The workflow stitches per-browser videos into a single MP4 + animated WebP and upserts it as a PR comment. Only tests tagged `@multistep` are included in the combined video — see `CLAUDE.md` for the tagging convention and when it applies.

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
  marketing/            SubscribeBlock (kept; currently unmounted — see CLAUDE.md)
  theme/                next-themes wrapper
  interactive/          chart / sim components (with _dynamic/ wrappers)
  frames/, WFC_components/  miscellaneous content components
content/posts/          .mdx posts
lib/
  posts.ts              slug + metadata reads
  authors.ts            author registry
  colophon.ts           derives /about facts from package.json, AUTHORS, posts, env
  site.ts               site-wide config strings
styles/
  global.scss           tokens + element defaults
  variables.scss        legacy spacing/breakpoint Sass vars
  post.module.scss      legacy interactive-component styles
tests/e2e/              Playwright specs (mobile.spec.ts targets the mobile project)
mdx-components.tsx      MDX component map (server, imports client wrappers)
next.config.mjs         createMDX with Turbopack-compatible string plugins
playwright.config.ts    browser projects + video:'on'
```

## Notes

- Turbopack is the default builder in Next 16; remark/rehype plugins must be specified as STRING names in `next.config.mjs` (no imported function references).
- `tsconfig.json` keeps `strict: true` but has `noImplicitAny: false` and skips `noUncheckedIndexedAccess` / `noUnused*` — legacy interactive components have implicit-any errors that aren't worth fixing piecemeal.
- Newsletter signup and RSS/Atom/JSON feeds are currently disabled in the UI; see the TODO at the bottom of `CLAUDE.md` for the re-enable checklist.
