// mamoc / modernized — handoff component file.
//
// This file contains the React components for the chosen pages, transcribed
// from the design prototypes verbatim. They expect tokens.css + components.css
// to be loaded, and the helper images to live at ./assets/*.
//
// Components exported to window:
//   Frontpage     — index page (zine layout)        [.fp2]
//   PostSummary   — article masthead + TOC          [.ps1]
//   SiteHeader    — global header + status strip    [.c1]
//   CommandPalette — overlay search                 [.c2]
//   ArchivePage   — /archive                        [.c3]
//   AuthorPage    — /authors/:slug                  [.c4]
//   SubscribeBlock — newsletter + RSS module        [.c6]
//   AboutPage     — /about                          [.c7]
//   SiteFooter    — global footer                   [.c8]
//
// Every component takes a single optional `dark` prop. In production this
// should be replaced with reading a "theme" attribute on the document root
// (data-theme="dark") and dropping the `dark` class plumbing.

const { useState, useEffect } = React;

/* ── seed data ─────────────────────────────────────────────────────────── */

const POSTS = [
  { id: "wfc", title: "Creating Maps with Wave Function Collapse",
    date: "2024-03-19", dateLong: "March 19, 2024", author: "Alex Cheetham",
    summary: "A showcase and explanation of my own WFC implementation for generating video-game maps, with a discussion of potential improvements.",
    img: "./assets/alex_wfc_1.png", readingTime: "12 min", topics: ["procgen", "algorithms"] },
  { id: "neuroev", title: "Neuroevolution: Finding Agents that Play Games",
    date: "2024-10-02", dateLong: "October 02, 2024", author: "Alex Cheetham",
    summary: "Walking through NEAT-style neuroevolution on classic control tasks — crossover, speciation, novelty search.",
    img: "./assets/alex_neuroev_2.jpeg", readingTime: "18 min", topics: ["ml", "simulation"] },
  { id: "spatial", title: "Spatial Ecology: Agent-Based Models of Dispersal",
    date: "2024-07-11", dateLong: "July 11, 2024", author: "Cameron Michie",
    summary: "An agent-based simulation of dispersal dynamics and its emergent spatial patterns across a heterogeneous landscape.",
    img: "./assets/cam_spatial-ecology_1.png", readingTime: "15 min", topics: ["ecology", "abm"] },
  { id: "btc", title: "DBBA: A Bitcoin Agent Model",
    date: "2024-05-22", dateLong: "May 22, 2024", author: "Cameron Michie",
    summary: "Designing a belief-based BTC trading agent and seeing what happens when hundreds of them share an orderbook.",
    img: "./assets/cam_spatial-ecology_3.png", readingTime: "14 min", topics: ["finance", "abm"] }
];

const AUTHORS = {
  "Cameron Michie": { name: "Cameron Michie", role: "spatial ecology · finance · abm", img: "./assets/cam.png" },
  "Alex Cheetham":  { name: "Alex Cheetham",  role: "procgen · ml · simulation",        img: "./assets/alex.png" },
};

const LOGO_LIGHT = "./assets/mamoc-text.png";
const LOGO_DARK  = "./assets/mamoc-text-dark.png";

/* ════════════════════════════════════════════════════════════════════════ */
/* Frontpage (V2 · zine / index)                                            */
/* ════════════════════════════════════════════════════════════════════════ */

