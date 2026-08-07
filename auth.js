const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || '').toLowerCase();

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value?.toLowerCase() || '';
    if (!ALLOWED_DOMAIN || !email.endsWith('@' + ALLOWED_DOMAIN)) {
      return done(null, false, { message: 'wrong_domain' });
    }
    done(null, {
      email,
      name:    profile.displayName || email,
      picture: profile.photos?.[0]?.value || null,
    });
  }
));

function requireAuth(req, res, next) {
  if (req.isAuthenticated?.()) return next();
  res.status(401).json({ error: 'unauthorized' });
}

module.exports = { passport, requireAuth };
