'use strict';

// Wave Function Collapse — vanilla JS + p5 global mode. Shares a few
// top-level vars with wfc_flow.js (tileset, prob_distr) via window.
// `var` at top level binds onto the global object so the cross-script
// reads here pick up wfc_flow.js's assignments at runtime.

var w = window.innerWidth;
var h = window.innerHeight;
var cnv_w = 600;
var cnv_h = 400;
var bslider;          // grid size slider (p5)
var slider_text;      // grid size value readout (p5)
var status_button;    // Start/Reset toggle (p5)
var step_button;      // legacy unused; kept to preserve shape
var status_bool = false;
var grid_list = [];
var gridimages = [];
var testimage;
var tracking = [];
var global_options = [];
var old_grids = [];
var backtracking = false;
var slider_max = 30;
var filled_count;
var svgFilenames = [];

// --- New: animation pacing + mixed-initiative state ---------------------

let stepIntervalMs = 0;       // 0 = run flat-out; >0 throttles draw-loop steps
let lastStepTime = 0;
let isPaused = false;
let forceStepOnce = false;    // one-shot from the Step button
let recentBacktrack = null;   // { position, framesLeft } — for the red flash
const BACKTRACK_FLASH_FRAMES = 18;
let manualCollapseQueued = null; // { cell, tile } from click-to-collapse

// --- Seeded RNG (mulberry32) -------------------------------------------

// Pull initial seed from ?seed= so a run is shareable; otherwise mint one.
let rngSeed = readSeedFromURL();
let rng = mulberry32(rngSeed);

function mulberry32(seed) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function readSeedFromURL() {
  try {
    const p = new URLSearchParams(window.location.search);
    const raw = p.get('seed');
    if (raw !== null && raw !== '') {
      const n = parseInt(raw, 10);
      if (Number.isFinite(n)) return n >>> 0;
    }
  } catch (_) { /* SSR or sandboxed — fall through */ }
  return (Math.random() * 0xFFFFFFFF) >>> 0;
}
function reseed(value) {
  rngSeed = (value >>> 0);
  rng = mulberry32(rngSeed);
}
function updateShareURL() {
  try {
    const u = new URL(window.location.href);
    u.searchParams.set('seed', String(rngSeed));
    window.history.replaceState({}, '', u.toString());
  } catch (_) { /* no-op */ }
}

// --- Direction vectors --------------------------------------------------

const CARD_DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0]];
const EIGHT_DIRS = [[0, -1], [0, 1], [-1, 0], [1, 0], [1, -1], [-1, -1], [1, 1], [-1, 1]];
const dirsFor = () => (tileset.includes('CITY') ? EIGHT_DIRS : CARD_DIRS);

// --- Grid helpers -------------------------------------------------------

const samePos = (a, b) => a[0] === b[0] && a[1] === b[1];
const findByPos = (grid, pos) => grid.find(c => samePos(c.position, pos));

// Cheap deep-clone for backtracking snapshots. Drops the gridSquare class
// identity (downstream code only touches plain fields), so a plain shape
// is ~10x faster than JSON.parse(JSON.stringify(...)).
function cloneGrid(grid) {
  return grid.map(c => ({
    position: c.position.slice(),
    options: c.options.slice(),
    underInspection: c.underInspection,
    fixed: c.fixed,
  }));
}

// Canvas dimensions track the #wfc-canvas host element so the demo fits the
// post body instead of overflowing the viewport. Recomputed on resize.
function computeCanvasSize() {
  const host = document.getElementById('wfc-canvas');
  if (host && host.clientWidth > 0) {
    cnv_w = host.clientWidth;
    cnv_h = Math.round(cnv_w * (2 / 3));
  } else {
    cnv_w = 0.6 * window.innerWidth;
    cnv_h = 0.4 * window.innerHeight;
  }
}

// --- Tile manifest ------------------------------------------------------

const manifestNode = document.getElementById('imageholder');
let manifest = [];
try {
  manifest = JSON.parse(manifestNode.textContent || '[]');
} catch (e) {
  console.warn('[wfc] tile manifest unreadable, falling back to empty', e);
}
manifest.forEach(src => {
  const tail = src.split('/posts').pop();
  if (tail && (tail.endsWith('.svg') || tail.endsWith('.png'))) {
    svgFilenames.push('.' + tail);
  }
});
const svgImages = manifest.map(src => ({ src }));

// `?autostart=0` opts out of the auto-run-on-STARTWFC behaviour. Used by
// e2e tests that need a frozen post-STARTWFC state so they can poke at
// grid_list / sample directly without the draw loop mutating it
// underneath them.
function shouldAutoStart() {
  try {
    const p = new URLSearchParams(window.location.search);
    const v = p.get('autostart');
    if (v === '0' || v === 'false') return false;
  } catch (_) { /* SSR — fall through */ }
  return true;
}

