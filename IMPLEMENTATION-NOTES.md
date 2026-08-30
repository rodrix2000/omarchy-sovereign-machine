# Sovereign Machine implementation notes

## Provenance and architecture

- Design baseline: `cda29dbedc6aba22d75664b78812ff199f42de60` from `omacom/omarchy-site`.
- Latest upstream homepage reviewed: `8f440d864356bb7de7643db78eeaf98a9812cb0f`.
- Branch: `design/sovereign-machine-homepage`.
- Architecture: static HTML, modular CSS and small ES modules.
- Runtime dependencies added: none.
- Public release prepared: 2026-08-30.

The source baseline, root tokens, existing modules and newest navigation were
audited before implementation. Later upstream video additions were incorporated
without replacing the redesign. The fork preserves upstream commit history;
this public record intentionally excludes private working notes and handoffs.

## Files changed

- `index.html`: semantic homepage structure, official wordmark masthead, open
  hero/principles, all five videos, system tour, themes, commands and community.
  The public fork adds a small independent-proposal credit and source/license
  link beneath the preserved official footer credits.
- `assets/css/home.css`: homepage tokens, alternating static gradients, open
  layouts, responsive behavior, focus states and reduced-motion rules.
- `assets/js/modules/home.js`: finite boot presentation, menu focus handling,
  system pane selection, real theme switching and command replay.
- `assets/css/video.css`, `assets/js/modules/video.js`, `assets/js/script.js`:
  progressive linked video posters and homepage module registration.
- `assets/images/home/`: original circuit textures and the attributed jester.
- `assets/images/video/`: three posters completing the upstream five-video set.
- `bin/prepare-preview`, `bin/deploy-preview`, `bin/check`, `tests/`: safe public
  packaging, explicit deployment and repeatable static/reduced-motion checks.
- README, case study, deployment documentation, license notices and two final
  captures: public review and reuse guidance.
- GitHub workflow: validate and publish the allowlisted artifact to Cloudflare
  Pages on design-branch pushes; pull requests remain validation-only.

## Design decisions

The official green identity leads the page. Black glass, cyan, gold and small
magenta/blue accents create an early-workstation character. Precision comes
from alignment, not a border around every idea. Only genuine workstation and
terminal UI retains enclosing frames.

All five videos follow the introductory principles, before the system section.
There is one interactive workstation, not a repeated hero console. Themes use
real Tokyo Night, Catppuccin and Gruvbox screenshots. Community links are open
rows and groups. The purple-and-gold Omarchs jester supplies the closing joke.

### Navigation identity refinement — 2026-08-30

Starting from `77d2538c654bd714ecc3bb2b39cefa6eb01de61b`, the navbar uses only
the official square mark, removing the repeated wordmark after visual review.
The symbol is 36px on desktop/tablet and 28px on mobile, centered in a minimum
44px-square home-link target. Its accessible name remains "Omarchy home".
These size rules are scoped to the navbar; hero and footer sizing is unchanged.

Following review, the footer wordmark was restored to official green
(`#9ece6a`), matching the hero and square symbols. It uses the original SVG
directly; the temporary cyan tint, mask styles and wrapper were removed.
The icon-only header is unchanged. No JavaScript or dependencies were added.

The local preview was checked at 1440px, 846px, 390px and 320px viewport widths:
brand assets loaded, and the controls did not overlap or cause horizontal
overflow. Mobile menu opening, Escape dismissal, focus return, section navigation
and the home link were checked. Keyboard focus
on the brand retains its cyan outline. `ruby bin/check` (including static content,
local targets and reduced motion) and `html-validate@10.4.0 index.html` passed.
Browser logs showed no errors; only the existing analytics warning that ignores
localhost. Review captures remain outside the public checkout. This refinement
was published with the explicit deployment command before the automatic release
workflow below was added.

### Destination links — 2026-08-30

Starting from `273eb56cd28261c6cd4788d41a8df4abb5e1ff36`, items 2–5 in
"Choose your way in" open their five links in new tabs: Manual, Themes, Plugins,
GitHub and Security. Both links in item 3 are included. Item 1 keeps its existing
direct ISO link without a new-tab target. Links elsewhere on the page are not
changed. The new-tab links use native `target="_blank"` behavior with
`rel="noopener noreferrer"`, an accessible new-tab announcement and a visible
diagonal arrow. No JavaScript or dependency changes were needed.

`bin/check` now guards the six destination URLs, the unchanged ISO target, and
the five new-tab targets, security attributes and accessibility hints. Local
HTML validation and the complete preflight passed. Browser checks confirmed
all six link configurations, desktop/mobile layout without overflow, and that
opening the manual creates a separate tab while the homepage stays in place.
The multi-gigabyte ISO download was not triggered during verification.

### Manual navigation link — 2026-08-30

