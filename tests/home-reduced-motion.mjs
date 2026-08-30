import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Test the actual module with only the DOM surfaces its initialization needs.
const source = readFileSync(new URL('../assets/js/modules/home.js', import.meta.url), 'utf8');
assert.match(source, /export\s*\{\s*ready\s*\};/);
const executable = source.replace(/export\s*\{\s*ready\s*\};/, 'globalThis.homeReady = ready;');
const expected = '~ > omarchy\nOmarchy command center\n\n~ > omarchy theme list\n~ > omarchy theme set <name>\n~ > omarchy screenshot\n~ > omarchy debug';

function harness(reducedMotion) {
  class Element {
    textContent = '';
    listeners = new Map();
    addEventListener(type, listener) { this.listeners.set(type, listener); }
    click() { this.listeners.get('click')?.(); }
  }
  class Button extends Element {}
  const classes = new Set(['home']);
  const button = new Button();
  button.textContent = 'Replay command demo';
  const output = new Element();
  output.textContent = expected;
  const timers = { timeouts: [], intervals: [], cleared: [] };
  const document = {
    body: { classList: { contains: (name) => classes.has(name), add: (name) => classes.add(name), remove: (name) => classes.delete(name) } },
    querySelector: (selector) => ({ '[data-command-replay]': button, '[data-command-output]': output }[selector] ?? null),
    querySelectorAll: () => [],
  };
  const window = {
    matchMedia: (query) => ({ matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion, addEventListener() {} }),
    setTimeout: (callback, delay) => timers.timeouts.push({ callback, delay }),
    setInterval: (callback, delay) => timers.intervals.push({ callback, delay }),
    clearInterval: (id) => timers.cleared.push(id),
  };
  const context = vm.createContext({ document, window, HTMLElement: Element, HTMLButtonElement: Button, HTMLDetailsElement: class {}, HTMLImageElement: class {}, HTMLInputElement: class {} });
  new vm.Script(executable, { filename: 'home.js' }).runInContext(context);
  context.homeReady();
  return { button, output, classes, timers };
}

const reduced = harness(true);
assert.equal(reduced.classes.has('home-boot'), false, 'Reduced motion must not add a boot-animation class');
assert.equal(reduced.timers.timeouts.length, 0, 'Reduced motion must not schedule a boot timer');
assert.equal(reduced.output.textContent, expected, 'Complete command content must remain available on initialization');
for (let click = 0; click < 2; click += 1) {
  reduced.output.textContent = 'stale output';
  reduced.button.click();
  assert.equal(reduced.output.textContent, expected, 'Replay must finish synchronously under reduced motion');
  assert.equal(reduced.button.textContent, 'Replay command demo');
}
assert.equal(reduced.timers.intervals.length, 0, 'Reduced replay must not start an animation interval');
assert.equal(reduced.timers.timeouts.length, 0, 'Reduced replay must not defer output');

// A normal-motion control proves the harness actually exercises the timer paths.
const normal = harness(false);
assert.equal(normal.classes.has('home-boot'), true);
assert.equal(normal.timers.timeouts.length, 1);
assert.equal(normal.timers.timeouts[0].delay, 1200);
normal.timers.timeouts[0].callback();
assert.equal(normal.classes.has('home-boot'), false);
normal.button.click();
assert.equal(normal.timers.intervals.length, 1);
assert.equal(normal.button.textContent, 'Stop animation');
for (const _line of expected.split('\n')) normal.timers.intervals[0].callback();
assert.equal(normal.output.textContent, expected);
assert.equal(normal.button.textContent, 'Replay command demo');
assert.deepEqual(normal.timers.cleared, [1], 'Normal replay must clear its finite interval');

console.log('PASS: reduced-motion boot guard and synchronous replay; normal replay is finite.');