function startWFC() {
  try {
    bslider.remove();
  } catch (TypeError) {
    // no-op: bslider may not exist on first run
  }
  const max = tileset.includes('CITY') ? 32 : 30;
  bslider = createSlider(1, max, 2);
  bslider.parent('wfc-primary');

  // Keep bslider adjacent to its readout: position it after the "Grid
  // size" label but before slider_text within the wfc-primary wrapper.
  const primary = document.getElementById('wfc-primary');
  if (primary && bslider.elt && slider_text && slider_text.elt) {
    primary.insertBefore(bslider.elt, slider_text.elt);
  }

  // Full state reset so a second STARTWFC starts from scratch — without
  // this, grid_list (and the canvas) still showed the completed grid
  // from the previous run, and the Step/click pathways short-circuited
  // on finishedCollapse(grid_list).
  grid_list = createGrid(bslider.value(), true);
  backtracking = false;
  tracking = [];
  old_grids = [];
  recentBacktrack = null;
  manualCollapseQueued = null;
  forceStepOnce = false;
  isPaused = false;

  // Auto-run by default — clicking "start collapse →" should actually
  // start the collapse, not just transition to step 3. Tests that need
  // a frozen state use ?autostart=0.
  const autostart = shouldAutoStart();
  status_bool = autostart;
  if (status_button) status_button.html(autostart ? 'Restart' : 'Run');

  // Surface the run-extras UI now that we're entering step 3.
  ensureRunControls();

  // Sync the wfc-extras controls so they reflect the freshly-reset run
  // state (Pause label, speed readout, seed input).
  const playBtn = document.getElementById('wfc-play');
  if (playBtn) playBtn.textContent = 'Pause';
  const seedInput = document.getElementById('wfc-seed');
  if (seedInput) seedInput.value = String(rngSeed);

  // Belt-and-braces: re-bind the canvas click handler in case setup()'s
  // attempt ran before the canvas was in the DOM.
  bindCanvasClickHandler();
}

// --- Classes ------------------------------------------------------------

class gridSquare {
  constructor(position, options) {
    this.position = position;
    this.options = options;
    this.underInspection = false;
    this.fixed = false;
  }
}

class trackingObj {
  constructor(gridSquare, options) {
    this.gridSquare = gridSquare;
    this.options = options;
    this.indexes = [];
  }
}

class optionsError extends Error {
  constructor(message, broken_cell, grid_list) {
    super(message);
    this.name = 'OptionError';
    this.broken_cell = broken_cell;
  }
}

// --- Rendering ----------------------------------------------------------

