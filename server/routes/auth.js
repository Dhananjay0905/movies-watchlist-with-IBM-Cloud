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
        if (err || !user) return res.redirect('/auth/login');
        req.logIn(user, () => res.redirect('/'));
    })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'));
});

// Get current authenticated user info
router.get('/user', (req, res) => {
    res.json({ isAuthenticated: !!req.user, user: req.user || null });
});

module.exports = router;
