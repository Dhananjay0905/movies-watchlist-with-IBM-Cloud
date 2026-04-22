const express = require('express');
const axios = require('axios');

const router = express.Router();

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

/**
 * Helper to create standard TMDB axios config with auth header.
 */
function tmdbConfig(params = {}) {
    return {
        headers: {
            Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
            Accept: 'application/json',
        },
        params,
    };
}

// GET /api/movies/search?q=<query>
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const response = await axios.get(
            `${TMDB_BASE_URL}/search/movie`,
            tmdbConfig({ query, include_adult: false, language: 'en-US', page: 1 })
        );
        // Filter out results with no poster image
        const validMovies = response.data.results.filter(m => m.poster_path !== null);
        res.json(validMovies);
    } catch (error) {
        console.error('[TMDB Search Error]', error.message);
        res.status(500).json({ error: 'Failed to fetch movies from TMDB.' });
    }
});

// GET /api/movies/:id  — returns rich details (genres, director, cast)
router.get('/:id', async (req, res) => {
    const movieId = req.params.id;

    try {
        const [detailsRes, creditsRes] = await Promise.all([
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, tmdbConfig({ language: 'en-US' })),
            axios.get(`${TMDB_BASE_URL}/movie/${movieId}/credits`, tmdbConfig({ language: 'en-US' })),
        ]);

        const details = detailsRes.data;
        const credits = creditsRes.data;

        const director = credits.crew.find(p => p.job === 'Director');
        const topCast = credits.cast.slice(0, 5).map(a => a.name);

        res.json({
            id: details.id,
            title: details.title,
            poster_path: details.poster_path,
            backdrop_path: details.backdrop_path,
            release_date: details.release_date,
            tagline: details.tagline ? details.tagline.toUpperCase() : '',
            overview: details.overview,
            genres: details.genres.map(g => g.name),
            director: director ? director.name : 'Unknown',
            actors: topCast,
            vote_average: details.vote_average,
        });
    } catch (error) {
        console.error('[TMDB Details Error]', error.message);
        res.status(500).json({ error: 'Failed to fetch movie details from TMDB.' });
    }
});

module.exports = router;