// Heatmap: blue (low option count = constrained) → red (many options =
// uncertain). Uncollapsed cells used to be flat black; this colours them
// by entropy proxy so propagation is visible at a glance.
function entropyColor(optCount, maxOpts) {
  if (maxOpts <= 1) return [40, 40, 50];
  const t = Math.max(0, Math.min(1, (optCount - 1) / (maxOpts - 1)));
  // hue 220 (cool blue) → 0 (hot red); saturation/lightness fixed
  const hue = 220 - 220 * t;
  return hslToRgb(hue, 70, 38);
}
function hslToRgb(h, s, l) {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = h / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let [r, g, b] = [0, 0, 0];
  if (hp < 1)      [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else             [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

function renderGrid(grid_array) {
  const grid_size = Math.sqrt(grid_array.length);
  const grid_w = cnv_w / grid_size;
  const grid_h = cnv_h / grid_size;
  const maxOpts = global_options.length || 1;

  for (let i = 0; i < grid_array.length; i++) {
    const [x, y] = grid_array[i].position;
    const cell = grid_array[i];

    if (cell.options.length === 1) {
      fill('black');
      strokeWeight(2);
      stroke('white');
      if (cell.fixed === true) {
        strokeWeight(2);
        stroke('blue');
      }
      rect(x * grid_w, y * grid_h, grid_w, grid_h);
      strokeWeight(0);
      image(gridimages[cell.options[0]], x * grid_w, y * grid_h, grid_w, grid_h);
    } else if (cell.options.length === 0) {
      fill('orange');
      strokeWeight(0);
      rect(x * grid_w, y * grid_h, grid_w, grid_h);
    } else {
      const [r, g, b] = entropyColor(cell.options.length, maxOpts);
      fill(r, g, b);
      strokeWeight(0);
      rect(x * grid_w, y * grid_h, grid_w, grid_h);
    }

    // Backtracking flash overlay — paints the recently-broken cell red
    // for BACKTRACK_FLASH_FRAMES frames so failed propagations are
    // visible instead of flickering past in a single tick.
    if (recentBacktrack && samePos(cell.position, recentBacktrack.position)) {
      const alpha = Math.round(180 * (recentBacktrack.framesLeft / BACKTRACK_FLASH_FRAMES));
      fill(220, 40, 40, alpha);
      strokeWeight(0);
      rect(x * grid_w, y * grid_h, grid_w, grid_h);
    }

    fill('white');
    strokeWeight(0);
    text(cell.options.length.toString(), (x + 0.1) * grid_w, (y + 0.1) * grid_h, grid_w, grid_h);
  }

  if (recentBacktrack) {
    recentBacktrack.framesLeft -= 1;
    if (recentBacktrack.framesLeft <= 0) recentBacktrack = null;
  }
}

// --- Grid construction --------------------------------------------------

function createGrid(grid_size, tilebool = false) {
  const grid_array = [];
  const options = [];
  global_options = [];

  svgImages.forEach(image => {
    let filename = '';
    if (!tilebool) {
      filename = image.src.split('/').pop();
    } else if (image.src.includes(tileset)) {
      filename = image.src.split('/').pop();
    }
    if (filename.endsWith('.svg') || filename.endsWith('.png')) {
      const stem = filename.split('.')[0];
      options.push(stem);
      global_options.push(stem);
    }
  });

  for (let x = 0; x < grid_size; x++) {
    for (let y = 0; y < grid_size; y++) {
      grid_array.push(new gridSquare([x, y], options));
    }
  }

  return grid_array;
}

// --- Constraint propagation primitives ---------------------------------

const not = x => !x;
const identity = x => x;

function checkDirection(direction, cell, grid_list, visited, in_visited = not) {
  const new_position = [direction[0] + cell.position[0], direction[1] + cell.position[1]];
  const position_match = grid_list.some(c => samePos(c.position, new_position));
  const visited_match = in_visited(visited.some(c => samePos(c.position, new_position)));
  if (position_match && visited_match) {
    return findByPos(grid_list, new_position);
  }
  return false;
}

function inArray(input_cell, grid_list) {
  return grid_list.some(c => samePos(c.position, input_cell.position));
}

const directionsMap = new Map([
  [[0, -1].toString(), 'U'],
  [[0, 1].toString(), 'D'],
  [[-1, 0].toString(), 'L'],
  [[1, 0].toString(), 'R'],
]);

function mapDirectionToLetter(direction) {
  return directionsMap.get(direction.toString()) || false;
}

function checkConnection(cell, direction) {
  const letter = mapDirectionToLetter(direction);
  return cell.options.toString().includes(letter);
}

function checkAllOptionsForDirection(adjacent_cell, direction) {
  return adjacent_cell.options.every(str => str.includes(mapDirectionToLetter(direction)));
}

const CITY_DIR_INDEX = {
  '0,-1': [0, 4, 5],
  '0,1': [1, 6, 7],
  '1,0': [2, 4, 6],
  '-1,0': [3, 5, 7],
  '1,-1': [4, 0, 2],
  '-1,-1': [5, 0, 3],
  '1,1': [6, 1, 2],
  '-1,1': [7, 1, 3],
};

const CITY_ALL_BIOME_TOKENS = ['G', 'Y', 'LB', 'DB', 'WL', 'WR', 'WU', 'WD'];

function adjustPossibilities(collapsedCell, grid_array) {
  const queue = [];
  const visited = [collapsedCell];
  const directions = dirsFor();
  const isCity = tileset.includes('CITY');

  directions.forEach(direction => {
    const result = checkDirection(direction, collapsedCell, grid_array, visited);
    if (result) queue.push(result);
  });

  while (queue.length > 0) {
    const current_cell = queue.shift();
    if (current_cell.fixed === true) continue;

    current_cell.underInspection = true;
    const adjacent_visited = [];
    const adjacent_not_visited = [];
    directions.forEach(direction => {
      const result = checkDirection(direction, current_cell, grid_array, visited, identity);
      if (result) {
        adjacent_visited.push([result, direction]);
      } else {
        const not_visited = checkDirection(direction, current_cell, grid_array, visited);
        if (not_visited && !inArray(not_visited, queue)) {
          adjacent_not_visited.push(not_visited);
        }
      }
    });

    const split_adj = [[], [], [], [], [], [], [], []];
    const split_cur = [];
    const total_indices = [];
    const old_options = JSON.stringify(current_cell.options);

    adjacent_visited.forEach(pair => {
      const adjacent_cell = pair[0];
      const direction = pair[1];

      if (isCity) {
        const cur_indexes = CITY_DIR_INDEX[direction.toString()];
        const adj_indexes = CITY_DIR_INDEX[direction.map(x => x * -1).toString()];
        adj_indexes.forEach((adj_index, index) => {
          adjacent_cell.options.forEach(option => {
            let slot = index;
            if (direction[0] * direction[1] !== 0) slot = 0;
            const token = option.split('_')[adj_index];
            if (!split_adj[cur_indexes[slot]].includes(token)) {
              if (!total_indices.includes(cur_indexes[slot])) {
                total_indices.push(cur_indexes[slot]);
              }
              if (token === 'WLWR') {
                split_adj[cur_indexes[slot]].push('WL', 'WR');
              } else if (token === 'WUWD') {
                split_adj[cur_indexes[slot]].push('WU', 'WD');
              } else {
                split_adj[cur_indexes[slot]].push(token);
              }
            }
          });
        });
      } else {
        const reverse = direction.map(x => x * -1);
        if (!checkConnection(adjacent_cell, reverse)) {
          const connection = mapDirectionToLetter(direction);
          current_cell.options = current_cell.options.filter(str => !str.includes(connection));
        }
        if (checkAllOptionsForDirection(adjacent_cell, reverse)) {
          const connection = mapDirectionToLetter(direction);
          current_cell.options = current_cell.options.filter(str => str.includes(connection));
        }
      }
    });

    if (isCity) {
      const unvisited = [0, 1, 2, 3, 4, 5, 6, 7].filter(i => !total_indices.includes(i));
      unvisited.forEach(item => {
        split_adj[item] = CITY_ALL_BIOME_TOKENS.slice();
      });

      current_cell.options.forEach(option => {
        let c = 0;
        const tokens = option.split('_');
        for (let index = 0; index < 8; index++) {
          if (split_adj[index].includes(tokens[index])) c += 1;
        }
        if (c === 8) split_cur.push(option);
      });
      current_cell.options = split_cur;
    }

    current_cell.underInspection = false;

    if (current_cell.options.length === 0) {
      throw new optionsError('No available options', current_cell, grid_array);
    }

    visited.push(current_cell);

    if (old_options !== JSON.stringify(current_cell.options)) {
      adjacent_not_visited.forEach(item => {
        if (!inArray(item, queue)) queue.push(item);
      });
    }
  }
  return grid_array;
}

function finishedCollapse(grid_list) {
  let count = 0;
  grid_list.forEach(cell => {
    if (cell.options.length === 1) count += 1;
  });
  filled_count = count;
  return count === grid_list.length;
}

function getRandomUnCollapsedCell(grid_list) {
  const uncollapsed = grid_list.filter(cell => cell.options.length >= 1 && cell.fixed === false);
  const index = Math.floor(rng() * uncollapsed.length);
  return uncollapsed[index].position;
}

// Run/Restart button — always (re-)initialises a fresh grid and ensures
// we're in run mode. Pause/Play in wfc-extras handles pause/resume; the
// top-right ↺ goes back to step 1 for a full teardown. This removes the
// previous toggle behaviour where the label and state could fall out of
// phase across runs.
function changeState() {
  status_bool = true;
  status_button.html('Restart');
  grid_list = createGrid(bslider.value(), true);
  backtracking = false;
  tracking = [];
  old_grids = [];
  recentBacktrack = null;
  manualCollapseQueued = null;
  isPaused = false;
  const playBtn = document.getElementById('wfc-play');
  if (playBtn) playBtn.textContent = 'Pause';
  redraw();
}

// --- Distribution sampling ---------------------------------------------

function createNewNormalisedDistr(options) {
  let valid_options;
  if (tileset.includes('CITY')) {
    // CITY sliders are biome-level (Grass / Sand / Lagoon / Ocean / Wall) but
    // the actual tileset has ~100 tiles, multiple per biome. Without the
    // per-biome divisor below, a cell with 3 grass-dominant options and 1
    // sand option would weight grass at w_G * 3 vs sand at w_S * 1 — so a
    // slider set to "Grass 80%" produced ~96% grass in practice. Dividing
    // each tile's weight by the count of options that share its biome marker
    // makes the *aggregate* probability of each biome match the slider value.
    const biomeCounts = {};
    options.forEach(item => {
      const key = cityBiomeMarker(item);
      biomeCounts[key] = (biomeCounts[key] || 0) + 1;
    });
    valid_options = options.map(item => {
      const wv = find_value(prob_distr, item);
      const key = cityBiomeMarker(item);
      return [(wv || 0) / biomeCounts[key], item];
    });
  } else {
    valid_options = prob_distr.filter(item => options.includes(item[1]));
  }

  const total_prob = valid_options.reduce((sum, item) => sum + item[0], 0);
  return valid_options.map(item => [item[0] / total_prob, item[1]]);
}

const mostFrequent = arr =>
  Object.entries(
    arr.reduce((a, v) => {
      a[v] = a[v] ? a[v] + 1 : 1;
      return a;
    }, {}),
  ).reduce((a, v) => (v[1] >= a[1] ? v : a), [null, 0])[0];

const _biomeMarkerCache = new Map();
function cityBiomeMarker(name) {
  const cached = _biomeMarkerCache.get(name);
  if (cached !== undefined) return cached;
  let marker;
  if (name.includes('W')) {
    marker = 'G_G_WD_WD_G_G_G_G';
  } else {
    const m = mostFrequent(name.split('_'));
    marker = m + '_' + m + '_' + m + '_' + m + '_' + m + '_' + m + '_' + m + '_' + m;
  }
  _biomeMarkerCache.set(name, marker);
  return marker;
}

function find_value(data, string) {
  let key = string;
  if (tileset.includes('CITY')) key = cityBiomeMarker(string);
  for (const [value, string_value] of data) {
    if (string_value === key) return value;
  }
  return null;
}

function leastEntropy(grid_list) {
  const entropy_vals = new Array(grid_list.length).fill(0);
  grid_list.forEach((tile, index) => {
    if (tile.options.length === 1) {
      entropy_vals[index] = 999;
    } else {
      entropy_vals[index] = -1 * tile.options.reduce((sum, item) => {
        const p = find_value(prob_distr, item);
        return sum + p * Math.log(p);
      }, 0);
    }
  });
  return grid_list[entropy_vals.indexOf(Math.min.apply(null, entropy_vals))];
}

function reset_neighbours(bad_cell, grid_array) {
  const directions = dirsFor();
  directions.forEach(direction => {
    const result = checkDirection(direction, bad_cell, grid_array, [new gridSquare([-100, -100], 'FG')]);
    if (result) {
      const found_cell = findByPos(grid_array, result.position);
      if (found_cell) found_cell.fixed = false;
    }
  });
  return grid_array;
}

function sampleOptionsFromDistribution(options) {
  const new_distr = createNewNormalisedDistr(options);
  const rand_sample = rng();
  let cumulative_sum = 0;
  let tile;
  for (const item of new_distr) {
    tile = item[1];
    cumulative_sum += item[0];
    if (cumulative_sum >= rand_sample) return tile;
  }
  return tile;
}

// --- Run-extras UI (speed / step / seed / share / save / popover) ------

function ensureRunControls() {
  const host = document.getElementById('wfc-controls');
  if (!host || document.getElementById('wfc-extras')) return;

  const extras = document.createElement('div');
  extras.id = 'wfc-extras';
  extras.className = 'wfc-extras';
  extras.innerHTML = `
    <div class="wfc-row">
      <button id="wfc-play" type="button" title="Pause / resume the run">Pause</button>
      <button id="wfc-step" type="button" title="Advance one collapse step (pauses the auto-loop)">Step ▶|</button>
      <label class="wfc-label" for="wfc-speed">Speed</label>
      <input id="wfc-speed" type="range" min="0" max="500" step="10" value="0" />
      <span id="wfc-speed-val" class="wfc-num">fast</span>
    </div>
    <div class="wfc-row">
      <label class="wfc-label" for="wfc-seed">Seed</label>
      <input id="wfc-seed" type="number" min="0" max="4294967295" />
      <button id="wfc-share" type="button" title="Copy a URL that reproduces this run">Share</button>
      <button id="wfc-save" type="button" title="Download the canvas as PNG">Save PNG</button>
    </div>
  `;
  host.appendChild(extras);

  const seedInput = extras.querySelector('#wfc-seed');
  seedInput.value = String(rngSeed);
  seedInput.addEventListener('change', () => {
    const n = parseInt(seedInput.value, 10);
    if (Number.isFinite(n)) {
      reseed(n);
      updateShareURL();
    }
  });

  const playBtn = extras.querySelector('#wfc-play');
  playBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    playBtn.textContent = isPaused ? 'Play' : 'Pause';
  });

  extras.querySelector('#wfc-step').addEventListener('click', () => {
    ensureGridReady();
    forceStepOnce = true;
    if (!status_bool && !backtracking) status_bool = true;
    // Stepping implies pausing the auto-loop — otherwise the next frame
    // immediately advances again and the "step" is invisible.
    isPaused = true;
    playBtn.textContent = 'Play';
  });

  const speedInput = extras.querySelector('#wfc-speed');
  const speedReadout = extras.querySelector('#wfc-speed-val');
  speedInput.addEventListener('input', () => {
    stepIntervalMs = parseInt(speedInput.value, 10) || 0;
    speedReadout.textContent = stepIntervalMs === 0 ? 'fast' : stepIntervalMs + 'ms';
  });

  extras.querySelector('#wfc-share').addEventListener('click', async () => {
    updateShareURL();
    try {
      await navigator.clipboard.writeText(window.location.href);
      flashButton(extras.querySelector('#wfc-share'), 'Copied!');
    } catch (_) {
      flashButton(extras.querySelector('#wfc-share'), 'URL updated');
    }
  });

  extras.querySelector('#wfc-save').addEventListener('click', () => {
    try {
      saveCanvas('wfc-result-' + rngSeed, 'png');
    } catch (e) {
      console.warn('[wfc] saveCanvas failed', e);
    }
  });
}

function flashButton(btn, msg) {
  const original = btn.textContent;
  btn.textContent = msg;
  btn.disabled = true;
  setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 1100);
}

