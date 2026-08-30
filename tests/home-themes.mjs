import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('assets/css/home.css', root), 'utf8');
const source = readFileSync(new URL('assets/js/modules/home.js', root), 'utf8');
const executable = source.replace(/export\s*\{\s*ready\s*\};/, 'globalThis.initializeThemes = setupThemePreview; globalThis.themes = THEMES;');
const expected = ['tokyo-night', 'catppuccin', 'gruvbox', 'black-gold', 'black-turq', 'vhs-80'];
const radioTags = [...html.matchAll(/<input\b[^>]*name="theme-preview"[^>]*>/g)].map(([tag]) => tag);
const values = radioTags.map((tag) => tag.match(/\bvalue="([^"]+)"/)?.[1]);
assert.deepEqual(values, expected, 'All six previews must have native, ordered radio controls');
assert.equal(radioTags.filter((tag) => /\bchecked\b/.test(tag)).length, 1);
assert.match(radioTags[0], /\bchecked\b/, 'Tokyo Night must remain the default');

class Element {
  dataset = {};
  textContent = '';
  listeners = new Map();
  addEventListener(type, callback) { this.listeners.set(type, callback); }
}
class Image extends Element {
  src = '/manual/images/tokyo-night-preview.webp';
  alt = 'Tokyo Night theme running across an Omarchy desktop';
}
class Input extends Element {
  constructor(value, checked = false) {
    super();
    this.value = value;
    this.checked = checked;
  }
  change() { this.listeners.get('change')?.(); }
}

const image = new Image();
const status = new Element();
const preview = new Element();
preview.dataset.themePreview = 'tokyo-night';
status.textContent = 'Tokyo Night preview selected.';
preview.querySelector = (selector) => ({ '[data-theme-image]': image, '[data-theme-status]': status }[selector] ?? null);
const inputs = values.map((value, index) => new Input(value, index === 0));
const context = vm.createContext({
  document: {
    querySelector: (selector) => selector === '[data-theme-preview]' ? preview : null,
    querySelectorAll: (selector) => selector === 'input[name="theme-preview"]' ? inputs : [],
  },
  HTMLElement: Element,
  HTMLImageElement: Image,
  HTMLInputElement: Input,
});
new vm.Script(executable, { filename: 'home.js' }).runInContext(context);
context.initializeThemes();
assert.deepEqual(Object.keys(context.themes), expected, 'Markup and module choices must stay synchronized');

const fallback = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '';
for (const input of inputs) {
  const theme = context.themes[input.value];
  assert.ok(existsSync(new URL(`.${theme.image}`, root)), `Missing screenshot for ${theme.name}`);
  assert.ok(theme.alt.includes(theme.name), `Missing descriptive alt text for ${theme.name}`);
  assert.ok(fallback.includes(`href="${theme.image}"`), `No-JavaScript screenshot link missing for ${theme.name}`);
  if (input.value !== 'tokyo-night') {
    assert.ok(css.includes(`[data-theme-preview="${input.value}"]`), `Missing accent style for ${theme.name}`);
  }
  inputs.forEach((candidate) => { candidate.checked = candidate === input; });
  input.change();
  assert.equal(preview.dataset.themePreview, input.value);
  assert.equal(image.src, theme.image);
  assert.equal(image.alt, theme.alt);
  assert.equal(status.textContent, `${theme.name} preview selected.`);
}

// Ignore an unchecked radio's change event rather than replacing the selection.
const selectedImage = image.src;
inputs[0].change();
assert.equal(image.src, selectedImage);

console.log('PASS: six native theme controls update real screenshots, accents and accessible status; all have static fallback links.');
