import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('assets/css/video.css', root), 'utf8');
const source = readFileSync(new URL('assets/js/modules/video.js', root), 'utf8');
const executable = source.replace(/export\s*\{\s*ready\s*\};/, 'globalThis.videoReady = ready;');
const posters = [...html.matchAll(/<a\b[^>]*data-video-dialog="true"[^>]*>/g)].map(([tag]) => ({
  href: tag.match(/href="([^"]+)"/)[1],
  label: tag.match(/aria-label="([^"]+)"/)[1],
}));
assert.equal(posters.length, 5);
assert.doesNotMatch(html, /<iframe\b/, 'No player may load before a user chooses a video');
assert.match(html, /<dialog class="video-dialog" id="video-dialog" aria-labelledby="video-dialog-title">/);
assert.match(html, /<button[^>]*aria-label="Close video"/);
assert.match(html, /aria-label="Watch on YouTube \(opens in a new tab\)"/);
assert.match(css, /\.home \.video-dialog:not\(\[open\]\)\s*\{\s*display: none;/);
assert.match(css, /html:has\(\.home \.video-dialog\[open\]\)\s*\{\s*overflow: hidden;/);
assert.match(css, /border: 1px solid var\(--sm-cyan\)/, 'Chrome must inherit the selected palette');
assert.match(css, /\.video-dialog__screen\s*\{[^}]*min-height: 200px;/, 'Keep the embedded player at YouTube\'s minimum height on small phones');
assert.match(css, /\.video-dialog__screen\s*\{[^}]*width: 100%;/, 'Minimum player height must not expand its width beyond the dialog');
assert.doesNotMatch(css.slice(css.indexOf('/* The homepage cinema')), /\b(?:animation|transition)\s*:/, 'The overlay has no essential or decorative motion');
assert.doesNotMatch(source, /setTimeout|setInterval|requestAnimationFrame/);

function harness({ supported = true, missing = false, failOpen = false, href } = {}) {
  let active;
  const frames = [];
  const restored = [];
  class Element {
    attributes = new Map();
    listeners = new Map();
    children = [];
    textContent = '';
    setAttribute(key, value) { this.attributes.set(key, value); }
    getAttribute(key) { return this.attributes.get(key) ?? null; }
    addEventListener(type, callback) {
      const callbacks = this.listeners.get(type) ?? [];
      callbacks.push(callback);
      this.listeners.set(type, callbacks);
    }
    fire(type, options = {}) {
      const event = {
        type, target: this, button: 0, defaultPrevented: false,
        preventDefault() { this.defaultPrevented = true; }, ...options,
      };
      for (const callback of this.listeners.get(type) ?? []) callback(event);
      return event;
    }
    click() { return this.fire('click'); }
    focus(options) { active = this; this.focusOptions = options; }
    replaceChildren(...children) { this.children = children; }
  }
  const title = new Element();
  const screen = new Element();
  const close = new Element();
  const youtube = new Element();
  const dialog = Object.assign(new Element(), { id: 'video-dialog', open: false });
  dialog.querySelector = (selector) => ({ '#video-dialog-title': title, '.video-dialog__screen': screen, '.video-dialog__close': close, a: youtube }[selector]);
  dialog.showModal = supported ? () => { if (failOpen) throw new Error('Unavailable'); dialog.open = true; } : undefined;
  dialog.close = () => { dialog.open = false; dialog.fire('close'); };
  dialog.getBoundingClientRect = () => ({ left: 100, right: 1100, top: 100, bottom: 750 });
  const facades = posters.map((poster, index) => {
    const facade = new Element();
    facade.href = href ?? poster.href;
    facade.name = `Video ${index + 1}`;
    facade.setAttribute('href', facade.href);
    facade.setAttribute('aria-label', poster.label);
    facade.closest = () => ({ querySelector: () => ({ textContent: facade.name }) });
    return facade;
  });
  const context = vm.createContext({
    document: {
      querySelector: (selector) => selector === '.home .video-dialog' && !missing ? dialog : null,
      querySelectorAll: (selector) => selector === '.home #watch .video__facade[data-video-dialog]' ? facades : [],
      createElement: (name) => {
        assert.equal(name, 'iframe');
        const frame = new Element();
        frames.push(frame);
        return frame;
      },
    },
    window: { scrollX: 0, scrollY: 1375, scrollTo: (position) => restored.push(position) },
  });
  new vm.Script(executable, { filename: 'video.js' }).runInContext(context);
  context.videoReady();
  return { facades, dialog, title, screen, close, youtube, frames, restored, active: () => active };
}

const app = harness();
assert.equal(app.frames.length, 0);
assert.equal(app.dialog.open, false);
for (const facade of app.facades) {
  assert.equal(facade.getAttribute('role'), 'button');
  assert.equal(facade.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(facade.getAttribute('aria-controls'), 'video-dialog');
  assert.equal(facade.getAttribute('aria-label'), `Play ${facade.name} (opens video dialog)`);
  for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
    assert.equal(facade.fire('click', options).defaultPrevented, !!options.defaultPrevented);
    assert.equal(app.dialog.open, false, 'Modified activation must retain the real link');
  }
  const before = app.frames.length;
  assert.equal(facade.click().defaultPrevented, true);
  assert.equal(app.dialog.open, true);
  assert.equal(app.frames.length, before + 1);
  assert.equal(app.screen.children.length, 1);
  const frame = app.screen.children[0];
  const id = facade.href.split('v=')[1];
  assert.equal(frame.src, `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`);
  assert.equal(frame.title, facade.name);
  assert.equal(frame.allowFullscreen, true);
  assert.equal(frame.referrerPolicy, 'strict-origin-when-cross-origin');
  assert.equal(app.youtube.href, facade.href);
  assert.equal(app.title.textContent, facade.name);
  assert.equal(app.active(), app.close);
  assert.equal(app.close.focusOptions.preventScroll, true);
  app.close.click();
  assert.equal(app.dialog.open, false);
  assert.equal(app.screen.children.length, 0, 'Close removes the player and stops playback');
  assert.equal(app.active(), facade);
  assert.equal(facade.focusOptions.preventScroll, true);
  assert.equal(app.restored.at(-1).top, 1375);
  assert.equal(app.restored.at(-1).behavior, 'instant');
}

const space = app.facades[0].fire('keydown', { key: ' ' });
assert.equal(space.defaultPrevented, true);
assert.equal(app.dialog.open, true);
app.dialog.close(); // Exercises the same cleanup event dispatched by native Escape.
assert.equal(app.screen.children.length, 0);
assert.equal(app.active(), app.facades[0]);
app.facades[0].fire('keydown', { key: ' ', repeat: true });
assert.equal(app.dialog.open, false);
app.facades[0].fire('keydown', { key: ' ', metaKey: true });
assert.equal(app.dialog.open, false);

for (const [type, options] of [
  ['click', {}], ['click', { detail: 0 }], ['click', { metaKey: true }],
  ['click', { ctrlKey: true }], ['click', { shiftKey: true }], ['auxclick', { button: 1 }],
]) {
  app.facades[0].click();
  const nativeClose = app.dialog.close;
  app.dialog.close = () => {
    assert.equal(app.screen.children.length, 0, 'YouTube handoff must stop playback before the queued close event');
    nativeClose();
  };
  const handoff = app.youtube.fire(type, options);
  app.dialog.close = nativeClose;
  assert.equal(handoff.defaultPrevented, false, 'Keep native new-tab navigation, including keyboard and modified clicks');
  assert.equal(app.youtube.href, app.facades[0].href);
  assert.equal(app.dialog.open, false);
  assert.equal(app.screen.children.length, 0);
  assert.equal(app.active(), app.facades[0]);
  assert.equal(app.restored.at(-1).top, 1375);
}

app.facades[0].click();
app.youtube.fire('click', { defaultPrevented: true });
app.youtube.fire('auxclick', { button: 1, defaultPrevented: true });
app.youtube.fire('auxclick', { button: 2 });
assert.equal(app.dialog.open, true, 'Canceled navigation and right-click must not close playback');
assert.equal(app.screen.children.length, 1);
app.dialog.close();

app.facades[0].click();
app.dialog.fire('pointerdown', { clientX: 500, clientY: 150 });
app.dialog.fire('click', { clientX: 10, clientY: 10 });
assert.equal(app.dialog.open, true, 'Dragging from inside the dialog must not dismiss it');
app.dialog.fire('pointerdown', { clientX: 10, clientY: 10 });
app.dialog.fire('click', { clientX: 10, clientY: 10 });
assert.equal(app.dialog.open, false);
assert.equal(app.screen.children.length, 0);

for (const options of [{ supported: false }, { missing: true }, { failOpen: true }, { href: 'https://example.com/watch?v=F7fe9pa8OeE' }, { href: 'https://www.youtube.com/watch?v=bad' }]) {
  const fallback = harness(options);
  assert.equal(fallback.facades[0].click().defaultPrevented, false);
  assert.equal(fallback.frames.length, 0);
  assert.equal(fallback.dialog.open, false);
  if (!options.failOpen) assert.equal(fallback.facades[0].getAttribute('role'), null);
}

console.log('PASS: five lazy cinema players, safe native fallbacks, button/Space semantics, immediate YouTube handoff cleanup, close cleanup, focus/scroll restoration, backdrop dismissal, unavailable-dialog fallback, and motion-free chrome.');