// --- Click-to-collapse popover -----------------------------------------

let popoverEl = null;

function closePopover() {
  if (popoverEl) {
    popoverEl.remove();
    popoverEl = null;
  }
}

// Mobile width threshold — popovers below this collapse to a full-width
// bottom sheet via CSS so we skip per-pixel positioning. Keep in sync
// with the @media rule in wfc.css.
const MOBILE_MAX_WIDTH = 640;

function openPopoverForCell(cell, screenX, screenY) {
  closePopover();
  const host = document.getElementById('wfc-canvas');
  if (!host) return;

  const pop = document.createElement('div');
  pop.className = 'wfc-popover';
  // Hide during measure so the user doesn't see the popover jump from
  // the click point to its final clamped position.
  pop.style.visibility = 'hidden';
  pop.style.left = '0px';
  pop.style.top = '0px';

  const header = document.createElement('div');
  header.className = 'wfc-popover-title';
  header.textContent = `Collapse (${cell.position[0]}, ${cell.position[1]}) — ${cell.options.length} options`;
  pop.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'wfc-popover-grid';
  cell.options.forEach(opt => {
    const img = document.createElement('img');
    img.src = thumbSrcForOption(opt);
    img.alt = opt;
    img.title = opt;
    img.addEventListener('click', e => {
      // Stop bubbling so the parent #wfc-canvas click listener doesn't
      // immediately open a fresh popover for whatever cell sits under
      // the thumbnail's screen position.
      e.stopPropagation();
      manualCollapseQueued = { cell, tile: opt };
      closePopover();
    });
    grid.appendChild(img);
  });
  pop.appendChild(grid);

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'wfc-popover-close';
  close.textContent = '✕';
  close.addEventListener('click', e => {
    e.stopPropagation();
    closePopover();
  });
  pop.appendChild(close);

  host.appendChild(pop);
  popoverEl = pop;

  // Clamp to the canvas host bounds so the popover doesn't drift off
  // the right/bottom edges when the click was near a corner. On mobile
  // (<=640px) the popover becomes a full-width bottom sheet via CSS,
  // so we leave its position alone and let the stylesheet drive it.
  const isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;
  if (!isMobile) {
    const hostRect = host.getBoundingClientRect();
    const popW = pop.offsetWidth;
    const popH = pop.offsetHeight;
    let left = screenX;
    let top = screenY;
    if (left + popW + 8 > hostRect.width) left = hostRect.width - popW - 8;
    if (top + popH + 8 > hostRect.height) top = hostRect.height - popH - 8;
    left = Math.max(8, left);
    top = Math.max(8, top);
    pop.style.left = left + 'px';
    pop.style.top = top + 'px';
  } else {
    // Mobile bottom sheet — let CSS handle position; clear the inline
    // left/top so they don't override the stylesheet.
    pop.style.left = '';
    pop.style.top = '';
  }
  pop.style.visibility = '';
}

