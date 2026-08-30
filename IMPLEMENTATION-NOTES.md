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
- GitHub workflow: validation-only checks replace the inherited Pages deploy.

## Design decisions

The official green identity leads the page. Black glass, cyan, gold and small
magenta/blue accents create an early-workstation character. Precision comes
from alignment, not a border around every idea. Only genuine workstation and
terminal UI retains enclosing frames.

All five videos follow the introductory principles, before the system section.
There is one interactive workstation, not a repeated hero console. Themes use
real Tokyo Night, Catppuccin and Gruvbox screenshots. Community links are open
rows and groups. The purple-and-gold Omarchs jester supplies the closing joke.

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
- Git pushes validate only; deployment is an explicit local release command.

See `LICENSE.md`, `THIRD-PARTY-NOTICES.md` and `DEPLOYMENT.md` for exact scope.
