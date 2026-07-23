# xvsf CMS deployment

The administration UI is served from `https://39.106.48.91/cms/`. It edits the
Hugo repository through the GitHub Contents API; GitHub Actions remains the only
site build and deployment path.

## Pinned component

- Sveltia CMS `0.172.3`
- npm tarball SHA-512 (base64):
  `ImeK9krJzziEMg+EVL/xXLj+yONX7K/zoH87sz4EzT1p7Zs6WoXOCAJYC4HrXqmJstdRLFTh3wVAFfxbFRAFdg==`
- deployed `sveltia-cms.js` SHA-512 (hex):
  `7f8f43a72fc3a42720714782e466580e1719d5a9244f8c0079271bbf4e30abc3bc4457b597a1b07ec9a7f3b18eb17236958ac3945765caaa244c004f934e76f7`
- deployed asset: `package/dist/sveltia-cms.js` from the official npm tarball
- Fontsource variable fonts `5.3.0`:
  - `@fontsource-variable/merriweather-sans`
  - `@fontsource-variable/noto-sans-mono`
  - `@fontsource-variable/material-symbols-outlined`

The bundled JavaScript is deliberately not checked into this repository. During
deployment, download the exact npm package, verify the integrity value above,
and copy only the built asset to `/var/www/cms/sveltia-cms.js`.

The CMS fonts and icon font are checked into `deploy/cms/fonts/` and served from
the same origin. This is intentional: Google Fonts is not reliable from the
target network and is blocked by the CMS Content Security Policy. The included
font files are licensed under SIL Open Font License 1.1; their license texts are
stored beside the fonts.

## Access controls

- Nginx HTTP Basic Authentication is the outer gate.
- Sveltia CMS accepts GitHub personal access tokens only; OAuth is not exposed.
- The GitHub token must be fine-grained, restricted to `XVSHIFU/xvsf`, with only
  `Contents: Read and write` (plus GitHub's automatic metadata read permission).
- Credentials and certificate private keys live only on the server/browser and
  must never be added to the repository.

## Certificate

The host uses a Let's Encrypt short-lived IP address certificate. Certbot must be
new enough to support `--ip-address` and the `shortlived` profile. The installed
systemd timer checks renewal twice daily and reloads Nginx after a successful run.
