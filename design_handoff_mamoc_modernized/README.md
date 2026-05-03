# Handoff: mamoc / modernized

A small handoff bundle for implementing the chosen pages of the **mamoc.blog** modernization in production.

---

## Overview

This package covers a redesign of `mamoc.blog` — a long-form research blog by Cameron Michie and Alexander Cheetham — focused on math, simulation, and the visuals their algorithms produce. The selected scope contains the **front page**, the **post-summary masthead** (the block that sits above every article body), and the **site chrome** (header, command palette, footer) plus three standalone pages (**archive**, **author**, **about**) and the **subscribe / follow** module.

The article body and reading experience itself are **not** in scope here.

## About the design files

The files in this bundle are **design references, written in HTML/JSX** to communicate visual intent. They are not production code to copy directly into the live site. Treat each component as a spec: it shows the correct DOM shape, class names, copy, exact tokens, and layout — your job is to **recreate it inside the existing `mamoc-blog` codebase** using its established conventions (Next.js + MDX + Sass per the colophon).

If the existing codebase uses Sass modules, port the CSS to whatever module structure that codebase uses; do not blindly drop the bundled `components.css` into production.

## Fidelity

**High-fidelity.** Pixel-targets, colors, type, spacing and copy are all final. The design uses the existing mamoc design tokens (Fira Code mono + Source Serif Pro serif, hot-pink + electric-purple accents, neutral greys) — these tokens already exist in the live codebase under `styles/global.scss` / `variables.scss` and should be re-used, **not** re-imported from this bundle.

The bundled `tokens.css` file is the canonical token list at the moment of handoff — use it to verify token names match what the codebase actually exports.

## How to preview

Open `index.html` in a browser. A toolbar lets you:

- pick any single component to render in isolation, or "show all in sequence"
- toggle light/dark theme

The preview wires up React 18 + Babel-Standalone in-browser. This is a **preview-only** harness — production should use the codebase's existing React/Next setup with proper SSR.

---

## Files in this bundle

| File | What it is |
|---|---|
| `index.html` | Preview harness with component picker + dark-mode toggle |
| `tokens.css` | Design tokens (colors, type scale, spacing, shadows, motion). Direct copy of `colors_and_type.css` from the design-system project. |
| `components.css` | Component-scoped styles for everything in scope, organized by class scope (`.fp2`, `.ps1`, `.c1`–`.c8`). |
| `components.jsx` | All 9 React components, named for production use. |
| `assets/` | Author headshots, post hero images, and the mamoc logo (light + dark variants). |

---

## Components

Each component takes a single optional `dark` prop. **Replace this in production** with whatever theme mechanism the codebase uses (CSS attribute on `<html>`, context, etc.) — the `dark` plumbing is just so the preview harness can toggle without wiring a real theme provider.

| Component | Class scope | Where it lives in the site |
|---|---|---|
| `<SiteHeader />` | `.c1` | Persistent — top of every page |
| `<CommandPalette />` | `.c2` | Overlay — opens on `⌘K` from anywhere |
| `<Frontpage />` | `.fp2` | `/` (index page) |
| `<PostSummary />` | `.ps1` | Top of every `/posts/[slug]` page, before the article body |
| `<ArchivePage />` | `.c3` | `/archive` |
| `<AuthorPage />` | `.c4` | `/authors/[slug]` |
| `<AboutPage />` | `.c7` | `/about` |
| `<SubscribeBlock />` | `.c6` | Reusable — bottom of frontpage, bottom of every post, footer of `/about` |
| `<SiteFooter />` | `.c8` | Persistent — bottom of every page |

---

## Page-by-page specs

### 1. SiteHeader (`.c1`)

**Purpose:** Persistent global header. Brand mark + breadcrumb on the left, an inline command-bar in the middle (it visually IS the search input — clicking should open the palette), live status pill + theme toggle on the right. A thin status strip below the bar shows last push, subscriber count, next-post ETA, and online state.

**Layout:**
- `.bar`: 3-column flex (brand · cmd-bar · right). Height ~64px.
- `.status`: full-width thin strip, mono, `var(--font-size-xs)`, separated by middle-dots.

**Behavior:**
- The command-bar `<input>` should be a **trigger** for `<CommandPalette />`, not a working input — focus it and it opens the palette.
- `⌘K` global hotkey opens the palette.
- The theme segmented control has three options: light / dark / sys (system).
- The breadcrumb reflects current route (e.g. `~/posts/#procgen` when viewing the procgen archive filter).

### 2. CommandPalette (`.c2`)

**Purpose:** Site-wide search and command runner. Three categories: Posts, Topics, Actions.

**Layout:**
- Modal overlay (`.c2-wrap > .ov` for the dimming backdrop, `.c2` for the panel).
- Panel max-width ~640px, centered horizontally, ~12vh from top.
- Header row with `›find` prefix, input, and `↑↓ ↵ esc` hints.
- Sections (`.grp`) with title + count, then result rows.
- Footer with result count + `↵ open · ⌘↵ new tab` reminder.

