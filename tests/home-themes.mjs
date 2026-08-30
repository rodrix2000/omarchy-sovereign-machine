import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('assets/css/home.css', root), 'utf8');
const palettes = readFileSync(new URL('assets/css/home-themes.css', root), 'utf8');
const source = readFileSync(new URL('assets/js/modules/home.js', root), 'utf8');
const executable = source.replace(/export\s*\{\s*ready\s*\};/, 'globalThis.initializeThemes = setupThemePreview; globalThis.themes = THEMES;');
const expected = ['tokyo-night', 'catppuccin', 'gruvbox', 'black-gold', 'black-turq', 'vhs-80'];
const radioTags = [...html.matchAll(/<input\b[^>]*name="theme-preview"[^>]*>/g)].map(([tag]) => tag);
const values = radioTags.map((tag) => tag.match(/\bvalue="([^"]+)"/)?.[1]);
assert.deepEqual(values, expected, 'All six previews must have native, ordered radio controls');
assert.equal(radioTags.filter((tag) => /\bchecked\b/.test(tag)).length, 0, 'Original site palette is distinct from the six desktop themes');
radioTags.forEach((tag) => assert.match(tag, /type="radio"/));
const dropdown = html.match(/<select\b[^>]*data-site-theme-select[^>]*>([\s\S]*?)<\/select>/)?.[1] ?? '';
assert.deepEqual([...dropdown.matchAll(/<option value="([^"]+)"/g)].map((match) => match[1]), ['sovereign', ...expected]);
assert.match(dropdown, /<option value="sovereign" selected>/);
assert.match(html, /<label class="site-theme" hidden>/, 'Do not expose a nonfunctional dropdown without JavaScript');
assert.match(html, /<select[^>]*aria-label="Site color theme"[^>]*title="Theme: Sovereign \(original\)"/);
assert.match(html, /<svg class="site-theme__icon"[^>]*aria-hidden="true"/);
assert.match(palettes, /\.site-theme:has\(select:focus-visible\)/, 'The icon wrapper must expose native select focus');
assert.match(palettes, /\.site-theme\s*\{[^}]*border: 1px solid var\(--sm-line\);/, 'The theme control must remain discoverable before hover or focus');
assert.match(palettes, /\.site-theme\s*\{[^}]*height: 2\.75rem;[^}]*width: 2\.75rem;/, 'Keep the compact theme control at a 44px touch target');
assert.match(html, /data-theme-status aria-live="polite"/);
assert.match(html, /class="sm-button site-nav__cta"/, 'Only the navbar CTA uses the compact outline treatment');
assert.match(html, /class="sm-button sm-button--primary" href="https:\/\/iso\.omarchy\.org\//, 'The hero keeps its larger filled download button');

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
class Select extends Input {
  label = Object.assign(new Element(), { hidden: true });
  closest(selector) { return selector === '.site-theme' ? this.label : null; }
}

function harness(saved = null, storageBlocked = false) {
  const image = new Image();
  const status = new Element();
  const preview = new Element();
  const body = new Element();
  const select = new Select('sovereign');
  const inputs = values.map((value) => new Input(value));
  const storage = new Map(saved === null ? [] : [['omarchy-sovereign-theme', saved]]);
  const events = new Map();
  preview.querySelector = (selector) => ({ '[data-theme-image]': image, '[data-theme-status]': status }[selector] ?? null);
  const context = vm.createContext({
    document: {
      body,
      documentElement: body,
      querySelector: (selector) => ({ '[data-theme-preview]': preview, '[data-site-theme-select]': select }[selector] ?? null),
      querySelectorAll: (selector) => selector === 'input[name="theme-preview"]' ? inputs : [],
    },
    window: {
      localStorage: {
        getItem(key) { if (storageBlocked) throw new Error('Storage blocked'); return storage.get(key) ?? null; },
        setItem(key, value) { if (storageBlocked) throw new Error('Storage blocked'); storage.set(key, value); },
      },
      addEventListener: (name, callback) => events.set(name, callback),
    },
    HTMLElement: Element,
    HTMLImageElement: Image,
    HTMLInputElement: Input,
    HTMLSelectElement: Select,
  });
  new vm.Script(executable, { filename: 'home.js' }).runInContext(context);
  context.initializeThemes();
  return { image, status, preview, body, select, inputs, storage, events, context };
}

const { image, status, preview, body, select, inputs, storage, events, context } = harness();
assert.deepEqual(Object.keys(context.themes), expected, 'Markup and module choices must stay synchronized');
assert.equal(body.dataset.siteTheme, 'sovereign');
assert.equal(select.value, 'sovereign');
assert.equal(select.title, 'Theme: Sovereign (original)');
assert.equal(select.label.hidden, false);
assert.equal(inputs.some((input) => input.checked), false);
assert.equal(storage.size, 0, 'Do not write a preference before a user chooses one');

const fallback = html.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1] ?? '';
for (const input of inputs) {
  const theme = context.themes[input.value];
  assert.ok(existsSync(new URL(`.${theme.image}`, root)), `Missing screenshot for ${theme.name}`);
  assert.ok(theme.alt.includes(theme.name), `Missing descriptive alt text for ${theme.name}`);
  assert.ok(fallback.includes(`href="${theme.image}"`), `No-JavaScript screenshot link missing for ${theme.name}`);
  assert.ok(palettes.includes(`[data-site-theme="${input.value}"]`), `Missing page palette for ${theme.name}`);
  if (input.value !== 'tokyo-night') {
    assert.ok(css.includes(`[data-theme-preview="${input.value}"]`), `Missing accent style for ${theme.name}`);
  }
  inputs.forEach((candidate) => { candidate.checked = candidate === input; });
  input.change();
  assert.equal(preview.dataset.themePreview, input.value);
  assert.equal(body.dataset.siteTheme, input.value);
  assert.equal(select.value, input.value);
  assert.equal(select.title, `Theme: ${theme.name}`);
  assert.equal(storage.get('omarchy-sovereign-theme'), input.value);
  assert.equal(image.src, theme.image);
  assert.equal(image.alt, theme.alt);
  assert.equal(status.textContent, `${theme.name} palette applied to this page · ${theme.name} desktop preview.`);
}

