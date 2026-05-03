import styles from './AboutPage.module.scss';

export function AboutPage() {
  return (
    <div className={styles.root}>
      <h1>About <span className={styles.slash}>/</span> mamoc.</h1>
      <p className={styles.sub}>
        A blog project started by Cameron Michie and Alexander Cheetham — long-form articles on
        mathematical and technical topics, focused on generating data that produces interesting
        visuals.
      </p>

      <div className={styles.grid}>
        <div>
          <h4>What this is</h4>
          <p>
            Every post starts with an algorithm or a derivation, builds a simulation to probe it,
            and ends with an interactive you can actually play with. Think of it as a shared
            research notebook that we happen to publish.
          </p>
          <p>
            We lean academic on the math, casual on the prose, and obsessive on the interactive
            bits. If a footnote is missing from a claim, tell us.
          </p>
          <h4 style={{ marginTop: 28 }}>Why</h4>
          <p>
            Writing the posts is how we understand our own work. Publishing them forces us to
            explain properly. The blog is entirely a side project — no sponsors, no ads, no
            tracking.
          </p>
        </div>
        <div>
          <h4>Colophon</h4>
          <dl className={styles.tech}>
            <dt>stack</dt><dd>Next.js · MDX · Sass</dd>
            <dt>type</dt><dd>Fira Code · Source Serif Pro</dd>
            <dt>math</dt><dd>KaTeX</dd>
            <dt>sims</dt><dd>p5 · WebGPU · d3</dd>
            <dt>hosted</dt><dd>Vercel</dd>
            <dt>code</dt><dd><a href="https://github.com/mamoc-blog">github.com/mamoc-blog</a></dd>
            <dt>licence</dt><dd>posts CC-BY-4.0 · code MIT</dd>
          </dl>
          <h4 style={{ marginTop: 28 }}>Thanks to</h4>
          <p>
            The authors whose work we&apos;re constantly referencing: Mark Donald, Maxim Gumin,
            Kenneth Stanley, Volterra, Shannon, Turing. And to every reader who emailed to point
            out a bug in a sim — please keep doing that.
          </p>
        </div>
      </div>

      <div className={styles.pull}>
        <p>We write the posts we wish existed when we were first trying to figure these things out.</p>
        <cite>— the mamoc notebook, forever-draft</cite>
      </div>
    </div>
  );
}