**Behavior:**
- Open on `⌘K`. Close on `esc`, click-outside, or selecting a result.
- Arrow-key navigation across the full result list (skipping section headers). Currently selected row gets `.sel` class.
- `↵` opens the highlighted result. `⌘↵` opens in a new tab.
- Filter rows live as the user types. Use a fast in-memory index of posts + topics.
- The input autofocuses on open.

**State:** `query: string`, `selectedIndex: number`, `open: boolean`.

### 3. Frontpage (`.fp2`)

**Purpose:** `/` — the index page. A literary-magazine "issue" framing with a typographic masthead, one editor's-pick hero, a sidebar of "also in this issue", and a numbered index of every post.

**Layout:**
- `.hdr2`: top header — logo + volume tag on left, nav (Index / Archive / Authors / About / ⌘K) on right.
- `.masthead`: 2-column. Left: huge display H1 ("Notes & simulations.") with serif italic ampersand. Right: stacked Issue / Vol indicator + tagline paragraph.
- `.hero2`: 2-column (~1.4fr / 1fr). Left: featured post hero with image, H2 title, byline, summary. Right: thumbnail + numbered titles for the other posts in the issue.
- `.index-title` + `.indx`: full-width numbered table of all posts, columns: `n · title+topics · author · date · reading-time`.

**Behavior:** Navigation links route to their pages. Clicking any index row routes to the post. The featured hero is editorially chosen, not "latest".

**Data:** Reads `POSTS` (id, title, date, author, summary, img, readingTime, topics).

### 4. PostSummary (`.ps1`)

**Purpose:** The block that sits between the site header and the article body on every post page. Communicates research-paper formality without being heavy.

**Layout:**
- `.crumbs`: `~/mamoc / posts / #topic / slug` (mono, ~13px).
- `.kicker`: tiny pill row — "Research Post · 2024 · Volume 02 · Entry 12".
- `.ti`: H1 — large mono display, tight tracking.
- `.by`: 3-column flex — author (avatar + name + role) · spacer · stats (4 stacked label/value pairs: Published / Reading / Footnotes / Interactives).
- `.body`: 2-column — left = abstract, right = aside with cover figure + Contents (numbered TOC).

