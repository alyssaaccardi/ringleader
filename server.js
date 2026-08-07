require('dotenv').config();
const path       = require('path');
const fs         = require('fs');
const express    = require('express');
const session    = require('express-session');
const matter     = require('gray-matter');
const { marked } = require('marked');
const chokidar   = require('chokidar');

const { passport, requireAuth } = require('./auth');

const PORT       = process.env.PORT || 3002;
const IS_PROD    = process.env.NODE_ENV === 'production';
const ISSUES_DIR = path.join(__dirname, 'content', 'issues');
const CLIENT_DIR = path.join(__dirname, 'client', 'dist');

const app = express();
app.set('trust proxy', 1);

app.use(session({
  name: 'ringleader.sid',
  secret: process.env.SESSION_SECRET || 'dev-only-not-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: IS_PROD,
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
  },
}));
app.use(passport.initialize());
app.use(passport.session());

/* ─── Issue loader ────────────────────────────────────────────────────────── */
let ISSUES = [];

function loadIssues() {
  if (!fs.existsSync(ISSUES_DIR)) { ISSUES = []; return; }
  const files = fs.readdirSync(ISSUES_DIR).filter(f => f.endsWith('.md'));
  ISSUES = files.map(file => {
    const raw = fs.readFileSync(path.join(ISSUES_DIR, file), 'utf8');
    const { data, content } = matter(raw);
    return {
      slug:    data.slug || file.replace(/\.md$/, ''),
      title:   data.title   || 'Untitled',
      date:    data.date    ? new Date(data.date).toISOString() : new Date(0).toISOString(),
      author:  data.author  || null,
      excerpt: data.excerpt || '',
      html:    marked.parse(content),
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
  console.log(`[ringleader] loaded ${ISSUES.length} issue(s)`);
}

loadIssues();
chokidar.watch(ISSUES_DIR, { ignoreInitial: true }).on('all', loadIssues);

/* ─── Auth routes ─────────────────────────────────────────────────────────── */
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  hd: process.env.ALLOWED_EMAIL_DOMAIN,
}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=wrong_domain' }),
  (req, res) => res.redirect('/')
);

app.post('/auth/logout', (req, res) => {
  req.logout(() => req.session.destroy(() => res.json({ ok: true })));
});

app.get('/api/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'unauthorized' });
  res.json(req.user);
});

/* ─── Issue API ───────────────────────────────────────────────────────────── */
app.get('/api/issues', requireAuth, (req, res) => {
  res.json(ISSUES.map(({ html, ...meta }) => meta));
});

app.get('/api/issues/current', requireAuth, (req, res) => {
  if (!ISSUES.length) return res.status(404).json({ error: 'no_issues' });
  res.json(ISSUES[0]);
});

app.get('/api/issues/:slug', requireAuth, (req, res) => {
  const issue = ISSUES.find(i => i.slug === req.params.slug);
  if (!issue) return res.status(404).json({ error: 'not_found' });
  res.json(issue);
});

/* ─── Static client + SPA fallback ────────────────────────────────────────── */
app.use(express.static(CLIENT_DIR));
app.get('*', (req, res) => {
  const indexFile = path.join(CLIENT_DIR, 'index.html');
  if (fs.existsSync(indexFile)) return res.sendFile(indexFile);
  res.status(200).send('Ringleader — run `npm run build` to compile the client.');
});

app.listen(PORT, () => console.log(`[ringleader] listening on :${PORT}`));
