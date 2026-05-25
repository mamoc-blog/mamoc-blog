import fs from 'node:fs';
import path from 'node:path';
import Script from 'next/script';

// Walks public/posts/WFC and returns paths like "/posts/WFC/CITY/foo.png".
// wfc.js / wfc_flow.js read this list at runtime by parsing the JSON inside
// `<script id="imageholder">`. Previously this was rendered as 128 `<img>`
// tags, which the browser eagerly preloaded on every page visit (the `hidden`
// HTML attribute does not suppress image preloading). Switching to a JSON
// blob means zero image fetches happen until the user actually picks a
// tileset and the algorithm calls p5's loadImage().
function loadTileManifest(): string[] {
  const root = path.join(process.cwd(), 'public', 'posts', 'WFC');
  const out: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      // PNG only: REDGRID SVGs use CSS transform-box: fill-box which p5's
      // loadImage rasteriser doesn't honour faithfully. Pre-rendered PNGs
      // sit beside the SVGs in REDGRID_*; CITY is PNG-native. SVGs remain
      // as source-of-truth and aren't shipped to the browser.
      else if (/\.png$/i.test(entry.name)) {
        out.push(
          '/' +
            path
              .relative(path.join(process.cwd(), 'public'), full)
              .split(path.sep)
              .join('/'),
        );
      }
    }
  };
  try {
    walk(root);
  } catch {
    // public/posts/WFC missing — interactive will degrade gracefully
  }
  return out;
}

export default function WFCCONTAINER() {
  const tiles = loadTileManifest();

  return (
    <section className="wfc-root">
      <link rel="stylesheet" type="text/css" href="/WFC_code/wfc.css" />
      <Script src="https://cdn.jsdelivr.net/npm/p5@1.8.0/lib/p5.js" />
      <Script type="text/javascript" src="/WFC_code/wfc.js" />

      {/* Tile manifest as JSON — wfc.js parses it; nothing is fetched here.
          Escape `<` so an attacker can never close the script tag from
          inside the payload. Today the payload is purely server-derived
          filenames, but cheap defense-in-depth. */}
      <script
        id="imageholder"
        type="application/json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(tiles).replace(/</g, '\\u003c'),
        }}
      />

      <div className="wfc-shell">
        <div className="wfc-toolbar">
          <span>
            <span className="prompt">$</span> wave_function_collapse
          </span>
          <button className="resetButton" id="resetButton">↺ reset</button>
        </div>

        <div className="wfc-stage">
          {/* Help panel: hidden in step 1, revealed by wfc_flow.js once a
              tileset is selected. <details> drives the collapse/expand
              natively — no JS state to keep in sync. */}
          <details id="wfc-help" className="wfc-help" hidden>
            <summary className="wfc-help-summary">
              <span>How to use this demo</span>
              <span className="wfc-help-toggle" aria-hidden>+</span>
            </summary>
            <ul className="wfc-help-list">
              <li><b>Grid size</b> — drag the slider to choose how many cells the canvas is divided into.</li>
              <li><b>Run / Restart</b> — kick off a new collapse with your current weights. Your seed determines the outcome.</li>
              <li><b>Pause / Play</b> — freeze the algorithm to study an in-progress state, then resume.</li>
              <li><b>Step ▶|</b> — advance exactly one cell-collapse (also pauses auto-run so you can step further).</li>
              <li><b>Speed</b> — slow the auto-loop down to watch constraint propagation move across the grid.</li>
              <li><b>Click an uncollapsed cell</b> on the canvas to choose its tile manually — the algorithm propagates from your pick.</li>
              <li><b>Seed</b> — same number = same run. <b>Share</b> copies a URL that reproduces this run on someone else's machine.</li>
              <li><b>Save PNG</b> — download the completed grid as an image.</li>
            </ul>
          </details>

          <div id="tileselect">
            <p className="wfc-step"><b>step 1</b> · pick a tileset</p>
            <div className="images" />
            <a className="tileset-hint" href="#tilesets">tileset info ↓</a>
          </div>

          <div id="prob_graph" style={{ display: 'none' }}>
            <p className="wfc-step"><b>step 2</b> · tune the distribution — drag sliders to reweight tiles</p>
            <div id="prob_editor" />
            <div id="wfc-footer" />
          </div>

          <main id="wfc-container" style={{ display: 'none' }}>
            <p className="wfc-step"><b>step 3</b> · collapse — adjust grid size, then start</p>
            <div id="wfc-canvas" />
            <div id="wfc-controls" />
          </main>
        </div>
      </div>

      <Script type="text/javascript" src="/WFC_code/wfc_flow.js" />
    </section>
  );
}