function thumbSrcForOption(name) {
  // Walk the manifest for a tile file matching the active tileset whose
  // basename (sans extension) equals `name`. Manifest paths are absolute
  // (/posts/WFC/...), which is what the browser wants.
  for (const src of manifest) {
    if (!src.includes(tileset)) continue;
    const base = src.split('/').pop().split('.')[0];
    if (base === name) return src;
  }
  return '';
}

// Populate grid_list lazily so the new entry points (Step button,
// canvas click) work even before the user has touched the legacy p5
// "start" button. Idempotent — only runs if the grid is empty.
function ensureGridReady() {
  if (grid_list.length === 0 && bslider) {
    grid_list = createGrid(bslider.value(), true);
    tracking = [];
    old_grids = [];
    backtracking = false;
    recentBacktrack = null;
  }
}

function canvasClickHandler(evt) {
  ensureGridReady();
  if (!grid_list.length) return;
  const cnvEl = document.querySelector('#wfc-canvas canvas');
  if (!cnvEl) return;
  const r = cnvEl.getBoundingClientRect();
  const localX = evt.clientX - r.left;
  const localY = evt.clientY - r.top;
  if (localX < 0 || localY < 0 || localX > r.width || localY > r.height) return;

  const grid_size = Math.sqrt(grid_list.length);
  // Canvas is scaled via CSS to host width — map back to grid coords.
  const cx = Math.floor((localX / r.width) * grid_size);
  const cy = Math.floor((localY / r.height) * grid_size);
  const cell = findByPos(grid_list, [cx, cy]);
  if (!cell) return;
  if (cell.options.length <= 1) return; // nothing to choose

  // Pause so the popover sticks around while the reader decides.
  isPaused = true;
  const playBtn = document.getElementById('wfc-play');
  if (playBtn) playBtn.textContent = 'Play';

  // Position popover near the click, clamped to the host.
  const host = document.getElementById('wfc-canvas');
  const hostRect = host.getBoundingClientRect();
  let px = evt.clientX - hostRect.left + 12;
  let py = evt.clientY - hostRect.top + 12;
  openPopoverForCell(cell, px, py);
}

