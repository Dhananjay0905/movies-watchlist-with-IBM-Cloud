const express = require('express');
const { cloudant, DB_NAME } = require('../config/cloudant');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

// All watchlist routes require login
router.use(requireAuth);

// GET /api/watchlist — fetch current user's saved movies
router.get('/', async (req, res) => {
    try {
        const response = await cloudant.postFind({
            db: DB_NAME,
            selector: { userId: req.user.sub },
        });
        res.json(response.result.docs);
    } catch (error) {
        console.error('[Watchlist Fetch Error]', error.message);
        res.status(500).json({ error: 'Failed to fetch watchlist.' });
    }
});

// POST /api/watchlist — add a movie to the watchlist
router.post('/', async (req, res) => {
    const movie = req.body;

    if (!movie || !movie.id) {
        return res.status(400).json({ error: 'Movie data is required.' });
    }

    const movieDoc = {
        userId: req.user.sub,
        movieId: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        release_date: movie.release_date,
        overview: movie.overview,
        tagline: movie.tagline,
        genres: movie.genres,
        director: movie.director,
        actors: movie.actors,
        vote_average: movie.vote_average,
        addedAt: new Date().toISOString(),
    };

    try {
        const response = await cloudant.postDocument({ db: DB_NAME, document: movieDoc });
        console.log(`[Watchlist] Saved: "${movie.title}"`);
        res.status(201).json({ success: true, id: response.result.id });
    } catch (error) {
        console.error('[Watchlist Add Error]', error.message);
        res.status(500).json({ error: 'Failed to save movie to watchlist.' });
    }
});

// DELETE /api/watchlist/:docId/:revId — remove a movie (mark as watched)
router.delete('/:docId/:revId', async (req, res) => {
    const { docId, revId } = req.params;
    try {
        await cloudant.deleteDocument({ db: DB_NAME, docId, rev: revId });
        res.json({ success: true });
    } catch (error) {
        console.error('[Watchlist Delete Error]', error.message);
        res.status(500).json({ error: 'Failed to remove movie from watchlist.' });
    }
});

module.exports = router;
