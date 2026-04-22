require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const { configurePassport } = require('./config/passport');
const authRouter = require('./routes/auth');
const moviesRouter = require('./routes/movies');
const watchlistRouter = require('./routes/watchlist');

const app = express();
const PORT = process.env.PORT || 3000;

// --- PROXY SETTING (CRITICAL for Code Engine / HTTPS) ---
// Tell Express to trust the reverse proxy headers (X-Forwarded-Proto)
// This is required for session cookies to be saved over HTTPS
app.set('trust proxy', 1);

// --- SECURITY MIDDLEWARE ---
app.use(helmet({ contentSecurityPolicy: false })); // CSP off so frontend scripts load
app.use(cors());

// Rate-limit all API calls (max 100 requests per 15 min per IP)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', apiLimiter);

// --- BODY PARSING ---
app.use(express.json());

// --- SESSION & AUTH SETUP ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // true in prod for HTTPS
        // 'none' is required for cross-site OAuth redirects (IBM App ID)
        // Browsers block 'lax' cookies on cross-origin POST/redirects
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
}));
app.use(passport.initialize());
app.use(passport.session());
configurePassport();

// --- API ROUTES ---
app.use('/auth', authRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/watchlist', watchlistRouter);

// --- SERVE FRONTEND (Production) ---
app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all: send React app for any non-API route (supports React Router)
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// --- GLOBAL ERROR HANDLER ---
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('[Unhandled Error]', err.stack);
    res.status(500).json({ error: 'An unexpected error occurred.' });
});

// --- START SERVER ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});