function Frontpage({ dark }) {
  const hero = POSTS[1]; // featured: neuroev
  const rest = POSTS.filter(p => p.id !== hero.id);
  return (
    <div className={"fp2" + (dark ? " dark" : "")} style={{ minHeight: "100%" }}>
      <header className="hdr2">
        <div className="ml">
          <img src={dark ? LOGO_DARK : LOGO_LIGHT} alt="mamoc" />
          <span className="dt">VOL.02 · APR '26</span>
        </div>
        <nav>
          <a className="active">Index</a><a>Archive</a><a>Authors</a><a>About</a>
          <a style={{ color: "var(--color-gray)" }}>⌘K</a>
        </nav>
      </header>

      <section className="masthead">
        <h1>Notes <span className="amp">&amp;</span><br />simulations.</h1>
        <div className="issue">Issue<span className="big">07</span>volume 2</div>
        <p className="tag">Long-form articles on mathematical and technical topics, with a focus on generating data to create interesting visuals. Written in the first person by Cameron Michie and Alexander Cheetham — often with an interactive component at the bottom of each post.</p>
      </section>

      <section className="hero2">
        <div className="main">
          <div className="lbl">Featured · Editor's pick</div>
          <div className="img"><img src={hero.img} alt={hero.title} /></div>
          <h2>{hero.title}</h2>
          <div className="meta"><b>{hero.author}</b><span>{hero.dateLong}</span><span>{hero.readingTime} read</span></div>
          <p className="sum">{hero.summary}</p>
        </div>
        <div className="side">
          <div className="t">Also in this issue</div>
          {rest.map((p, i) => (
            <div className="it" key={p.id}>
              <div className="th"><img src={p.img} alt="" /></div>
              <div>
                <div className="n">0{i + 2} · {p.topics[0].toUpperCase()}</div>
                <div className="h">{p.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="index-title">
        <h3>The Index · All Posts</h3>
        <div className="n">{POSTS.length} entries</div>
      </div>
      <div className="indx">
        {POSTS.map((p, i) => (
          <div className="r" key={p.id}>
            <div className="n">{String(i + 1).padStart(2, "0")}</div>
            <div>
              <div className="t">{p.title}</div>
              <div className="a">{p.topics.map(t => "#" + t).join(" · ")}</div>
            </div>
            <div className="a">{p.author}</div>
            <div className="d">{p.dateLong}</div>
            <div className="rt">{p.readingTime}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* Post summary masthead (V1 · research masthead)                           */
/* Sits above article body on every post page.                              */
/* ════════════════════════════════════════════════════════════════════════ */

function PostSummary({ dark }) {
  const post = POSTS[0];
  const a = AUTHORS[post.author];
  return (
    <div className={"ps1" + (dark ? " dark" : "")}>
      <div className="crumbs">
        <a>~/mamoc</a><span className="sep">/</span>
        <a>posts</a><span className="sep">/</span>
        <span className="tag">#procgen</span><span className="sep">/</span>
        <span>wave-function-collapse</span>
      </div>

      <div className="kicker">
        <span className="dot" />
        <span>Research Post · 2024</span>
        <span style={{ opacity: .4 }}>·</span>
        <span>Volume 02 · Entry 12</span>
      </div>

      <h1 className="ti">{post.title}</h1>

      <div className="by">
        <div className="author">
          <img src={a.img} alt="" />
          <div>
            <div className="na">{post.author}</div>
            <div className="ro">{a.role}</div>
          </div>
        </div>
        <div />
        <div className="stats">
          <div><b>{post.dateLong}</b>Published</div>
          <div><b>{post.readingTime}</b>Reading</div>
          <div><b>12</b>Footnotes</div>
          <div><b>3</b>Interactives</div>
        </div>
      </div>

      <div className="body">
        <div>
          <span className="abstract-lbl">Abstract</span>
          <p className="abstract">After watching Mark Donald's "Superpositions, Sudoku, the Wave Function Collapse Algorithm," I built my own WFC implementation and set out to answer a simple question: how far can a cellular, entropy-driven algorithm be pushed before it starts feeling like a general-purpose map generator? This post walks through the derivation, the places it breaks, and three fixes for the flexibility and generality issues that come up.</p>
        </div>
        <div className="aside">
          <div className="cover">
            <img src={post.img} alt={post.title} />
            <div className="cap">Fig. 01 · 32 × 32 biome tilemap generated by the final implementation</div>
          </div>
          <div className="toc-lbl"><span>Contents</span><span>6 sections</span></div>
          <div className="toc1">
            <div className="node"><span className="num">1.0</span><span>What is Wave Function Collapse?</span><span className="pg">p.1</span></div>
            <div className="node depth2"><span className="num">1.1</span><span>The algorithm</span><span className="pg">p.1</span></div>
            <div className="node depth2"><span className="num">1.2</span><span>Probabilistic biomes</span><span className="pg">p.3</span></div>
            <div className="node active"><span className="num">2.0</span><span>Interactive example</span><span className="pg">p.5</span></div>
            <div className="node"><span className="num">3.0</span><span>Increasing generality</span><span className="pg">p.7</span></div>
            <div className="node"><span className="num">4.0</span><span>Conclusion</span><span className="pg">p.9</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* SiteHeader (.c1)                                                         */
/* ════════════════════════════════════════════════════════════════════════ */

function SiteHeader({ dark }) {
  return (
    <div className={"c1" + (dark ? " dark" : "")}>
      <div className="bar">
        <div className="brand">
          <img src={dark ? LOGO_DARK : LOGO_LIGHT} alt="mamoc" />
          <div className="bc">
            <span className="sep">~/</span><span>posts</span>
            <span className="sep">/</span><span className="cur">#procgen</span>
          </div>
        </div>
        <div className="cmd">
          <span className="p">›</span>
          <span className="sep">find</span>
          <input placeholder="entropy, WFC, neuroev, Lotka-Volterra…" />
          <span className="k">⌘K</span>
        </div>
        <div className="right">
          <div className="pill"><span className="dot" /> <span>LIVE · neuroev sim</span></div>
          <div className="theme">
            <div className="o">light</div>
            <div className="o on">dark</div>
            <div className="o">sys</div>
          </div>
        </div>
      </div>
      <div className="status">
        <span><b>last push</b> 2d ago · 0a1f9c2</span>
        <span><b>subscribers</b> 1,284</span>
        <span><b>next post</b> RK4 reaction-diffusion · ETA 03-12</span>
        <span className="live">● online</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* CommandPalette (.c2)                                                     */
/* Overlay component. Opens on ⌘K.                                          */
/* ════════════════════════════════════════════════════════════════════════ */

function CommandPalette({ dark }) {
  return (
    <div className={"c2-wrap" + (dark ? " dark" : "")}>
      <div className="ov" />
      <div className="c2">
        <div className="hd">
          <div className="pfx"><span className="gt">›</span>find</div>
          <input defaultValue="wave" placeholder="Search posts, authors, topics…" autoFocus />
          <div className="hint"><span className="k">↑↓</span><span className="k">↵</span><span className="k">esc</span></div>
        </div>
        <div className="grp">
          <div className="t"><span>Posts</span><span className="n">2</span></div>
          <div className="row sel">
            <div className="g">#</div>
            <div>
              <div className="t">Creating Maps with Wave Function Collapse</div>
              <div className="s">Alex Cheetham · 2024-03-19 · 12 min</div>
            </div>
            <div className="tag">procgen</div>
          </div>
          <div className="row">
            <div className="g">#</div>
            <div>
              <div className="t">Neuroevolution: Finding Agents that Play Games</div>
              <div className="s">Alex Cheetham · 2024-10-02 · 18 min</div>
            </div>
            <div className="tag">ml</div>
          </div>
        </div>
        <div className="grp">
          <div className="t"><span>Topics</span><span className="n">3</span></div>
          <div className="row">
            <div className="g">§</div>
            <div>
              <div className="t">#procgen</div>
              <div className="s">4 posts across 2 authors</div>
            </div>
            <div className="tag">topic</div>
          </div>
          <div className="row">
            <div className="g">§</div>
            <div>
              <div className="t">#abm</div>
              <div className="s">2 posts · agent-based modeling</div>
            </div>
            <div className="tag">topic</div>
          </div>
        </div>
        <div className="grp">
          <div className="t"><span>Actions</span><span className="n">2</span></div>
          <div className="row">
            <div className="g">›</div>
            <div>
              <div className="t">Toggle theme</div>
              <div className="s">dark → light</div>
            </div>
            <div className="tag">⌘⇧L</div>
          </div>
          <div className="row">
            <div className="g">›</div>
            <div>
              <div className="t">Subscribe via RSS</div>
              <div className="s">/rss.xml</div>
            </div>
            <div className="tag">feed</div>
          </div>
        </div>
        <div className="foot">
          <div>11 results</div>
          <div><span className="k">↵</span> open · <span className="k">⌘↵</span> new tab</div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* ArchivePage (.c3)                                                        */
/* ════════════════════════════════════════════════════════════════════════ */

function ArchivePage({ dark }) {
  const topics = [
    { n: "procgen", c: 4, on: true }, { n: "algorithms", c: 3 }, { n: "ml", c: 2 },
    { n: "simulation", c: 5 }, { n: "abm", c: 3 }, { n: "ecology", c: 2 }, { n: "finance", c: 2 },
    { n: "math", c: 6 }, { n: "graphics", c: 3 }, { n: "reaction-diffusion", c: 2 }
  ];
  const years = [
    { y: "2024", posts: [
      { d: "Oct 02", t: "Neuroevolution: Finding Agents that Play Games", tg: "ml", a: "Alex", rt: "18 min" },
      { d: "Jul 11", t: "Spatial Ecology: Agent-Based Models of Dispersal", tg: "ecology", a: "Cameron", rt: "15 min" },
      { d: "May 22", t: "DBBA: A Bitcoin Agent Model", tg: "finance", a: "Cameron", rt: "14 min" },
      { d: "Mar 19", t: "Creating Maps with Wave Function Collapse", tg: "procgen", a: "Alex", rt: "12 min" }
    ]},
    { y: "2023", posts: [
      { d: "Nov 04", t: "RK4 Integrators for Reaction-Diffusion Systems", tg: "simulation", a: "Cameron", rt: "20 min" },
      { d: "Aug 18", t: "Stock Network Analysis with Graph Laplacians", tg: "finance", a: "Cameron", rt: "22 min" },
      { d: "Feb 02", t: "Lotka-Volterra: An Interactive Walkthrough", tg: "math", a: "Alex", rt: "9 min" }
    ]}
  ];
  return (
    <div className={"c3" + (dark ? " dark" : "")}>
      <div className="head">
        <h2>The <span className="slash">/</span> archive.</h2>
        <p className="lede">Every post, every topic, every author — organised by year. Filter by topic on the left, or jump into a commonly-read starter trail.</p>
      </div>
      <div className="filters">
        {topics.slice(0, 8).map(t => (
          <div className={"chip" + (t.on ? " on" : "")} key={t.n}>#{t.n} <span className="n">{t.c}</span></div>
        ))}
        <div className="chip" style={{ opacity: .6 }}>+2 more</div>
      </div>
      <div className="split">
        <aside className="side">
          <div className="grp">
            <div className="hd"><span>Reading trails</span></div>
            <a>› procgen starter <span className="n">4</span></a>
            <a>› abm basics <span className="n">3</span></a>
            <a>› math posts <span className="n">6</span></a>
          </div>
          <div className="grp">
            <div className="hd"><span>Authors</span></div>
            <a>· Alex Cheetham <span className="n">4</span></a>
            <a>· Cameron Michie <span className="n">3</span></a>
          </div>
          <div className="grp">
            <div className="hd"><span>Feeds</span></div>
            <a>/ rss.xml</a>
            <a>/ atom.xml</a>
            <a>/ json</a>
          </div>
        </aside>
        <div>
          {years.map(y => (
            <div className="year" key={y.y}>
              <div className="yn">{y.y}<span className="sub">{y.posts.length} posts</span></div>
              <div className="items">
                {y.posts.map((p, i) => (
                  <div className="it" key={i}>
                    <div className="d">{p.d}</div>
                    <div><div className="t">{p.t}</div><div className="tg">#{p.tg}</div></div>
                    <div className="a">{p.a}</div>
                    <div className="rt">{p.rt}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* AuthorPage (.c4)                                                         */
/* ════════════════════════════════════════════════════════════════════════ */

function AuthorPage({ dark }) {
  const a = AUTHORS["Alex Cheetham"];
  const posts = POSTS.filter(p => p.author === "Alex Cheetham").concat([
    { id: "lv", title: "Lotka-Volterra: An Interactive Walkthrough",
      date: "2023-02-02", dateLong: "February 02, 2023",
      summary: "Predator-prey dynamics, derivation, and an interactive phase-portrait plot.",
      img: "./assets/cam_spatial-ecology_1.png", readingTime: "9 min" }
  ]);
  return (
    <div className={"c4" + (dark ? " dark" : "")}>
      <div className="masthead">
        <div className="avatar">
          <img src={a.img} alt="" />
          <div className="tag">CO-AUTHOR</div>
          <div className="handle">@alex.cheetham</div>
        </div>
        <div className="intro">
          <h1>Alex<br /><span className="last">Cheetham.</span></h1>
          <div className="role">procgen · machine learning · simulation</div>
          <p className="bio">Writing about the algorithms I can't stop thinking about — usually something with an agent, a gradient, or a tilemap in it. Half of these posts exist because a simulation I wrote produced something too pretty to not explain.</p>
          <div className="links">
            <a><span className="u">github /</span> alexcheetham</a>
            <a><span className="u">linkedin /</span> in/acheetham</a>
            <a><span className="u">cv.pdf</span></a>
            <a><span className="u">rss /</span> feed.xml</a>
          </div>
        </div>
      </div>

      <div className="meta-row">
        <div className="m"><div className="n">{posts.length}<span className="u">·posts</span></div><div className="l">Published</div></div>
        <div className="m"><div className="n">72<span className="u">k</span></div><div className="l">Words written</div></div>
        <div className="m"><div className="n">8<span className="u">·interactives</span></div><div className="l">Embedded</div></div>
        <div className="m"><div className="n">2024<span className="u"></span></div><div className="l">Active since</div></div>
      </div>

      <div className="body">
        <aside className="sidebar">
          <div className="block">
            <div className="hl">Currently building</div>
            <p>A revised WFC solver that handles probabilistic constraints across overlapping biomes — aiming for post #5.</p>
          </div>
          <div className="block">
            <div className="hl">Most-read</div>
            <div className="row"><span>WFC Maps</span><b>14.2k</b></div>
            <div className="row"><span>Neuroevolution</span><b>8.6k</b></div>
            <div className="row"><span>Lotka-Volterra</span><b>5.1k</b></div>
          </div>
          <div className="block">
            <div className="hl">Toolbox</div>
            <div className="row"><span>Language</span><b>TypeScript · Python</b></div>
            <div className="row"><span>Plotting</span><b>d3 · matplotlib</b></div>
            <div className="row"><span>Sim kit</span><b>p5 · WebGPU</b></div>
          </div>
        </aside>
        <div className="right">
          <h3>Posts · {posts.length}</h3>
          {posts.map(p => (
            <div className="post" key={p.id}>
              <div>
                <div className="d">{p.dateLong}</div>
                <div className="t">{p.title}</div>
                <div className="s">{p.summary}</div>
                <div className="meta">{p.readingTime || "12 min"} read · 1 interactive · 8 footnotes</div>
              </div>
              <img src={p.img} alt="" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* SubscribeBlock (.c6)                                                     */
/* ════════════════════════════════════════════════════════════════════════ */

function SubscribeBlock({ dark }) {
  return (
    <div className={"c6" + (dark ? " dark" : "")}>
      <div className="card">
        <div className="l">
          <div className="k">Newsletter · once a month</div>
          <h3>New posts, delivered slowly.</h3>
          <p>One email per new post — usually once a month. No tracking, no "content", no upsell. Unsubscribe lives at the top of every message.</p>
          <form onSubmit={e => e.preventDefault()}>
            <input placeholder="you@domain.tld" />
            <button>subscribe →</button>
          </form>
          <div className="tiny">Currently 1,284 readers · powered by Buttondown</div>
        </div>
        <div className="r">
          <div className="k">Or follow however you prefer</div>
          <div className="lg">cat /follow/mamoc</div>
          <div className="opts">
            <div className="opt"><div className="ic">R</div><div><div className="t">RSS</div><div className="s">/rss.xml · the original subscribe</div></div><div className="arr">↗</div></div>
            <div className="opt"><div className="ic">A</div><div><div className="t">Atom</div><div className="s">/atom.xml</div></div><div className="arr">↗</div></div>
            <div className="opt"><div className="ic">{'{}'}</div><div><div className="t">JSON feed</div><div className="s">/feed.json · for scripts</div></div><div className="arr">↗</div></div>
            <div className="opt"><div className="ic">G</div><div><div className="t">GitHub</div><div className="s">star the repo — new posts arrive as commits</div></div><div className="arr">↗</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* AboutPage (.c7)                                                          */
/* ════════════════════════════════════════════════════════════════════════ */

function AboutPage({ dark }) {
  return (
    <div className={"c7" + (dark ? " dark" : "")}>
      <h1>About <span className="slash">/</span> mamoc.</h1>
      <p className="sub">A blog project started by Cameron Michie and Alexander Cheetham — long-form articles on mathematical and technical topics, focused on generating data that produces interesting visuals.</p>

      <div className="grid">
        <div>
          <h4>What this is</h4>
          <p>Every post starts with an algorithm or a derivation, builds a simulation to probe it, and ends with an interactive you can actually play with. Think of it as a shared research notebook that we happen to publish.</p>
          <p>We lean academic on the math, casual on the prose, and obsessive on the interactive bits. If a footnote is missing from a claim, tell us.</p>
          <h4 style={{ marginTop: 28 }}>Why</h4>
          <p>Writing the posts is how we understand our own work. Publishing them forces us to explain properly. The blog is entirely a side project — no sponsors, no ads, no tracking.</p>
        </div>
        <div>
          <h4>Colophon</h4>
          <dl className="tech">
            <dt>stack</dt><dd>Next.js · MDX · Sass</dd>
            <dt>type</dt><dd>Fira Code · Source Serif Pro</dd>
            <dt>math</dt><dd>KaTeX</dd>
            <dt>sims</dt><dd>p5 · WebGPU · d3</dd>
            <dt>hosted</dt><dd>Vercel</dd>
            <dt>code</dt><dd><a>github.com/mamoc-blog</a></dd>
            <dt>licence</dt><dd>posts CC-BY-4.0 · code MIT</dd>
          </dl>
          <h4 style={{ marginTop: 28 }}>Thanks to</h4>
          <p>The authors whose work we're constantly referencing: Mark Donald, Maxim Gumin, Kenneth Stanley, Volterra, Shannon, Turing. And to every reader who emailed to point out a bug in a sim — please keep doing that.</p>
        </div>
      </div>

      <div className="pull">
        <p>We write the posts we wish existed when we were first trying to figure these things out.</p>
        <cite>— the mamoc notebook, forever-draft</cite>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════ */
/* SiteFooter (.c8)                                                         */
/* Note the inverted theme convention: in the prototypes .c8 with no class  */
/* renders dark; .c8.light renders light. We pass `dark` for parity with    */
/* the other components and translate at the boundary.                      */
/* ════════════════════════════════════════════════════════════════════════ */

function SiteFooter({ dark }) {
  return (
    <div className={"c8" + (dark ? "" : " light")}>
      <div className="sig">ma<span className="dot">·</span>moc<span className="cur">_</span></div>
      <div className="grid">
        <div className="c main">
          <div className="h">mamoc.blog</div>
          <p>A working notebook by Cameron Michie &amp; Alexander Cheetham. Long-form posts on math, simulation, and the data they produce.</p>
          <a className="rss">◉ rss · /feed.xml</a>
        </div>
        <div className="c">
          <div className="h">Read</div>
          <a>Latest</a><a>Archive</a><a>Topics</a><a>Reading trails</a>
        </div>
        <div className="c">
          <div className="h">Authors</div>
          <a>Alex Cheetham</a><a>Cameron Michie</a><a>Contact</a>
        </div>
        <div className="c">
          <div className="h">Elsewhere</div>
          <a>GitHub ↗</a><a>LinkedIn ↗</a><a>Buttondown ↗</a><a>Colophon</a>
        </div>
      </div>
      <div className="strip">
        <div className="l"><span>© 2026 mamoc.blog</span><span>Posts CC-BY-4.0</span><span>No trackers, no ads</span></div>
        <div className="r"><span>Last deploy: 0a1f9c2</span><span>Built on a Tuesday</span></div>
      </div>
    </div>
  );
}

Object.assign(window, {
  POSTS, AUTHORS,
  Frontpage, PostSummary,
  SiteHeader, CommandPalette,
  ArchivePage, AuthorPage,
  SubscribeBlock, AboutPage,
  SiteFooter,
});
