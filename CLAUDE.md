# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

There is no test suite. There is no lint script — Next.js's built-in lint is not wired up. `typecheck` is the only static check.

## Architecture

Next.js 16 App Router blog. Posts are MDX files; everything else (frontpage, archive, author pages, command palette) is derived from the post set at request/build time.

### Post pipeline — the central thing to understand

Posts are `.mdx` files in `content/posts/<slug>.mdx`. They are **not** parsed with gray-matter. Each post has an ESM `export const metadata = { title, date, summary, author, imageSrc?, topics?, featured?, math? }` at the top of the file, which `lib/posts.ts:29` reads via a dynamic `import('@/content/posts/${slug}.mdx')`. This means:

- `getAllPostSlugs()` is a `fs.readdirSync` of `content/posts/`.
- `getPostMetadata(slug)` and `getSortedPostsData()` both **compile the MDX** to pull metadata, because `@next/mdx` exposes the ESM export. This is expensive at build time but means metadata and body never drift.
- A new post auto-appears on `/`, `/archive`, and the relevant `/authors/[slug]` page just by landing the file — no registration needed.
- The `author` string in `metadata` must match an `AUTHORS[*].name` in `lib/authors.ts` exactly, or the author filter on `/authors/[slug]` will silently drop the post.

### MDX component map (`mdx-components.tsx`)

The MDX renderer is told which custom React components are usable inside posts. Interactive sim/chart components are imported from `components/interactive/_dynamic.tsx`, which wraps them in `next/dynamic({ ssr: false })` because they touch browser APIs (Chart.js, p5, WebGPU, Ably) at import time. When adding a new interactive: add the raw component, add a `dynamic()` wrapper in `_dynamic.tsx`, register it in `mdx-components.tsx`. Don't import the raw component from MDX — SSR will crash.

### Chrome and the command palette

`app/layout.tsx` is async — it calls `getSortedPostsData()` once and threads the result into the `<CommandPaletteRoot>` so ⌘K search works on every route without per-page fetching. The `getIssue()` helper in `lib/site.ts` derives the magazine-style "VOL.0X · MMM 'YY" label from the latest post's date, so the header label advances on content ship, not on rebuilds.

### Build-time git info

`next.config.mjs:10-34` shells out to `git` (or reads `VERCEL_GIT_COMMIT_SHA`/`_TIMESTAMP`) and sets `process.env.NEXT_PUBLIC_GIT_SHA` / `_PUSHED_AT` **before** Next initialises. This is deliberate: Turbopack as of 16.2.x does not honour `next.config.mjs`'s `env` field, so the only way to inline `NEXT_PUBLIC_*` is to mutate `process.env` at module-load time. `SiteFooter.tsx` reads these.

### Turbopack constraint — plugin string names only

`next.config.mjs:48-55` passes remark/rehype plugins as **strings**, not imported function references. Turbopack ships MDX compilation through a Rust runtime that can't accept JS function pointers. If you import a plugin and pass the reference, the build will fail with an opaque error. Use `'plugin-name'` or `['plugin-name', options]`.

### TypeScript strictness — deliberately loose

`tsconfig.json:18-19` keeps `strict: true` but disables `noImplicitAny`, and there's no `noUnused*` / `noUncheckedIndexedAccess`. This is because legacy interactive components (the `WFC_components/`, older chart wrappers) have implicit-any errors that aren't worth fixing piecemeal. Don't tighten these flags without a sweep — turning on `noImplicitAny` alone produces dozens of errors.

### Styling

Sass + CSS Modules. Tokens (colors, fonts, spacing) live in `styles/global.scss` and flip on `[data-theme="dark"]`. Theme state is managed by `next-themes` via `components/theme/ThemeProvider`. Per-component `.module.scss` files own their visual scope — there is no global utility class system.

### API surface

The only API route is `app/api/ably-token-request/route.ts` (Ably realtime token for the spatial-ecology sim). Requires `ABLY_API_KEY` in `.env.local`. Everything else on the site is static/SSG.

### About page is fully derived

`lib/colophon.ts` is the single source of truth for everything the `/about` colophon shows. It reads `package.json` (for stack versions, repo URL), `AUTHORS` (author intro line and count), `getSortedPostsData()` (post count, topic count, latest date), `app/layout.tsx` parsed via regex (font names — so the colophon "type" row can't drift from the actual loaded fonts), and env vars (`VERCEL`/`NETLIFY`/`CF_PAGES`/`RENDER` → hosting; `NEXT_PUBLIC_GIT_SHA`/`_PUSHED_AT` → build row). License is detected by file presence (`LICENSE`/`LICENSE.md`/`LICENSE.txt`). **Don't hardcode colophon values in `AboutPage.tsx`** — add a derivation in `lib/colophon.ts` instead. If a fact has no derivable source, leave the row off (the renderer omits rows whose value is null/empty).

## See also

- `README.md` — installation, route table, authoring walkthrough.
- `lib/site.ts` — single source of truth for site-wide config strings.

## TODO: subscribe / feeds (currently disabled)

The newsletter signup and the RSS/Atom/JSON feed links were advertised in the
UI but not actually wired up. `<SubscribeBlock />` has been removed from its
four callsites (`app/page.tsx`, `app/posts/[slug]/layout.tsx`,
`app/about/page.tsx`, `app/authors/[slug]/page.tsx`) so the broken UI no longer
ships. The component file itself is kept at
`components/marketing/SubscribeBlock.tsx` so re-enabling is a one-line import +
JSX restore per page.

All user-facing links to `/rss.xml`, `/atom.xml`, `/feed.json` have been
removed from `SiteFooter`, `CommandPalette`, and `ArchivePage` so the UI no
longer 404s. `SITE.social.rss/atom/json` in `lib/site.ts` is kept because
`SubscribeBlock.tsx` (preserved for re-enable) still reads from it.

Before re-enabling, the following needs to happen:

1. **Feeds** — add `app/rss.xml/route.ts`, `app/atom.xml/route.ts`,
   `app/feed.json/route.ts` that build from `getSortedPostsData()` (the `feed`
   npm package emits all three from one source). Add `alternates` discovery in
   the root `app/layout.tsx` `metadata` export. Then restore the link surfaces
   removed above: footer "rss" line, command palette "Subscribe via RSS"
   action, archive page sidebar "Feeds" group.
2. **Newsletter** — the form posts to
   `https://buttondown.com/api/emails/embed-subscribe/mamoc`. Confirm the
   Buttondown account exists under that username before re-surfacing the form.
   Subscriber count is still a placeholder (see TODO comment in
   `SubscribeBlock.tsx`); wire via the Buttondown API at build time with
   `BUTTONDOWN_API_KEY` if we want a real number, or drop the line.