Starting from `adc977aa67674e77b3bac6e1fb1e3040bce5a353`, both the desktop navbar
and mobile-menu Manual links use native `target="_blank"` behavior with
`rel="noopener noreferrer"` and an accessible new-tab announcement. Their
destination and visible text are unchanged. Footer links and other navigation
items are unchanged; no JavaScript, layout or dependencies were added.
`bin/check` now guards both Manual navigation links against target, security
attribute and accessibility regressions.

Local browser clicks at 1440px and 390px opened the manual in separate tabs
while preserving the homepage. The mobile menu still closed after activation,
with no horizontal overflow. Source/reduced-motion checks and HTML validation
passed; the only console warning was the existing analytics localhost notice.

### Homepage-wide destination links — 2026-08-30

Starting from `fa0b2f09142996aff27ba2eb1eee6054c815d202`, all 43 homepage links
to other pages now open new tabs, including Explore themes, the announcement,
system/CLI links, mobile navigation, community, footer credits and all five
video posters. Each uses `target="_blank"`, `rel="noopener noreferrer"` and an
accessible new-tab announcement. Existing CTA arrows point diagonally where
appropriate. All 57 original anchor destinations are unchanged.

The three ISO anchors remain byte-for-byte unchanged. The ten home/section
navigation links stay in the current tab, and the email link retains native
mail-handler behavior. This policy is scoped to the redesigned homepage, not
the inherited manual or other secondary pages. The introduction poster no
longer opts into the inline player, so its click opens YouTube consistently
with the other four videos. No JavaScript or CSS changes were required.

`bin/check` now audits the complete homepage link policy, including the native
exceptions and prevention of inline-video interception. Source, HTML and
reduced-motion checks passed. A browser DOM audit found no policy violations.
Explore themes opened separate tabs at 1440px and 390px; desktop section
navigation stayed in place, the introduction video opened YouTube without an
inline iframe, and mobile Security opened separately while closing the menu.
The homepage remained open throughout, with no horizontal overflow. The only
console warning was the existing analytics localhost notice. ISO downloads
and the email application were deliberately not activated during testing.

### Six-theme homepage preview — 2026-08-30

Starting from `99cdf166a88d850d70bf37a806417d186ee59d44`, the theme selector adds
Black Gold, Black Turq and VHS 80 alongside Tokyo Night, Catppuccin and Gruvbox.
All three additions were checked against the current official theme gallery
and their real screenshots reviewed before selection. Gold, phosphor turquoise
and retro VHS stripes extend the existing Sovereign Machine palette without
changing the site's overall theme or installing anything on visitors' systems.
Tokyo Night remains the default.

Changes are in `index.html`, `assets/css/home.css`, `assets/js/modules/home.js`,
`tests/home-themes.mjs`, `bin/check`, this document, `README.md` and
`THIRD-PARTY-NOTICES.md`. The three WebP assets already existed in the repository
and remain unchanged. There are no new assets, dependencies or animations.
Six native radio controls form one desktop row and two rows of three below
1024px. Selection updates the real screenshot, theme accent, descriptive alt
text and polite live status. Without JavaScript, six static full-size screenshot
links accompany the default preview; each opens a safe, labeled new tab.

The new regression test runs the actual theme-selection module for all six
choices, checks screenshot existence and no-JavaScript links, and guards the
default selection and markup/module mapping. The complete preflight, HTML
validation, reduced-motion regression and link audit pass. The six fallback
links bring the source audit to 49 new-tab destinations; the original three ISO
links, ten home/section links and one email link remain unchanged.

Local browser checks exercised all six selections at 1440px and 390px, with
additional layout checks at 768px and 320px. Images loaded, labels and status
matched, controls did not overlap, and there was no horizontal overflow. Target
heights were at least 48px on desktop/tablet and 64px on mobile. Desktop and
mobile screenshots were visually reviewed. The browser reported no errors,
only the pre-existing localhost analytics warning. Native radio semantics and
visible focus styles are preserved; this pass could not conclusively recheck
keyboard default actions because the browser test interface did not advance
native controls with Arrow, Space or Tab. No custom keyboard interception was
added. No-JavaScript fallback coverage in this pass is source-based.

### Homepage-wide palettes and header dropdown — 2026-08-30

Starting from `881bed54a2f2172b455744ad32d67c2f232969e8`, selecting any of the six
desktop themes applies a coordinated palette across the redesigned homepage:
section backgrounds and gradients, text, buttons, focus accents, terminal panes,
video play buttons and footer. A compact, labeled native select in the sticky
header offers the same six choices plus **Sovereign**, the original default and
reset option. The desktop screenshot, radio selection, dropdown and polite live
status are synchronized. Sovereign has no selected desktop radio; its caption
explicitly identifies the unchanged Tokyo Night screenshot as a desktop preview.

