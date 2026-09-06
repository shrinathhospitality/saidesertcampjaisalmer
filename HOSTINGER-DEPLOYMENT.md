# Hostinger Shared Hosting Deployment

No SSH and no Node.js are required on the server. You build locally (or in CI) and
upload the result through Hostinger's File Manager or FTP.

## What gets built

```bash
npm install
npm run build
```

`npm run build` produces `dist/`. Because `public/api/`, `public/uploads/`, and
`public/.htaccess` already live inside Vite's `public/` folder, they are copied
**verbatim** into `dist/api/`, `dist/uploads/`, and `dist/.htaccess` automatically —
no separate build step for the backend.

## Where things go on the server

**Point your domain at `public_html`, then upload the *contents* of `dist/` directly
into `public_html`** (not into a `public_html/dist` subfolder — the index.html and
assets must be at the web root itself).

```
/home/<your-account>/                  <- account home directory (above the web root)
  cms-data/                            <- upload this here, NOT inside public_html
    site-settings.json, navigation.json, pages.json, packages.json, rooms.json,
    activities.json, gallery.json, testimonials.json, faqs.json, blogs.json,
    amenities.json, enquiries.json, users.json, media.json
  cms-backups/                         <- upload here too (can start empty)
  public_html/                         <- upload the CONTENTS of dist/ here
    index.html
    assets/...
    brand/...
    api/                               <- from dist/api (copied from public/api)
      config.php, auth.php, content.php, media.php, enquiries.php, backup.php,
      index.php, .htaccess, lib/
    uploads/                           <- from dist/uploads (copied from public/uploads)
      images/, documents/
    .htaccess                          <- from dist/.htaccess (copied from public/.htaccess)
```

This layout matters because `public/api/config.php` computes the data directory as
`dirname(__DIR__, 2)` relative to itself — two levels above `public_html/api`, which
lands exactly on `cms-data/` at the account root, **outside** anything Apache serves
over HTTP. This is a stronger guarantee than relying on `.htaccess` alone.

**If your hosting plan cannot create folders above `public_html`** (some restricted
plans), you can instead place `cms-data/` and `cms-backups/` inside `public_html/`.
The code auto-generates a deny-all `.htaccess` inside those folders the first time it
runs, so they stay blocked from direct browser access — but outside-the-web-root is
strictly safer and should be your default.

### Important: per-website FTP accounts on Hostinger's "Websites" plans

On Hostinger's multi-site hPanel ("Websites" section, one FTP account per site), the
FTP account's `PWD` reports its landing folder as `/public_html` — which is genuinely
correct, **not** a cosmetic label. `CDUP` from there appears to succeed and `PWD`
then reports `/`, but this is misleading: file transfer operations (`LIST`, `STOR`)
issued while positioned above `public_html` fail (the passive-mode data connection is
refused) even though the control-connection commands report success. In practice,
**this FTP account can only read/write inside `public_html`** — confirmed against a
live Hostinger "Websites" account. Use Hostinger's **File Manager** (in hPanel, not
FTP) if you need to create or edit `cms-data/`/`cms-backups/` above `public_html` by
hand; File Manager is not subject to the same restriction. If File Manager access
above `public_html` isn't available on your plan either, fall back to the
inside-`public_html` layout described just above instead.

Day-to-day operation is unaffected either way: the PHP API itself (not FTP) reads and
writes `cms-data/`/`cms-backups/` using the correct filesystem path (`dirname(__DIR__,
2)` from `public/api/config.php`), which resolves correctly regardless of what FTP can
reach — this limitation only matters for the one-time initial upload of seed content.

## Step by step

1. **Build locally:** `npm run build`.
2. **Create the folders** at your account root (above `public_html`) using Hostinger's
   **File Manager** (not FTP — see the note above): `cms-data/` and `cms-backups/`.
3. **Upload the seed JSON files** into `cms-data/` via File Manager — the same files
   from this repository's `cms-data/` folder (or your own edited versions). This is
   your starting content; it becomes editable from the admin panel from that point on.