// Ignore an unchecked radio's change event rather than replacing the selection.
const selectedImage = image.src;
inputs[0].change();
assert.equal(image.src, selectedImage);

for (const value of expected) {
  select.value = value;
  select.change();
  assert.equal(body.dataset.siteTheme, value);
  assert.equal(inputs.find((input) => input.checked)?.value, value);
  assert.equal(image.src, context.themes[value].image);
  assert.equal(storage.get('omarchy-sovereign-theme'), value);
}

select.value = 'sovereign';
select.change();
assert.equal(select.title, 'Theme: Sovereign (original)');
assert.equal(body.dataset.siteTheme, 'sovereign');
assert.equal(inputs.some((input) => input.checked), false);
assert.equal(preview.dataset.themePreview, 'tokyo-night');
assert.equal(status.textContent, 'Original site palette · Tokyo Night desktop preview.');

for (const value of ['sovereign', ...expected]) {
  const restored = harness(value);
  assert.equal(restored.body.dataset.siteTheme, value);
  assert.equal(restored.select.value, value);
}
for (const value of ['unknown', '__proto__', 'constructor', '']) {
  assert.equal(harness(value).body.dataset.siteTheme, 'sovereign', 'Invalid saved data must fall back safely');
}
const blocked = harness('black-gold', true);
blocked.select.value = 'black-turq';
blocked.select.change();
assert.equal(blocked.body.dataset.siteTheme, 'black-turq', 'Storage denial must not break theme switching');

events.get('storage')({ key: 'unrelated', newValue: 'gruvbox' });
assert.equal(body.dataset.siteTheme, 'sovereign');
events.get('storage')({ key: 'omarchy-sovereign-theme', newValue: 'gruvbox' });
assert.equal(body.dataset.siteTheme, 'gruvbox');
assert.equal(select.value, 'gruvbox');
assert.equal(inputs.find((input) => input.checked)?.value, 'gruvbox');
events.get('storage')({ key: 'omarchy-sovereign-theme', newValue: null });
assert.equal(body.dataset.siteTheme, 'sovereign');

// Contrast checks for the solid surfaces; screenshots and decorative artwork
// are intentionally not recolored. Derived colors mirror home-themes.css.
const rgb = (hex) => hex.match(/[\da-f]{2}/gi).map((pair) => parseInt(pair, 16) / 255);
const mix = (first, second, weight) => first.map((value, index) => value * (1 - weight) + second[index] * weight);
const luminance = (color) => color.map((c) => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index], 0);
const contrast = (a, b) => (Math.max(luminance(a), luminance(b)) + 0.05) / (Math.min(luminance(a), luminance(b)) + 0.05);
for (const theme of ['sovereign', ...expected]) {
  const block = theme === 'sovereign' ? css.match(/\.home\s*\{([^}]+)\}/)[1] : palettes.split(`[data-site-theme="${theme}"] .home {`)[1].split('}')[0];
  const colors = Object.fromEntries([...block.matchAll(/--sm-([a-z-]+):\s*(#[\da-f]{6})/g)].map(([, key, value]) => [key, rgb(value)]));
  const panel = theme === 'sovereign' ? colors['panel-raised'] : mix(colors.void, colors.text, 0.07);
  for (const role of ['text', 'muted', 'cyan', 'gold']) {
    assert.ok(contrast(colors[role], panel) >= 4.5, `${theme}: ${role} must have readable contrast on raised panels`);
  }
  assert.ok(contrast(colors.deep, colors.gold) >= 4.5, `${theme}: primary button text contrast`);
}

const earlySource = readFileSync(new URL('assets/js/theme-preference.js', root), 'utf8');
assert.ok(html.indexOf('/assets/js/theme-preference.js') < html.indexOf('/assets/css/home.css'), 'Restore the palette before loading homepage styles');
for (const saved of [...expected, 'sovereign', '__proto__', 'unknown', null]) {
  const document = { documentElement: { dataset: {} } };
  new vm.Script(earlySource).runInNewContext({ document, window: { localStorage: { getItem: () => saved } } });
  assert.equal(document.documentElement.dataset.siteTheme, ['sovereign', ...expected].includes(saved) ? saved : undefined);
}
assert.doesNotThrow(() => new vm.Script(earlySource).runInNewContext({ document: {}, window: { get localStorage() { throw new Error('Blocked'); } } }));

console.log('PASS: six page palettes synchronize radios, dropdown, screenshots and accessible status; original reset, persistence, blocked storage and static fallback links pass.');
console.log('PASS: all seven palettes meet 4.5:1 for tested text/accent roles on solid raised surfaces and primary button text.');