This is a theme-inspired adaptation of page colors, not an OS theme installer.
Official green logo assets, photographs and screenshots remain unmodified.
The scope is the entire redesigned homepage, not the inherited manual, gallery
or other secondary pages. Global upstream root tokens and layouts are untouched.

Files: `index.html`, `assets/css/home.css`, new `assets/css/home-themes.css`,
`assets/js/modules/home.js`, new `assets/js/theme-preference.js`,
`tests/home-themes.mjs`, `bin/check`, `README.md` and this document.
The existing design tokens remain the original fallback. Six optional CSS
palettes override their values and derive coherent panel/border/gradient tones.
The small early script restores an allowlisted saved preference before styles
render. The main module handles controls and same-origin storage events; both
storage access paths tolerate blocked storage and reject unknown values.
Only `omarchy-sovereign-theme` is stored locally, with no transmission or tracking.
Existing button movement remains, but palette color changes are immediate.

The dropdown is hidden until initialized; without JavaScript the original
design, default screenshot and all six static screenshot links remain available.
No dependencies, image assets or theme animations were added. The inherited
reduced-motion behavior and all homepage destination/download link policies are
preserved.

Regression coverage now includes both control directions for all six themes,
original reset, saved and invalid values, blocked storage, cross-tab events,
early restoration and static fallback links. All seven palettes meet 4.5:1 for
the tested text/muted/accent roles on solid raised panels and primary-button
text. This is a scoped contrast check, not a claim of full accessibility audit.
Browser checks exercised all options, swatches, reload restoration, second-tab
restoration and live cross-tab synchronization. Header layouts were checked at
320, 390, 768, 1024 and 1440px without overlap or horizontal overflow. The mobile
menu still opens, navigates to the themes section and closes after activation.
Screenshots were visually reviewed; no-JavaScript fallback and reduced motion
were checked by the source/regression suite. The prior keyboard-test-tool
limitation remains; controls retain native select/radio semantics.

### Compact navbar actions — 2026-08-30

Starting from `308f5b00ffd2311ff6f1b47ab5b48f62cda74472`, the navbar's 160px-wide
theme field becomes a small, code-native color-swatch icon in a 44px-square
target. The actual native select still occupies the control, retains its
accessible name and seven options, and receives pointer/keyboard focus. Its
wrapper displays a visible focus ring. The native tooltip identifies the
current theme and updates from either selector, restoration or cross-tab sync.

The navbar ISO link is now a quiet, theme-colored outline button, approximately
129 × 36px on desktop instead of 158 × 45px. On phones it retains a 44px height
and now displays the full "Get Omarchy" label. Hero and other page download
buttons, destinations, theme palettes and saved-preference behavior are unchanged.
Files changed: `index.html`, `assets/css/home.css`, `assets/css/home-themes.css`,
`assets/js/modules/home.js`, `tests/home-themes.mjs` and this document.

Browser checks confirmed the icon's hit target is the native select, its focus
ring is visible, changing the theme works, the tooltip follows both dropdown
and swatch selection, and the mobile menu still opens/navigates/closes. Header
layout checks at 320, 390, 768, 1024 and 1440px found no overlap or horizontal
overflow. Desktop/mobile screenshots were reviewed against the oversized-field
feedback. Only the existing localhost analytics warning appeared. Preflight,
HTML validation, contrast/reduced-motion regressions, link policy and public
packaging passed; no dependencies or separate image assets were added.

### Homepage video cinema — 2026-08-30

Baseline: `5d7b7c898e66cd0d33874ee3fbaaaf9a376b4bc4`.
The five existing posters now progressively enhance into a centered, native
dialog with a dimmed backdrop, theme-colored border, video title, 44px close
control and a direct "Watch on YouTube" link. The homepage layout and scroll
position remain intact. The iframe is created only after explicit activation
and removed on close, stopping playback; focus returns to the invoking poster.
Space activation and deliberate backdrop dismissal supplement native dialog
behavior. Modified clicks and the existing YouTube URLs are preserved.

This is an intentional, tightly scoped exception to the previous all-new-tab
video policy. No-JavaScript and unsupported-dialog visitors still receive the
original five safe new-tab links. All other destination, ISO, same-page and
email behavior is unchanged. The source audit permits only the five known
posters to request this enhancement and continues to reject legacy inline
interception of destination links. No dependencies were added; secondary pages
and their existing video behavior are untouched.