**Behavior:**
- TOC nodes get `.active` when their section is in viewport (use IntersectionObserver on the article body's headings).
- `.depth2` indents sub-sections.
- Cover image clicks → fullscreen viewer.

### 5. ArchivePage (`.c3`)

**Purpose:** `/archive` — every post, organized by year, filterable by topic.

**Layout:**
- `.head`: large title "The / archive." + lede paragraph.
- `.filters`: horizontal wrap of topic chips with counts. Active chip gets `.on`.
- `.split`: 2-column. Left aside (`.side`) groups: Reading trails / Authors / Feeds. Right pane: years cascade — each `.year` has a big year number then a list of `.it` rows.

**Behavior:**
- Clicking a chip filters the post list (single-select). "+N more" expands the chip cloud.
- Reading-trail links should route to a curated multi-post page (or for now, a topic filter).
- Each `.it` row is clickable — routes to that post.

### 6. AuthorPage (`.c4`)

**Purpose:** `/authors/[slug]` — single-author profile with bio, stats, a writing-status sidebar, and the author's posts.

**Layout:**
- `.masthead`: 2-column. Left: large square avatar with a "CO-AUTHOR" tag overlay and `@handle` underneath. Right: huge display name (split first/last across two lines), role tagline, bio, link list.
- `.meta-row`: 4 large stat tiles (posts / words / interactives / active-since). The numeric value uses bold mono with a small `.u` unit suffix in lighter weight.
- `.body`: 2-column. Left sidebar with three blocks (Currently building / Most-read / Toolbox). Right: post list with date + title + summary + meta line + thumbnail.

**Behavior:** Page is route-driven (`/authors/[slug]`). The two real authors today are `alex.cheetham` and `cameron.michie`. Avatars and bios live alongside the post collection.

### 7. AboutPage (`.c7`)

**Purpose:** `/about` — what this is, why we write it, colophon.

**Layout:**
- H1 + lede.
- 2-column body: "What this is" + "Why" on the left; "Colophon" (a `<dl>`) + "Thanks to" on the right.
- Closing `.pull` quote at the bottom — large serif italic with attribution.

### 8. SubscribeBlock (`.c6`)

**Purpose:** Newsletter signup + every other "follow" option. Drop this on the bottom of the frontpage, at the foot of every post, and inside the about page.

**Layout:** Single rounded card, 2 columns:
- Left: tag, H3 hook, paragraph, email form, tiny "X readers · powered by Buttondown" line.
- Right: tag, terminal-style command (`cat /follow/mamoc`), then 4 follow rows (RSS / Atom / JSON feed / GitHub) each with an icon-glyph, title + sub, and an arrow.

**Behavior:**
- Email form posts to Buttondown (or whatever the codebase uses). Show inline success / error after submit.
- Each "opt" row links out to the relevant feed URL.

### 9. SiteFooter (`.c8`)

**Purpose:** Persistent global footer. Big wordmark, four columns of links, a thin meta strip at the very bottom.

**Layout:**
- `.sig`: huge "ma·moc_" wordmark with blinking caret cursor.
- `.grid`: 4 columns — main blurb + RSS, Read, Authors, Elsewhere.
- `.strip`: thin row — left side (copyright / licence / "no trackers"), right side (last deploy / "Built on a Tuesday").

**Implementation note:** The class convention here is **inverted** from the rest of the components: `.c8` with no modifier renders **dark**; `.c8.light` renders light. The `<SiteFooter />` component already translates this — it accepts the standard `dark` prop and applies `.light` when `!dark`.

---

## Design tokens

All values are defined in `tokens.css` under `:root` (with `.dark` / `[data-theme="dark"]` overrides). Use these tokens directly — don't redeclare colors or sizes in component code.

### Color
- **Brand:** `--color-primary: #ff005c` (hot pink — titles, author names, brand). `--color-secondary: #7000ff` (electric purple — links, TOC, accents). Dark mode swaps secondary to `#a78bfa` and adds `--color-hover: #00ff41` for hover states.
- **Neutrals:** A 9-step grey scale (`--color-gray-vvvvlight` → `--color-gray-vdark`) with `--color-black` at `#111827` light / `#f3f4f6` dark.
- **Signal:** success / error / warning / info each have base + light variants.
- **Surface:** `--color-white` flips to `#1a1a1a` in dark mode — use it as the page background, not as a literal "white".

### Type
- **Mono primary:** Fira Code (300/400/500/600/700). Used for headings, body, code.
- **Serif secondary:** Source Serif Pro (400/600/700, italic). Used selectively — italic ampersand in mastheads, `.pull` quotes on About.
- **Scale:** xs 12 / sm 14 / base 16 / lg 18 / xl 20 / 2xl 24 / 3xl 30 / 4xl 36 / 5xl 48.
- **Heading metrics:** H1 5xl/800/1.15 with `-0.02em` tracking; descending from there.
- **Body:** 16px / 1.66 line-height (note the unusually tall leading — keep it).

### Spacing & radii
- Spacing: `--spacing-xxs:4 / xs:8 / sm:12 / 16 / l:24 / xl:32 / xxl:48 / 3xl:64 / 4xl:96`.
- Radii: `sm:4 / md:8 / lg:12 / xl:16 / full:9999`.
- Shadows: `--shadow-sm / md / lg / xl / inner` — matches Tailwind's defaults.

### Motion
- `--transition-base: all 0.2s cubic-bezier(.4,0,.2,1)`.
- `--transition-smooth: all 0.3s cubic-bezier(.4,0,.2,1)`.

---

## Theming

Two modes: light (default) and dark. The bundled components accept a `dark` prop and toggle a `.dark` class on their root. **In production, replace this** — the live codebase already supports theming via tokens swapping under `.dark` / `[data-theme="dark"]` on `<html>`. Wire the existing system; drop the prop.

`SiteFooter` is the only component with inverted polarity (defaults dark) — see its note above.

---

## State management

- **`<CommandPalette />`** needs global open/close state. Keep it in a `useCommandPalette()` hook or a tiny context — bound to `⌘K` globally.
- **Theme** uses whatever the existing site uses — don't introduce a new mechanism.
- **`<PostSummary />`** TOC needs IntersectionObserver state for active section.
- All other components are pure renders of route data — no client state.

## Routing

| Route | Component |
|---|---|
| `/` | `Frontpage` |
| `/posts/[slug]` | `SiteHeader` + `PostSummary` + (article body, out of scope) + `SubscribeBlock` + `SiteFooter` |
| `/archive` | `ArchivePage` |
| `/authors/[slug]` | `AuthorPage` |
| `/about` | `AboutPage` |

Persistent on every route: `SiteHeader` (top), `SiteFooter` (bottom), `CommandPalette` (overlay).

## Assets

The bundled `assets/` folder holds the photos used in the prototypes. **In production, source these from the existing CMS / image pipeline** — don't ship the prototype copies. Asset paths in the JSX are relative `./assets/…` for preview only; replace with the codebase's image conventions.

---

## What was deliberately excluded

- **Article body / reading experience** — out of scope for this handoff.
- **Interactive embed shell** — covered by a separate spec when needed.
- **Loaders, WebGL backgrounds, motion library** — separate spec.

If you need those, ask the design team for a follow-up handoff bundle.
