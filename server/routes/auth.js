const express = require('express');
const passport = require('passport');
const { WebAppStrategy } = require('ibmcloud-appid');

const router = express.Router();

// Redirect user to IBM App ID login page
router.get('/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    forceLogin: true,
}));

// IBM App ID OAuth callback
router.get('/ibm/cloud/appid/callback', (req, res, next) => {
    passport.authenticate(WebAppStrategy.STRATEGY_NAME, (err, user) => {
        if (err) {
            console.error('[Auth Callback] Passport error:', err);
            return res.redirect('/auth/login');
        }
        if (!user) {
            console.warn('[Auth Callback] No user returned from App ID');
            return res.redirect('/auth/login');
        }

        req.logIn(user, (loginErr) => {
            if (loginErr) {
                console.error('[Auth Callback] req.logIn error:', loginErr);
                return res.redirect('/auth/login');
            }
            
            // Force an explicit session save before redirecting.
            // This prevents a common race condition where the redirect
            // happens before the session store has finished writing the user data.
            req.session.save((saveErr) => {
                if (saveErr) {
                    console.error('[Auth Callback] Session save error:', saveErr);
                    return res.redirect('/auth/login');
                }
                console.log('[Auth Callback] Login successful and session saved for:', user.email || user.id);
                return res.redirect('/');
            });
        });
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Get current authenticated user info
router.get('/user', (req, res) => {
    res.json({ isAuthenticated: req.isAuthenticated(), user: req.user || null });
});

// Debug endpoint — exposes full session & auth state in the browser response
// Remove this once auth is working correctly
router.get('/debug', (req, res) => {
    res.json({
        isAuthenticated: req.isAuthenticated(),
        user: req.user || null,
        sessionID: req.sessionID,
        session: req.session,
        cookies: req.headers.cookie || 'no cookies received',
        nodeEnv: process.env.NODE_ENV,
        trustProxy: req.app.get('trust proxy'),
        protocol: req.protocol,
        secure: req.secure,
        headers: {
            host: req.headers.host,
            origin: req.headers.origin,
            referer: req.headers.referer,
            'x-forwarded-proto': req.headers['x-forwarded-proto'],
            'x-forwarded-for': req.headers['x-forwarded-for'],
        },
    });
});

module.exports = router;
