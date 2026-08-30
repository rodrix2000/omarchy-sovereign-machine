# Cloudflare Pages preview

Live hostname: <https://omarchy.rudyr.com/>

Fallback: <https://omarchy-sovereign-machine.pages.dev/>

This independent preview uses Cloudflare Pages Direct Upload. It is not deployed
to Omarchy's production infrastructure and does not use GitHub Pages.

## Publish

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

## GitHub and Cloudflare are linked by the release workflow

The public Git remote is
`https://github.com/rodrix2000/omarchy-sovereign-machine.git`. The checked-out
source is what `bin/deploy-preview` packages for the existing Pages project.
GitHub Actions performs validation only. **Pushing a commit does not deploy it.**
No GitHub Cloudflare secret or persistent deployment token has been created.

## Public package boundary

`ruby bin/prepare-preview` prints a fresh output directory under `.cloudflare/`.
Only explicitly allowed public routes, assets and license notices enter the
package. It excludes Git metadata, docs, screenshots, developer scripts,
submission drafts, internal notes, install endpoints, templates and the upstream
`CNAME` file. The package includes a true 404 page; it is not an SPA fallback.

Preview-only transformations remove Omarchy's production Plausible script,
add noindex meta/response headers, and set the homepage Open Graph URL to the
preview domain. Source HTML retains upstream analytics/canonical metadata for
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

## Verification and rollback

Check the HTTPS homepage, all local homepage links/assets, the theme controls,
and the mobile menu after deployment. Confirm `X-Robots-Tag: noindex, nofollow`
and that production analytics are absent. Missing pages and private paths such
as `/.git/config` must return 404.

Use this project's Cloudflare **Deployments** list to roll back to a previously
verified production deployment. Never select an unrelated Pages project.

References: [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)
and [custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).
