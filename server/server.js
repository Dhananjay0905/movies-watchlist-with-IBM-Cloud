require('dotenv').config();
const path = require('path');
const { CloudantV1 } = require('@ibm-cloud/cloudant');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { WebAppStrategy } = require('ibmcloud-appid');
const axios = require('axios');
const https = require('https'); // Needed for the hack

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // Essential for reading req.body

const cloudant = CloudantV1.newInstance({
    authenticator: new IamAuthenticator({
        apikey: process.env.CLOUDANT_APIKEY,
    }),
    serviceUrl: process.env.CLOUDANT_URL,
});
const DB_NAME = 'watchlist';

// --- AUTH SETUP ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((obj, cb) => cb(null, obj));

passport.use(new WebAppStrategy({
    tenantId: process.env.APPID_TENANT_ID,
    clientId: process.env.APPID_CLIENT_ID,
    secret: process.env.APPID_SECRET,
    oauthServerUrl: process.env.APPID_OAUTH_SERVER_URL,
    redirectUri: process.env.REDIRECT_URI
}));

// --- THE HACK: BYPASS ISP DNS ---
async function getSafeTMDBConfig(endpoint, params) {
    try {
        const dnsRes = await axios.get('https://dns.google/resolve?name=api.themoviedb.org');
        const realIP = dnsRes.data.Answer.find(record => record.type === 1).data;
        console.log(`[DNS Hack] Resolved TMDB to: ${realIP}`);

        return {
            url: `https://${realIP}/3${endpoint}`,
            headers: {
                'Host': 'api.themoviedb.org',
                'Authorization': `Bearer ${process.env.TMDB_API_KEY}`,
                'Accept': 'application/json'
            },
            params: params,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        };
    } catch (err) {
        console.error("DNS Hack Failed:", err.message);
        throw err;
    }
}

// --- API ROUTES ---

// Get Rich Movie Details
app.get('/api/movie/:id', async (req, res) => {
  const movieId = req.params.id;

  try {
    const detailsConfig = await getSafeTMDBConfig(`/movie/${movieId}`, { language: 'en-US' });
    const creditsConfig = await getSafeTMDBConfig(`/movie/${movieId}/credits`, { language: 'en-US' });

    const [detailsRes, creditsRes] = await Promise.all([
      axios.get(detailsConfig.url, detailsConfig),
      axios.get(creditsConfig.url, creditsConfig)
    ]);

    const details = detailsRes.data;
    const credits = creditsRes.data;

    const directorObj = credits.crew.find(person => person.job === 'Director');
    const directorName = directorObj ? directorObj.name : 'Unknown';
    const topCast = credits.cast.slice(0, 5).map(actor => actor.name);
    const genres = details.genres.map(g => g.name);

    const richMovieData = {
      id: details.id,
      title: details.title,
      poster_path: details.poster_path,
      backdrop_path: details.backdrop_path,
      release_date: details.release_date,
      tagline: details.tagline ? details.tagline.toUpperCase() : '',
      overview: details.overview,
      genres: genres,
      director: directorName,
      actors: topCast,
      vote_average: details.vote_average
    };

    res.json(richMovieData);

  } catch (error) {
    console.error('Details Fetch Error:', error.message);
    res.status(500).json({ error: 'Failed to get movie details' });
  }
});

// Search Route
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query required' });

    try {
        console.log(`Searching for: ${query}`);
        const config = await getSafeTMDBConfig('/search/movie', {
            query: query,
            include_adult: false,
            language: 'en-US',
            page: 1
        });
        const response = await axios.get(config.url, config);
        console.log(`Found ${response.data.results.length} movies.`);
        res.json(response.data.results);
    } catch (error) {
        console.error('Search Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch movies' });
    }
});

// Auth Routes (UPDATED for Production)
app.get('/auth/login', passport.authenticate(WebAppStrategy.STRATEGY_NAME, {
    successRedirect: '/', // Redirects to the served frontend
    forceLogin: true
}));

app.get('/ibm/cloud/appid/callback', (req, res, next) => {
    passport.authenticate(WebAppStrategy.STRATEGY_NAME, (err, user) => {
        if (err || !user) return res.redirect('/auth/login');
        req.logIn(user, (err) => {
            res.redirect('/'); // Redirects to the served frontend
        });
    })(req, res, next);
});

app.get('/auth/logout', (req, res) => {
    req.logout(() => res.redirect('/')); // Redirects to the served frontend
});

app.get('/api/user', (req, res) => {
    res.json({ isAuthenticated: !!req.user, user: req.user });
});

// Database Routes
app.get('/api/watchlist', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    try {
        const response = await cloudant.postFind({
            db: DB_NAME,
            selector: { userId: req.user.sub }
        });
        res.json(response.result.docs);
    } catch (error) {
        console.error('Fetch List Error:', error);
        res.status(500).json({ error: 'Failed to fetch watchlist' });
    }
});

app.delete('/api/watchlist/:docId/:revId', async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: 'Unauthorized' });
    const { docId, revId } = req.params;
    try {
        await cloudant.deleteDocument({
            db: DB_NAME,
            docId: docId,
            rev: revId
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ error: 'Failed to delete' });
    }
});

app.post('/api/watchlist', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'User not logged in' });
  }

  const movie = req.body; 
  const movieDoc = {
    userId: req.user.sub,
    movieId: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    release_date: movie.release_date,
    overview: movie.overview,
    tagline: movie.tagline,
    genres: movie.genres,
    director: movie.director,
    actors: movie.actors,
    vote_average: movie.vote_average,
    addedAt: new Date().toISOString()
  };

  try {
    const response = await cloudant.postDocument({
      db: DB_NAME,
      document: movieDoc
    });
    console.log('Saved movie with details:', movie.title);
    res.json({ success: true, id: response.result.id });
  } catch (error) {
    console.error('Cloudant Write Error:', error);
    res.status(500).json({ error: 'Failed to save movie' });
  }
});

// --- SERVE FRONTEND (Production) ---
// 1. Serve static files from the build folder
app.use(express.static(path.join(__dirname, '../client/dist')));

// 2. Catch-All Route: If no API route matches, send the React app
// This allows React Router (if you use it) or client-side navigation to work
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});