// --- p5 hooks -----------------------------------------------------------

// Build the primary-controls wrapper inside #wfc-controls so the
// grid-size label, slider, readout, and Run button share a stable
// parent. Without this, the p5-created bslider migrates to the end of
// #wfc-controls on every startWFC (parent() always appends), which on
// the second run leaves it sitting *after* #wfc-extras.
function ensurePrimaryControlsDom() {
  const ctrl = document.getElementById('wfc-controls');
  if (!ctrl || document.getElementById('wfc-primary')) return;
  const primary = document.createElement('div');
  primary.id = 'wfc-primary';
  primary.className = 'wfc-primary';
  const label = document.createElement('label');
  label.className = 'wfc-label';
  label.textContent = 'Grid size';
  primary.appendChild(label);
  ctrl.appendChild(primary);
}

function setup() {
  svgFilenames.forEach(filename => {
    gridimages[filename.split('/').at(-1).split('.')[0]] = loadImage(filename);
  });

  computeCanvasSize();
  const cnv = createCanvas(cnv_w, cnv_h);
  cnv.parent('wfc-canvas');

  ensurePrimaryControlsDom();

  bslider = createSlider(1, slider_max, 2);
  bslider.parent('wfc-primary');

  slider_text = createP(bslider.value());
  slider_text.parent('wfc-primary');

  status_button = createButton('Run');
  status_button.parent('wfc-primary');
  status_button.mousePressed(changeState);
  if (status_button.elt) status_button.elt.classList.add('wfc-run-button');

  bindCanvasClickHandler();
}

