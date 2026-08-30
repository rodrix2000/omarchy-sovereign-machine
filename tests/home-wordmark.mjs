import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('assets/js/theme-preference.js', root), 'utf8');
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('assets/css/home.css', root), 'utf8');
const pixelSource = readFileSync(new URL('assets/js/modules/wordmark.js', root), 'utf8');

assert.ok(html.indexOf('/assets/js/theme-preference.js') < html.indexOf('/assets/css/home.css'));
assert.match(html, /<link rel="preload" as="image" href="\/brand\/omarchy-wordmark.svg">/);
assert.match(html, /<div class="hero__wordmark-frame">\s*<img class="hero__wordmark" src="\/brand\/omarchy-wordmark.svg" width="4131" height="950" alt="Omarchy" fetchpriority="high">/);
assert.doesNotMatch(html, /data-wordmark-intro/, 'Static HTML must not opt into motion');
assert.match(css, /\.hero__wordmark-frame\s*\{[^}]*aspect-ratio: 4131 \/ 950;/, 'Reserve the final image dimensions throughout the reveal');
const imageRule = css.match(/\.hero \.hero__wordmark\s*\{([^}]+)\}/)[1];
assert.doesNotMatch(imageRule, /opacity|clip-path|visibility|animation/, 'Without JavaScript the image must be immediately visible');
assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*html\[data-wordmark-intro\] \.hero__wordmark-frame/, 'Only animate after JS opt-in and with motion permission');
assert.match(css, /wordmark-expand 1600ms steps\(40, end\) both/);
assert.match(css, /wordmark-crt 1850ms ease-out both/);
assert.match(css, /0%, 12% \{ clip-path: inset\(0 40\.7407% 0 46\.9136%\); \}/, 'Start with the actual R, not the image midpoint or left edge');
assert.match(css, /100% \{ clip-path: inset\(0\); \}/, 'Expand both edges to the full wordmark');
assert.match(css, /100% \{\s*filter: none;\s*opacity: 1;/, 'The finished mark must have its original color and opacity');
assert.match(css, /\.hero__wordmark-pixels\s*\{\s*display: none;/, 'The decorative canvas is never needed for the static fallback');
assert.match(css, /image-rendering: pixelated;/);
assert.doesNotMatch(source, /setInterval|requestAnimationFrame|fetch\(/, 'No rendering loop, new runtime or network request is needed');
assert.doesNotMatch(pixelSource, /setInterval|requestAnimationFrame|fetch\(/, 'Pixel refinement uses finite draws of the existing image');

function harness({ reduced = false, hash = '', blockedStorage = false, motionApi = true, timerApi = true } = {}) {
  const dataset = {};
  const timers = [];
  const listeners = new Map();
  const motion = {
    matches: reduced,
    addEventListener(type, callback) { listeners.set(type, callback); },
    removeEventListener(type, callback) {
      if (listeners.get(type) === callback) listeners.delete(type);
    },
  };
  const window = {
    location: { hash },
    localStorage: { getItem() { if (blockedStorage) throw new Error('Blocked'); return 'black-gold'; } },
    matchMedia() { if (!motionApi) throw new Error('Unavailable'); return motion; },
    setTimeout(callback, delay) {
      if (!timerApi) throw new Error('Unavailable');
      timers.push({ callback, delay });
    },
  };
  new vm.Script(source).runInNewContext({ window, document: { documentElement: { dataset } } });
  return { dataset, timers, listeners };
}

const normal = harness();
assert.equal(normal.dataset.siteTheme, 'black-gold');
assert.equal(normal.dataset.wordmarkIntro, 'true');
assert.equal(normal.timers.length, 1);
assert.equal(normal.timers[0].delay, 2200, 'Cleanup is finite and follows the 1850ms CSS finish');
normal.timers[0].callback();
assert.equal(normal.dataset.wordmarkIntro, undefined);
assert.equal(normal.listeners.size, 0, 'Remove motion listeners after the entrance');
assert.equal(normal.dataset.siteTheme, 'black-gold', 'Entrance cleanup must preserve the selected palette');

for (const options of [{ reduced: true }, { hash: '#system' }, { motionApi: false }, { timerApi: false }]) {
  const fallback = harness(options);
  assert.equal(fallback.dataset.wordmarkIntro, undefined, 'Reduced motion, deep links and unsupported APIs must show the static image');
  assert.equal(fallback.timers.length, 0);
}

const blocked = harness({ blockedStorage: true });
assert.equal(blocked.dataset.siteTheme, undefined);
assert.equal(blocked.dataset.wordmarkIntro, 'true', 'Storage denial must not break the optional entrance');
blocked.timers[0].callback();
assert.equal(blocked.dataset.wordmarkIntro, undefined);

const changed = harness();
changed.listeners.get('change')({ matches: true });
assert.equal(changed.dataset.wordmarkIntro, undefined, 'A motion preference change immediately reveals the final mark');
assert.equal(changed.listeners.size, 0);
changed.timers[0].callback();
assert.equal(changed.dataset.wordmarkIntro, undefined, 'Late cleanup is safe and must not replay the entrance');

function pixelHarness({ reduced = false, optIn = true, loaded = true, supported = true, drawError = false } = {}) {
  let timerId = 0;
  const timers = new Map();
  const draws = [];
  class Element {
    dataset = {};
    listeners = new Map();
    attributes = new Map();
    children = [];
    addEventListener(type, callback) { this.listeners.set(type, callback); }
    removeEventListener(type, callback) {
      if (this.listeners.get(type) === callback) this.listeners.delete(type);
    }
    fire(type, event = {}) { this.listeners.get(type)?.({ target: this, ...event }); }
    setAttribute(key, value) { this.attributes.set(key, value); }
    append(child) { this.children.push(child); child.parent = this; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter((child) => child !== this); }
  }
  class Image extends Element {
    complete = loaded;
    naturalWidth = loaded ? 4131 : 0;
    naturalHeight = loaded ? 950 : 0;
  }
  const image = new Image();
  const frame = new Element();
  const root = new Element();
  if (optIn) root.dataset.wordmarkIntro = 'true';
  const motion = Object.assign(new Element(), { matches: reduced });
  frame.querySelector = () => image;
  const context = {
    imageSmoothingEnabled: true,
    drawImage(img, x, y, width, height) {
      if (drawError) throw new Error('Draw unavailable');
      assert.equal(img, image);
      assert.equal(this.imageSmoothingEnabled, false);
      draws.push([width, height]);
    },
  };
  const document = {
    documentElement: root,
    querySelector: () => frame,
    createElement(tag) {
      assert.equal(tag, 'canvas');
      return Object.assign(new Element(), { getContext: () => supported ? context : null });
    },
  };
  const window = {
    matchMedia: () => motion,
    setTimeout(callback, delay) { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout(id) { timers.delete(id); },
  };
  const script = pixelSource.replace(/export\s*\{\s*ready\s*\};/, 'globalThis.wordmarkReady = ready;');
  const sandbox = vm.createContext({ document, window, HTMLElement: Element, HTMLImageElement: Image });
  new vm.Script(script).runInContext(sandbox);
  sandbox.wordmarkReady();
  const tick = (delay) => {
    for (const [id, timer] of [...timers]) {
      if (timer.delay === delay) { timers.delete(id); timer.callback(); }
    }
  };
  return { root, frame, image, motion, draws, timers, tick };
}

const pixels = pixelHarness();
assert.deepEqual(pixels.draws, [[48, 11]]);
assert.equal(pixels.frame.children[0].attributes.get('aria-hidden'), 'true');
assert.equal(pixels.frame.dataset.wordmarkPixels, 'true');
for (const delay of [250, 500, 850]) pixels.tick(delay);
assert.deepEqual(pixels.draws, [[48, 11], [64, 15], [108, 25], [216, 50]], 'Increase real canvas resolution in four finite stages');
pixels.frame.fire('animationend', { animationName: 'wordmark-expand' });
assert.equal(pixels.frame.children.length, 1, 'Keep the pixels until the final warm-up animation completes');
pixels.frame.fire('animationend', { animationName: 'wordmark-crt', target: pixels.image });
assert.equal(pixels.frame.children.length, 1, 'Ignore bubbled child animation events');
pixels.frame.fire('animationend', { animationName: 'wordmark-crt' });
assert.equal(pixels.frame.children.length, 0);
assert.equal(pixels.frame.dataset.wordmarkPixels, undefined);
assert.equal(pixels.timers.size, 0);
assert.equal(pixels.motion.listeners.size, 0);

for (const options of [{ reduced: true }, { optIn: false }, { supported: false }, { drawError: true }]) {
  const fallback = pixelHarness(options);
  assert.equal(fallback.frame.children.length, 0);
  assert.equal(fallback.frame.dataset.wordmarkPixels, undefined);
  assert.equal(fallback.timers.size, 0);
}
const preference = pixelHarness();
preference.motion.matches = true;
preference.motion.fire('change');
assert.equal(preference.frame.children.length, 0);
assert.equal(preference.timers.size, 0);

const delayed = pixelHarness({ loaded: false });
assert.equal(delayed.draws.length, 0);
delayed.image.naturalWidth = 4131;
delayed.image.naturalHeight = 950;
delayed.image.fire('load');
assert.deepEqual(delayed.draws, [[48, 11]]);
delayed.tick(2000);
assert.equal(delayed.frame.children.length, 0);
assert.equal(delayed.timers.size, 0);

const late = pixelHarness({ loaded: false });
late.tick(2000);
late.image.naturalWidth = 4131;
late.image.naturalHeight = 950;
late.image.fire('load');
assert.equal(late.draws.length, 0, 'Do not replay when a slow image arrives after cleanup');

const failedImage = pixelHarness({ loaded: false });
failedImage.image.fire('error');
assert.equal(failedImage.timers.size, 0);
assert.equal(failedImage.image.listeners.size, 0);

const expired = pixelHarness();
delete expired.root.dataset.wordmarkIntro;
expired.tick(250);
assert.equal(expired.frame.children.length, 0);
assert.equal(expired.timers.size, 0);

console.log('PASS: R-centered reveal, four-stage CRT pixels, accessible static SVG, finite timer/canvas cleanup, reduced-motion/deep-link bypass, late/failed-image safeguards and blocked-storage fallback.');
