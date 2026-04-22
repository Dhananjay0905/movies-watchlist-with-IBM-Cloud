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
            console.log('[Auth Callback] Login successful for:', user.email || user.id);
            return res.redirect('/');
        });
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Get current authenticated user info
router.get('/user', (req, res) => {
    console.log('[Auth/user] Session ID:', req.sessionID, '| isAuthenticated:', req.isAuthenticated());
    res.json({ isAuthenticated: req.isAuthenticated(), user: req.user || null });
});

module.exports = router;