// Bind click-to-collapse via the #wfc-canvas host (clicks on the canvas
// child bubble up) so we don't race p5's canvas-attachment order. The
// _wfcClickBound flag keeps this idempotent across multiple invocations.
function bindCanvasClickHandler() {
  const host = document.getElementById('wfc-canvas');
  if (!host || host._wfcClickBound) return;
  host.addEventListener('click', evt => {
    // Ignore clicks on the popover itself.
    if (popoverEl && popoverEl.contains(evt.target)) return;
    canvasClickHandler(evt);
  });
  host._wfcClickBound = true;
}

let neighbour;
let forbacktrack;
let old_grid_list;
let toretry;
let switch_bool;

// Pick & sample the next cell to collapse. Pulled out of draw() so step
// throttling + the manual-collapse path share the same pipeline.
function pickAndCollapseOne() {
  // Manual override from a popover click wins over the heuristic pick.
  if (manualCollapseQueued) {
    neighbour = manualCollapseQueued.cell;
    const tile = manualCollapseQueued.tile;
    forbacktrack = new trackingObj(neighbour, neighbour.options);
    neighbour.options = [tile];
    forbacktrack.indexes.push(tile);
    forbacktrack.options = forbacktrack.options.filter(t => t !== tile);
    manualCollapseQueued = null;
    backtracking = true;
    status_bool = false;
    return;
  }
  if (finishedCollapse(grid_list)) return;

  switch_bool = true;
  if (switch_bool && filled_count < 0.2 * grid_list.length) {
    const neighbour_pos = getRandomUnCollapsedCell(grid_list);
    neighbour = findByPos(grid_list, neighbour_pos);
  } else {
    neighbour = leastEntropy(grid_list);
  }
  const collapsed_tile = sampleOptionsFromDistribution(neighbour.options);
  forbacktrack = new trackingObj(neighbour, neighbour.options);
  neighbour.options = [collapsed_tile];
  forbacktrack.indexes.push(collapsed_tile);
  forbacktrack.options = forbacktrack.options.filter(t => t !== collapsed_tile);
  backtracking = true;
  status_bool = false;
}

