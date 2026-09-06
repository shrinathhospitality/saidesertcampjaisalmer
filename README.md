# Sai Desert Camp & Resort — Website

A React 19 + Vite public website with a WordPress-style admin CMS: a React admin
panel (`/admin`), a small PHP API (`/api`), and JSON files as the content store — no
MySQL, no Node.js backend, deployable on Hostinger shared hosting.

## Documentation

- **README-CMS.md** — architecture, local development, admin panel overview, security summary, known limitations
- **HOSTINGER-DEPLOYMENT.md** — step-by-step production deployment
- **JSON-SCHEMA.md** — the schema of every content file in `cms-data/`
- **INITIAL-ADMIN-SETUP.md** — how to create the first admin account

## Quick start (local development)

```bash
npm install

# Terminal 1
php -S localhost:8090 -t public

# Terminal 2
npm run dev
```

Public site: `http://localhost:3000` · Admin panel: `http://localhost:3000/admin/login`

```bash
npm run build   # production build -> dist/ (includes the PHP API and uploads folder)
```
