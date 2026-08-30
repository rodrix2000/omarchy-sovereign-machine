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