function draw() {
  try {
    drawImpl();
  } catch (e) {
    // Last-resort: an unexpected throw inside drawImpl must NOT kill
    // p5's draw loop, otherwise the canvas freezes and the Restart
    // button has nothing to render into. Wipe the run state and let
    // the next frame start fresh.
    console.error('[wfc] draw error, auto-recovering', e);
    backtracking = false;
    status_bool = false;
    tracking = [];
    old_grids = [];
    recentBacktrack = null;
    manualCollapseQueued = null;
    grid_list = bslider ? createGrid(bslider.value(), true) : [];
  }
}

function drawImpl() {
  w = window.innerWidth;
  h = window.innerHeight;
  computeCanvasSize();
  resizeCanvas(cnv_w, cnv_h);
  background(220);

  const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const allowAdvance = forceStepOnce ||
    (!isPaused && (stepIntervalMs === 0 || now - lastStepTime >= stepIntervalMs));

  // Manual collapse from the popover always advances, regardless of pause.
  const hasManual = manualCollapseQueued !== null;
  const advanceThisFrame = allowAdvance || hasManual;

  if (advanceThisFrame) {
    if (status_bool || hasManual) {
      pickAndCollapseOne();
    }

    if (backtracking) {
      let solvable = true;
      try {
        old_grid_list = cloneGrid(grid_list);
        grid_list = adjustPossibilities(neighbour, grid_list);

        tracking.push(forbacktrack);
        old_grids.push(old_grid_list);
        neighbour.fixed = true;
        backtracking = false;
        status_bool = true;
      } catch (error) {
        if (error instanceof optionsError) {
          // Surface the failed propagation as a red flash overlay.
          recentBacktrack = {
            position: error.broken_cell.position.slice(),
            framesLeft: BACKTRACK_FLASH_FRAMES,
          };
          grid_list = old_grid_list;
          const broken = findByPos(grid_list, error.broken_cell.position);
          if (broken) broken.underInspection = true;

          backtracking = true;

          // Drain tracking + old_grids together. On big CITY grids (7+)
          // it's easy to pop more than we pushed during nested backtracks,
          // and an empty .pop() returns undefined — which then propagates
          // into reset_neighbours → checkDirection.some(...) and throws
          // a secondary error that escapes this catch, killing p5's draw
          // loop. Guard every pop and bail to the auto-restart branch if
          // history is exhausted.
          if (tracking.length === 0) {
            solvable = false;
          } else {
            while (true) {
              toretry = tracking.pop();
              if (!toretry) { solvable = false; break; }
              if (toretry.options.length > 0) {
                break;
              } else if (tracking.length > 0 && old_grids.length > 0) {
                const snapshot = old_grids.pop();
                if (!snapshot) { solvable = false; break; }
                grid_list = snapshot;
                renderGrid(grid_list);
              } else {
                solvable = false;
                break;
              }
            }
          }

          if (solvable) {
            const snapshot = old_grids.pop();
            if (!snapshot) {
              solvable = false;
            } else {
              grid_list = snapshot;
              grid_list = reset_neighbours(error.broken_cell, grid_list);

              const new_tile = sampleOptionsFromDistribution(toretry.options);
              toretry.options = toretry.options.filter(element => !element.includes(new_tile));
              toretry.indexes.push(new_tile);
              tracking.push(toretry);

              const newNeighbour = findByPos(grid_list, toretry.gridSquare.position);
              if (newNeighbour) {
                neighbour = newNeighbour;
                neighbour.options = [new_tile];
              } else {
                solvable = false;
              }
            }
          }
          if (!solvable) {
            // Out of backtracking options — wipe history and start a
            // fresh grid so the run can keep making forward progress.
            old_grids = [];
            tracking = [];
            backtracking = false;
            grid_list = bslider ? createGrid(bslider.value(), true) : [];
          }
        } else {
          // Unknown error — log and continue rendering.
          console.error('[wfc]', error);
        }
      }
    }

    if (allowAdvance) lastStepTime = now;
    forceStepOnce = false;
  }

  renderGrid(grid_list);
  if (slider_text) slider_text.html(bslider.value());
}

// Deterministic p5 bootstrap. See the long comment above the IIFE in the
// original file — order-sensitive global-mode setup.
(function bootstrapP5() {
  if (typeof window === 'undefined') return;
  const MAX_TRIES = 200;
  let tries = 0;
  function tick() {
    if (typeof window.p5 === 'function') {
      if (!document.querySelector('#wfc-canvas canvas')) {
        new window.p5();
      }
      // Expose the seed so the e2e tests can assert determinism across runs.
      window.__wfcRngSeed = rngSeed;
      window.__wfcReady = true;
      return;
    }
    if (++tries >= MAX_TRIES) {
      console.error('[wfc] p5 never loaded after ' + (MAX_TRIES * 50) + 'ms; CDN blocked?');
      return;
    }
    setTimeout(tick, 50);
  }
  tick();
})();