4. **Upload the contents of `dist/`** into `public_html/` (overwrite if redeploying) —
   this part works fine over FTP/CI, since it never needs to leave `public_html`.
5. **Set the `CMS_SETUP_TOKEN` environment variable** (hPanel → your site → Advanced
   → PHP Configuration / Environment Variables) — see INITIAL-ADMIN-SETUP.md.
6. **Set folder permissions** (via File Manager's permissions dialog or FTP client):
   - `cms-data/`, `cms-backups/`, `public_html/uploads/`: `750` (owner read/write/execute,
     group read/execute) — PHP (running as your account's user via PHP-FPM on
     Hostinger) needs write access here.
   - Individual JSON/media files as they're created: `640`.
   - Everything else (`public_html/*.html`, `assets/`, `.php` source files): the
     Hostinger default (`644` files / `755` directories) is fine — PHP only needs to
     *read* `.php` files, not write them.
7. **Visit `https://yourdomain.com`** — the public site should load.
8. **Visit `https://yourdomain.com/admin/login`** and complete first-time setup.
9. Confirm HTTPS is active (Hostinger's free SSL) — session cookies automatically
   become `Secure` once the app detects HTTPS, so admin login requires HTTPS in
   production (this is intentional, not a bug).

## PHP requirements

Hostinger's shared hosting typically ships PHP 8.x with all of these already enabled;
confirm under hPanel → PHP Configuration:

- `dom`, `libxml` (HTML/SVG sanitization)
- `fileinfo` (upload MIME verification)
- `mbstring` (string handling)
- `session` (auth)
- `zip` — optional; if present, backups are real `.zip` files. If absent, the backup
  system automatically falls back to `.tar.gz` using PHP's bundled `Phar` extension,
  so backups still work either way.
- `gd` or `imagick` — not required; this CMS doesn't do server-side image resizing.

## Routing behavior (why refresh doesn't 404)

`public_html/.htaccess` (copied from `public/.htaccess`) does three things:

1. Lets `/api/*` and `/uploads/*` pass through untouched so PHP executes and media is
   served normally.
2. Falls back any other unmatched request to `/index.html`, so a hard refresh on
   `/rooms/signature-pool-villa` or a deep link shared from elsewhere loads the React
   app instead of an Apache 404 — React Router then renders the correct route
   client-side.
3. Denies direct access to any stray `.json` file that ends up under the web root
   (defense-in-depth; your real data isn't there anyway).

`public_html/api/.htaccess` denies direct requests to `lib/` (internal helpers that
assume `config.php` already ran) and to `config.php` itself.

## Redeploying after changes

Re-run `npm run build` and re-upload the contents of `dist/` over `public_html/`.
**Do not** re-upload or delete `cms-data/`/`cms-backups/` when redeploying the
frontend — they live outside `public_html` specifically so a frontend redeploy never
touches your live content or backups.

## SEO limitation (read this before promising full SEO to a client)

This is a client-rendered single-page app. `react-helmet-async` sets accurate
per-page `<title>`, meta description, canonical URL, Open Graph, Twitter Card, and
JSON-LD tags — and Google/Bing, which execute JavaScript before indexing, will see
them correctly. Tools that fetch a URL and read raw HTML without executing JavaScript
(some older crawlers, some social-media link-preview bots) will see the generic
`index.html` shell instead. Full server-rendered or prerendered SEO would require an
SSR framework (Next.js, Remix) or a prerendering step — a materially different
architecture that isn't compatible with "PHP-only, no Node.js on the server." If this
becomes a requirement later, prerendering the public routes at build time (via a
headless-browser build step run locally/in CI, not on the server) is the smallest
change that would close this gap without moving off Hostinger shared hosting.

## Local development

See README-CMS.md's "Local development" section — you run `php -S` and `npm run dev`
side by side, with Vite proxying `/api` and `/uploads` to PHP.