Files changed: `index.html`, `assets/css/video.css`,
`assets/js/modules/video.js`, `bin/check`, `tests/home-video.mjs`, `README.md`
and this document. The dialog uses existing palette tokens and no animations.
The privacy-enhanced YouTube embed permits inline mobile playback. Its minimum
height follows [YouTube's player requirements](https://developers.google.com/youtube/player_parameters).
Focus containment and native Escape dismissal use the platform's
[`dialog` behavior](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog).

Verification: all five source/destination mappings opened in the in-app browser;
actual introduction and Alex Finn playback was observed. Close removed the
iframe, restored focus and returned to the identical scroll offset. Space-key
activation worked. The Black Turq palette propagated to the dialog border.
Desktop (1440 × 900), mobile (390 × 844), 320px, tablet 768px and landscape
844 × 390 checks found no page or dialog horizontal overflow after correcting
an aspect-ratio/minimum-height interaction on narrow screens. Close remained
onscreen. Desktop/mobile captures were reviewed; scratch captures stay outside
the public repository. Only the existing localhost analytics warning appeared.

Preflight, HTML validation, link audit and public packaging passed. New
dependency-free tests cover lazy loading, all five IDs, close cleanup, focus and
scroll restoration, Space/modified clicks, backdrop drag protection, invalid
URLs and missing/failed dialog support. Static fallback checks and motion-free
CSS checks supplement the existing theme/reduced-motion regressions. Browser
native Escape/Tab default actions are not dispatched by the current testing
tool, so these were not claimed as end-to-end verified; no custom keyboard trap
was added to compensate. A physical keyboard/screen-reader pass and real-device
Safari testing remain outside this verification. JavaScript-disabled and
reduced-motion assertions for this slice are source/unit checks, not new browser
setting captures.

### Push-to-deploy automation — 2026-08-30

Starting from `f728d6ab0d47da60b49269affa7cced2d2bd94e7`, the existing validation
workflow follows the `rudyr_astro` GitHub Actions → Cloudflare Pages pattern.
Only a push or manual workflow run on the public fork's design branch may
deploy. A dependent job publishes the same allowlisted artifact that passed
validation, using pinned Wrangler `4.119.0` and the triggering commit SHA.
The final step verifies that the custom domain serves the packaged homepage.
No homepage content, production dependencies, DNS records or other projects
are changed by this automation setup.

A dedicated Pages-only account token is stored as a GitHub repository secret;
the account ID is a repository variable. No credentials enter source control or
the artifact. The existing public-file exclusions, noindex and cache headers,
analytics removal, manual fallback and Cloudflare rollback remain in place.
Workflow syntax was checked with `actionlint`; homepage preflight and HTML
validation passed locally. The release is verified by the push-triggered
workflow's validation, upload and live-homepage comparison jobs.

The first real push-triggered release, commit `582b39a`, passed both jobs in
[run 33325176659](https://github.com/rodrix2000/omarchy-sovereign-machine/actions/runs/33325176659)
without a manual deployment. Its runner deprecation notices prompted an update
to current Node-24-based action releases, pinned to their immutable commit SHAs.
The download action also fails on artifact digest mismatches. Node 22 remains
the command-line tooling runtime; there are still no production dependencies.

## Verification evidence

The reviewed design was visually checked at 1440px and 390px, with overflow
checks at 320px, 768px and 1132px. The two final captures are under
`docs/screenshots/`. The implementation was also tested with scripts blocked:
content, links, the native mobile disclosure, default theme and complete command
output remained available. These captures document the reviewed design, not
new screenshots from every deployment.

`ruby bin/check` repeats source/route/license/privacy checks and the isolated
reduced-motion test. `html-validate@10.4.0` validates the homepage. No-JavaScript
and reduced-motion behavior is progressive enhancement, not a fallback page.

The initial Pages upload passed HTTP checks for all 31 homepage-local paths and
SHA-256 comparisons for all 33 referenced assets/imports/fonts. All five video
links remained present. Missing/private paths returned 404. The public package
removes production analytics and includes noindex headers.

The public release's browser check exposed a stale stylesheet in an existing
Chrome session. Preview packaging now fingerprints CSS/JavaScript entry URLs
and requests cache revalidation. The source tree keeps its original filenames
and static architecture; no bundler or runtime cache workaround was added.
The raw-HTML audit also caught Cloudflare's automatic email obfuscation. A
preview-only `no-transform` response directive preserves the original public
mailto link without requiring Cloudflare's decoding script.

## Intentional deviations and limits

- The public preview uses Cloudflare Pages instead of upstream GitHub Pages.
- Preview-only analytics/metadata transformations do not edit canonical source.
- No handoff files, private notes, draft email or scratch captures are committed.
- Only Rudy's original contributions are MIT-licensed. The upstream website and
  jester did not declare a general license; no blanket relicensing is asserted.
- Design-branch pushes validate and automatically deploy through GitHub Actions;
  pull requests validate only. Manual deployment remains a fallback.

See `LICENSE.md`, `THIRD-PARTY-NOTICES.md` and `DEPLOYMENT.md` for exact scope.
