# xvsf Pages CMS deployment

This directory records the reproducible delta applied to Pages CMS for the
xvsf server. It intentionally contains no credentials.

## Pinned inputs

- Pages CMS `2.1.8`, commit `6f4e860a35d934406580287e7042e5e111e207a1`
- Node.js `24.18.0`
- PostgreSQL `18`
- The checked-in `package.json` and `package-lock.json` pin security maintenance
  releases used by this deployment.

The upstream release lockfile was not deployed unchanged because its runtime
dependency tree had known high/critical advisories at deployment time. The
pinned replacement tree has no high or critical production advisories. The
remaining moderate advisories are confined to `drizzle-kit`/`esbuild`, which
are build and migration tooling and are pruned before runtime.

## Content preservation patch

Apply `serialization.patch` after checking out the pinned commit. Upstream
unconditionally removed one leading newline from Markdown bodies. The patch
keeps the body byte-for-byte stable. All 68 current posts were verified with a
parse/stringify round trip before deployment: zero body or front matter
changes.

## GitHub App manifest patch

Apply `github-app-manifest.patch` before running the upstream setup helper.
GitHub's current manifest flow generates and returns the webhook secret; it no
longer accepts a caller-provided `hook_attributes.secret`. The patch also
reduces the app to the only repository permission this blog needs (`contents:
write`) and subscribes only to repository/content events. GitHub OAuth obtains
the signed-in user's email independently through its `user:email` scope.

## Better Auth cookie patch

Apply `better-auth-cookie-order.patch` before building. Better Auth requires its
Next.js cookie integration to be the final plugin; the upstream order emitted a
runtime warning and could drop OAuth `Set-Cookie` headers. The patched build was
recompiled and its `/sign-in` route was verified after a clean service restart.

## Server layout

- Application: `/opt/pagescms/app-2.1.8-xvsf`
- Secrets: `/etc/pagescms.env` (`root:root`, mode `0600`)
- Service: `/etc/systemd/system/pagescms.service`
- Reverse proxy: Nginx on HTTPS, Pages CMS on `127.0.0.1:3000`
- Database: local PostgreSQL database and role named `pagescms`

The UI remains behind the existing Nginx Basic Authentication. The GitHub
webhook is the only Basic Auth exception; Pages CMS validates its signature
with `GITHUB_APP_WEBHOOK_SECRET`.

## Build and activation order

1. Clone the exact tag and verify the commit hash.
2. Copy the pinned package files and `next.config.mjs`, then apply
   `serialization.patch`, `github-app-manifest.patch`, and
   `better-auth-cookie-order.patch`.
3. Run `npm ci`, `npm audit --omit=dev`, and `npx next build`.
4. Create the GitHub App and write `/etc/pagescms.env` without printing its
   secrets.
5. Configure the localhost-only PostgreSQL credential, run the official
   Drizzle runtime migrator, then `npm prune --omit=dev`.
6. Start `pagescms.service` and test it directly on `127.0.0.1:3000`.
7. Install `nginx.conf`, run `nginx -t`, reload Nginx, and verify login plus a
   non-destructive repository read.
8. Only after successful verification, remove the old `/var/www/cms` Sveltia
   assets.

## Operations

- `pagescms-backup.timer` creates a PostgreSQL custom-format backup every day,
  validates its archive table of contents, and retains 14 days in
  `/var/backups/pagescms`.
- `fail2ban-pagescms.local` protects SSH and the Nginx Basic Auth boundary.
- UFW should deny unsolicited inbound traffic and allow only TCP 22, 80, and
  443. PostgreSQL and Next.js remain bound to localhost.
- `certbot-ip-renew.timer` is retained here because the IP-address certificate
  is short-lived and must be checked twice daily.
- The server currently pins `github.com` to a responsive address returned by
  GitHub's `/meta` API because the Alibaba Cloud resolver-selected route was
  intermittently timing out during OAuth code exchange. Re-check the pin
  against `/meta` during maintenance; GitHub can change its published ranges.

## CMS extensions

The root Pages CMS action reuses `pages.yml` for a complete validation and
deployment. The media action invokes `optimize-images.yml`, which pins Calibre
Image Actions 1.5.0 to its immutable commit SHA and processes only
`static/uploads`. Optimization is manual, commits only meaningful reductions,
and cannot create a push loop.

`next.config.mjs` intentionally limits the build to one CPU because the host
has 1.6 GiB RAM. `build-server.sh` gives Node a 1 GiB heap and uses a temporary
2 GiB swap file without imposing a systemd memory ceiling. The swap must be
disabled and removed after the build; it is not a runtime dependency.
