# Ringleader admin uploader — spec

Goal: let a small allowlist of `@answeringlegal.com` users publish a new issue through the site, no git required. New issue must show up in the archive automatically.

## Access

- New route `/admin` (SPA page), auth-gated + allowlist-gated.
- Allowlist lives in `.env` as `PUBLISHER_EMAILS=alyssa@answeringlegal.com,someone@answeringlegal.com`.
- Server-side middleware: `requireAuth` + email in `PUBLISHER_EMAILS`. Non-publishers get 403.
- Client: hide the `/admin` nav entry for non-publishers; also gate the route.

## Publish flow

Form fields:
- `title` (required)
- `date` (required, `YYYY-MM-DD`)
- `author` (optional)
- `excerpt` (required, one-line teaser for the archive card)
- `file` (required, `.html`)

On submit (`POST /api/admin/issues`, multipart):
1. Slug = `slugify(title)` (lowercase, hyphens, strip non-alphanumerics).
2. Filename = `${date}-${slug}.html`. Reject if it already exists (or offer overwrite — pick one; simpler = reject).
3. Read the uploaded HTML. Strip any existing `<!-- ringleader ... -->` comment (avoid double metadata).
4. Prepend a fresh `<!-- ringleader {"slug":"…","title":"…","date":"…","author":"…","excerpt":"…"} -->` block.
5. Write to `content/issues/${filename}`.
6. `chokidar` picks it up — no restart needed. The existing loader in `server.js` already handles `.html` with this comment format.

Return `{ ok: true, slug }`. Client navigates to `/issues/${slug}`.

## Admin page UI

One page, `/admin`. Two zones:

**Top: "New issue" button** → opens the issue modal in create mode.

**Below: table of existing issues** (from `GET /api/issues`, most recent first). Each row:
- Columns: date · title · author · excerpt (truncated).
- Three actions per row:
  - **View** → opens `/issues/:slug` in a new tab. Cheapest way to preview after publish or before delete.
  - **Edit** → opens the issue modal in edit mode, pre-filled. Same modal as create — that's the point.
  - **Delete** → confirm dialog, then `DELETE /api/admin/issues/:slug`.

**The issue modal** (single component, two modes):
- Fields: title, date, author, excerpt.
- File input labeled based on mode:
  - Create mode: **required**, "HTML file".
  - Edit mode: **optional**, "Replace HTML file (leave empty to keep existing)".
- Submit button says "Publish" (create) or "Save changes" (edit).
- On submit → `POST /api/admin/issues` or `PATCH /api/admin/issues/:slug`.

That's it — three row actions + one modal = full lifecycle. No drafts, no version history, no search (12–24 issues/yr; a plain table fits on one screen).

## Backend endpoints to add

- `POST /api/admin/issues` — multipart, publisher-gated. Body: metadata fields + `file` (required). Creates a new issue.
- `PATCH /api/admin/issues/:slug` — multipart, publisher-gated. Body: metadata fields + `file` (optional). Updates metadata always; if a file is provided, also replaces the HTML body (preserving the slug/filename so the URL stays stable). If title or date change, keep the original filename — do NOT rename, or you'll break archive links.
- `DELETE /api/admin/issues/:slug` — deletes the file. Publisher-gated.

Use `multer` for uploads. Cap file size at 10 MB (July issue is ~2 MB of inlined base64).

## Two decisions the implementer must make deliberately

**1. HTML sanitization.** Uploaded HTML is served verbatim to logged-in users and can execute JS. Given the small trusted allowlist, accepting the risk is reasonable. If sanitizing, DOMPurify server-side is the usual pick — but sanitizing may strip design elements from Canva exports. Recommendation: don't sanitize, document the trust boundary in a code comment.

**2. Persistence.** Files written on the VPS aren't in git. Either:
  - (a) back up `content/issues/` on the VPS separately (simpler), or
  - (b) have the publish endpoint also `git add && git commit && git push` (nicer, but adds git credentials + a failure surface).

Recommendation: start with (a). Add a note in the README about backing up `/opt/ringleader/content/issues/`.

## Existing code the implementer should not re-invent

- Issue loader + metadata comment parsing: `server.js` `loadIssues()`, already handles `<!-- ringleader {...} -->`.
- Auth middleware: `auth.js` `requireAuth`. Wrap it with an email-check middleware for publisher gating.
- Frontend auth context: `client/src/context/AuthContext.jsx`. Add `user.isPublisher` (server sets it in `/api/me` based on the allowlist).

## Out of scope for v1

- Drafts / preview before publish (author previews locally by opening their file in a browser; the "View" button covers post-publish preview).
- Version history / restore. If someone deletes the wrong issue, they re-upload from their local copy.
- Scheduled publishing / future-dated auto-publish.
- Multi-user collaboration on one issue.
- Search or filtering in the admin table (unnecessary at ~12–24 items/yr).
- Markdown upload (HTML only — keep design fidelity, don't force people into a downgrade).
