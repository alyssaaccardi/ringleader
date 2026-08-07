# Ringleader

Internal newsletter for Answering Legal. Google OAuth gated to `@answeringlegal.com`. Issues are Markdown files in `content/issues/`.

## Local dev

```bash
npm install
cd client && npm install && cd ..
cp .env.example .env      # fill in Google OAuth credentials
npm run build             # build the React client to client/dist
npm run dev               # server on :3002, watches for restart on file changes
```

For hot-reload frontend during development, in a second terminal:

```bash
cd client && npm run dev  # Vite on :5174, proxies /api and /auth to :3002
```

Then open http://localhost:5174.

## Publishing an issue

Create `content/issues/YYYY-MM-DD-slug.md`:

```markdown
---
slug: my-issue
title: My Issue Title
date: 2026-08-14
author: Alyssa Accardi
excerpt: One-line teaser for the archive listing.
---

## Body

Markdown here.
```

The server watches `content/issues/` and reloads automatically. In production, `pm2 restart ringleader` after `git pull`.

## Production deploy

One-time on the VPS (`165.22.11.251`):

```bash
# App
mkdir -p /opt/ringleader && cd /opt/ringleader
git clone <repo-url> .
npm install
cd client && npm install && npm run build && cd ..
cp .env.example .env       # fill in real values (production callback URL, etc.)
pm2 start server.js --name ringleader
pm2 save

# Nginx
cp nginx.conf.example /etc/nginx/sites-available/ringleader
ln -s /etc/nginx/sites-available/ringleader /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# TLS
certbot --nginx -d ringleader.answeringlegal.com
```

Deploys after that:

```bash
ssh root@165.22.11.251 "cd /opt/ringleader && git pull && cd client && npm run build && cd .. && pm2 restart ringleader"
```

## Files

```
ringleader/
├── server.js                 Express + Passport + issue loader
├── auth.js                   Google OAuth strategy w/ domain gate
├── content/issues/*.md       The newsletter itself
├── nginx.conf.example        Proxy config template
└── client/                   React SPA (Vite)
    └── src/
        ├── App.jsx
        ├── api.js
        ├── context/AuthContext.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── CurrentIssuePage.jsx
            ├── ArchivePage.jsx
            └── IssuePage.jsx
```

## Environment variables

See `.env.example`. Required: `SESSION_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`, `ALLOWED_EMAIL_DOMAIN`.
