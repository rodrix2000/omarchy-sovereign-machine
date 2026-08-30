# Cloudflare Pages preview

Live hostname: <https://omarchy.rudyr.com/>

Fallback: <https://omarchy-sovereign-machine.pages.dev/>

This independent preview uses Cloudflare Pages Direct Upload. It is not deployed
to Omarchy's production infrastructure and does not use GitHub Pages.

## Publish automatically

Commit and push reviewed changes from this public checkout to
`design/sovereign-machine-homepage`:

```sh
ruby bin/check
npx --yes html-validate@10.4.0 index.html
git push origin design/sovereign-machine-homepage
```

The [Validate and deploy homepage workflow](https://github.com/rodrix2000/omarchy-sovereign-machine/actions/workflows/check.yml)
runs the source, link, license, privacy, reduced-motion and HTML checks, then
packages the allowlisted public site. A dependent deployment job downloads that
exact artifact and uploads it to `omarchy-sovereign-machine`, labeling the
deployment with the triggering Git commit SHA. It then compares the custom
domain's homepage byte-for-byte with the packaged homepage. Check both jobs are
green before considering a release verified.

Pull requests run validation only. Deployment is restricted to pushes or manual
workflow runs on the design branch in `rodrix2000/omarchy-sovereign-machine`.
New runs supersede older runs on the same ref. The workflow uses read-only
repository permissions and the `production` environment, which also restricts
deployments to that branch. It does not require a local Cloudflare login or a
running development server.

## Deployment credentials

GitHub Actions uses these repository settings, never committed files:

- Secret `CLOUDFLARE_API_TOKEN`: dedicated
  `omarchy-sovereign-machine-github-actions` account token with **Pages Edit**
  permission only. This permission applies to Pages in the selected Cloudflare
  account, not just one Pages project; the workflow fixes the destination project.
- Variable `CLOUDFLARE_ACCOUNT_ID`: the Cloudflare account containing this Pages
  project. An account ID is not a secret.

The token is separate from `rudyr_astro`'s credential and has no DNS, Workers,
billing or token-management permissions. It has no automatic expiration; rotate
or revoke it when access changes. To rotate it, create a replacement
with the same scope, replace the GitHub secret, verify a deployment, then revoke
the old token in Cloudflare. Do not paste tokens into workflow YAML, issues or
deployment logs.

Fork users must configure their own credentials and change the workflow's
repository guard, project, branch and live URL before enabling deployment.

## Manual fallback

From this repository on `design/sovereign-machine-homepage`:

```sh
ruby bin/check
npx --yes html-validate@10.4.0 index.html
ruby bin/deploy-preview
```

Ruby and Node/npm are required for the deployment tooling. Authenticate with
Cloudflare through Wrangler's normal login flow; no credentials belong in Git.
The script targets only `omarchy-sovereign-machine` and pins Wrangler `4.119.0`
without adding a production dependency or package manifest. Fork users must
change the deployment account/project to their own before publishing.

The script includes the current working tree, including uncommitted source
changes. Commit reviewed changes before a release for a reproducible record.
The deployment is labeled dirty when working changes are present.

## GitHub and Cloudflare connection

The public Git remote is
`https://github.com/rodrix2000/omarchy-sovereign-machine.git`. The checked-out
source is packaged for the existing Pages project by GitHub Actions, using the
same `bin/prepare-preview` allowlist as the manual fallback. This matches the
`rudyr_astro` deployment pattern. Cloudflare's native Git integration is not
connected; the project remains Direct Upload. No new Pages project or DNS
change is needed for automatic deployment.

## Public package boundary

`ruby bin/prepare-preview` prints a fresh output directory under `.cloudflare/`.
Only explicitly allowed public routes, assets and license notices enter the
package. It excludes Git metadata, docs, screenshots, developer scripts,
submission drafts, internal notes, install endpoints, templates and the upstream
`CNAME` file. The package includes a true 404 page; it is not an SPA fallback.

Preview-only transformations remove Omarchy's production Plausible script,
add noindex meta/response headers, and set the homepage Open Graph URL to the
preview domain. CSS/JavaScript entry URLs gain content-hash query versions;
`Cache-Control: no-cache, no-transform` requests revalidation of the remaining
preview assets and prevents Cloudflare's email-obfuscation rewrite from making
the existing public contact link depend on JavaScript.
This prevents old cached styles from being paired with new release markup.
Source HTML retains upstream analytics/canonical metadata for
review; do not upload the entire source tree to a different host.

Noindex is a request to search engines, **not access control**. This preview and
its GitHub repository are public.

## Custom domain

The Pages project is associated with `omarchy.rudyr.com`. Its DNS record is:

| Type | Name | Target | Proxy | TTL |
| --- | --- | --- | --- | --- |
| CNAME | `omarchy` | `omarchy-sovereign-machine.pages.dev` | Proxied | Auto |

Only this exact record was added. The apex, `www`, wildcard and other services
were not changed. Cloudflare handles the site's HTTPS certificate.

An active Cache Rule named `Omarchy preview — respect origin cache headers`
matches only `(http.host eq "omarchy.rudyr.com")`. It sets Browser TTL to
**Respect origin TTL**, with cache eligibility still governed by origin headers
and no Edge TTL override. This prevents the zone's four-hour browser default
from replacing the preview's `no-cache` header. Main-site caching is unchanged.

## Verification and rollback

Check the HTTPS homepage, all local homepage links/assets, the theme controls,
and the mobile menu after deployment. Confirm `X-Robots-Tag: noindex, nofollow`
and that production analytics are absent. Missing pages and private paths such
as `/.git/config` must return 404.

Use this project's Cloudflare **Deployments** list to roll back to a previously
verified production deployment. Never select an unrelated Pages project.

References: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/),
[Direct Upload with CI](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/)
and [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).
