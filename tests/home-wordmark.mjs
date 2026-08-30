import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const source = readFileSync(new URL('assets/js/theme-preference.js', root), 'utf8');
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('assets/css/home.css', root), 'utf8');

assert.ok(html.indexOf('/assets/js/theme-preference.js') < html.indexOf('/assets/css/home.css'));
assert.match(html, /<link rel="preload" as="image" href="\/brand\/omarchy-wordmark.svg">/);
assert.match(html, /<div class="hero__wordmark-frame">\s*<img class="hero__wordmark" src="\/brand\/omarchy-wordmark.svg" width="4131" height="950" alt="Omarchy" fetchpriority="high">/);
assert.doesNotMatch(html, /data-wordmark-intro/, 'Static HTML must not opt into motion');
assert.match(css, /\.hero__wordmark-frame\s*\{[^}]*aspect-ratio: 4131 \/ 950;/, 'Reserve the final image dimensions throughout the reveal');
const imageRule = css.match(/\.hero \.hero__wordmark\s*\{([^}]+)\}/)[1];
assert.doesNotMatch(imageRule, /opacity|clip-path|visibility|animation/, 'Without JavaScript the image must be immediately visible');
assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*html\[data-wordmark-intro\] \.hero__wordmark/, 'Only animate after JS opt-in and with motion permission');
assert.match(css, /wordmark-write 1400ms steps\(81, end\) 120ms both/);
assert.match(css, /wordmark-phosphor 1650ms ease-out both/);
assert.match(css, /@keyframes wordmark-write\s*\{\s*from \{ clip-path: inset\(0 100% 0 0\); \}\s*to \{ clip-path: inset\(0\); \}/);
assert.match(css, /100% \{\s*filter: none;\s*opacity: 1;/, 'The finished mark must have its original color and opacity');
assert.doesNotMatch(source, /setInterval|requestAnimationFrame|fetch\(/, 'No rendering loop, new runtime or network request is needed');

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
assert.equal(normal.timers[0].delay, 1800, 'Cleanup is finite and follows the 1650ms CSS finish');
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

console.log('PASS: one-shot wordmark reveal, stable accessible image, finite fail-open cleanup, reduced-motion/deep-link bypass, preference-change cleanup and blocked-storage fallback.');
