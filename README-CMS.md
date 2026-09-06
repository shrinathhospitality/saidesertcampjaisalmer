# Sai Desert Camp & Resort — CMS

This project is a React + Vite public website with a WordPress-style admin CMS bolted
on: a React admin panel under `/admin`, a small PHP API under `/api`, and JSON files
as the database. No MySQL, no Node.js backend, no external services.

For deployment to Hostinger shared hosting, see **HOSTINGER-DEPLOYMENT.md**.
For the JSON schema of every content file, see **JSON-SCHEMA.md**.
For creating the first admin account, see **INITIAL-ADMIN-SETUP.md**.

## Architecture

```
src/                  React public site (pages, layouts, components)
src/admin/            React admin SPA, mounted at /admin/* inside the same app
src/services/         Public-site content loading (fetch + bundled fallback)
src/context/          ContentContext — the public site's single content source
src/data/*.json       Build-time bundled fallback content (see "Two copies of content" below)

public/               Vite's static asset root — copied verbatim into dist/ on build
public/api/*.php      The PHP API (becomes public_html/api on Hostinger)
public/uploads/       Media library storage (becomes public_html/uploads)
public/.htaccess      SPA routing fallback + API/upload passthrough
public/api/.htaccess  API-specific Apache rules

cms-data/*.json       Live CMS content (the actual "database"), OUTSIDE the web root
cms-backups/          Backup archives and auto-backups-before-write, OUTSIDE the web root
```

### Two copies of content — this is intentional, not duplication

- `src/data/*.json` is bundled into the JavaScript at build time and used as a
  read-only fallback so the site is never blank if the API is unreachable.
- `cms-data/*.json` is the live, PHP-writable content the admin panel edits.

The public site always tries the live API first and falls back to the bundled copy
per content type. After you make real edits in the admin panel, refresh
`src/data/*.json` from a current backup occasionally (see "Refreshing the fallback
copy" below) so the offline fallback doesn't drift too far from reality — this is
optional maintenance, not required for the site to function correctly.

### Why `cms-data/` and `cms-backups/` live outside `public/`

Vite copies everything under `public/` into `dist/` untouched, and `dist/` becomes
`public_html/` on Hostinger. Putting the JSON database inside that tree would make it
web-reachable unless `.htaccess` is perfectly configured. Instead, `cms-data/` and
`cms-backups/` sit **one level above** `public/` (and, in production, one level above
`public_html/`) — outside the web-servable tree entirely, so they are unreachable over
HTTP by construction. `public/api/config.php` resolves this path with
`dirname(__DIR__, 2)`, which works identically in dev and production.

## Local development

You need two processes running at once: Vite (frontend) and PHP's built-in server
(API). Vite proxies `/api` and `/uploads` to PHP so the frontend always uses relative
paths — no hardcoded `localhost` URLs anywhere in the app.

```bash
# Terminal 1 — PHP API
php -S localhost:8090 -t public

# Terminal 2 — Vite dev server (proxies /api and /uploads to the PHP server above)
npm run dev
```

If you run PHP on a different port, set `VITE_API_PROXY_TARGET`:

```bash
VITE_API_PROXY_TARGET=http://localhost:9000 npm run dev
```

Then visit `http://localhost:3000` for the public site and
`http://localhost:3000/admin/login` for the admin panel.

### First-time setup

See **INITIAL-ADMIN-SETUP.md**. In short: set a `CMS_SETUP_TOKEN` environment
variable before starting PHP, then use the "First time here?" link on the admin
login page (or `POST /api/auth.php?action=setup`) once to create the first admin
account.

## Building for production

```bash
npm run build
```

This produces `dist/`, which already contains `dist/api/*.php` and `dist/uploads/`
(copied from `public/`) alongside the built React app. See
**HOSTINGER-DEPLOYMENT.md** for what to do with `dist/` on the server.

## Admin panel

All 22 required screens are implemented and functional: Dashboard, Site Settings,
Header, Footer, Pages (+ per-page editor), Packages (+ new/edit), Rooms (+ new/edit),
Activities (+ new/edit), Gallery, Testimonials, FAQs, Blog (+ new/edit), Enquiries,
Media Library, SEO, Backups, and Profile (password change) — plus Login and the
one-time Setup screen.

Every content-editing screen: loads from the live API, tracks unsaved changes (with a
browser-refresh warning), shows success/error toasts, and confirms before destructive
actions (delete). List screens support search, pagination, duplicate, and delete.

## Security summary

- Sessions: PHP native sessions, `HttpOnly`, `Secure` when HTTPS is detected,
  `SameSite=Lax`, regenerated on login.
- Passwords: `password_hash()` / `password_verify()`, never stored or shipped in
  plaintext anywhere in the frontend bundle.
- CSRF: a per-session token is required as an `X-CSRF-Token` header on every
  mutating request; issued at login and re-fetchable via the session endpoint.
- Login rate limiting: 6 attempts per IP+username, then a 15-minute lockout.
- File uploads: extension allowlist, MIME-sniffing via `finfo`, server-generated
  filenames (the original filename is never used as a path), SVGs are sanitized
  through an XML allowlist before being written to disk, executables and
  double-extension tricks (`shell.php.jpg`) are rejected.
- All JSON writes are atomic (temp file + rename), lock-guarded, back up the
  previous version first, and refuse to silently overwrite an already-corrupted file.
- `cms-data/`, `cms-backups/`, and PHP error logs are outside the web root; deny-all
  `.htaccess` files are also auto-generated inside them as defense-in-depth.
- No wildcard CORS; the admin API is same-origin by default.

## Known limitations (reported, not hidden)

- **SPA SEO ceiling:** this is a client-rendered React app with no server-side
  rendering or prerendering. `SEO.jsx` sets accurate `<title>`/meta/OG/JSON-LD tags
  per route via `react-helmet-async`, and they are correct in the page source once
  JavaScript runs — but a crawler or social-share unfurler that does not execute
  JavaScript will not see them. Search engines that do execute JS (Google, Bing) will
  index the content correctly; link-preview bots on some platforms may not. The
  honest fix is a prerendering or SSR migration, which is out of scope for a
  Hostinger-shared-hosting, PHP-only, no-Node-build deployment. Mitigations already in
  place: a real `robots`-friendly `index.html` fallback, per-page canonical URLs, and
  structured data.
- **Homepage hero:** uses a distinct animated multi-slide component rather than the
  generic single-hero pattern the Pages editor uses elsewhere, so its slides aren't
  field-editable from `/admin/pages` yet (the admin UI says so explicitly rather than
  offering a field that does nothing).
- **Decorative homepage sections** (`Experience` cards, `Nearby Attractions`) are
  build-time content bundled from `src/data/hotel.json`, not part of the CMS's
  content-type list — editing them today means editing that JSON file directly and
  rebuilding.
