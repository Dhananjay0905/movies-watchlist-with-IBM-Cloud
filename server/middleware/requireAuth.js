/**
 * Middleware to protect routes that require authentication.
 * Returns 401 if the user is not logged in.
 */
function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Unauthorized. Please log in.' });
    }
    next();
}

module.exports = { requireAuth };
