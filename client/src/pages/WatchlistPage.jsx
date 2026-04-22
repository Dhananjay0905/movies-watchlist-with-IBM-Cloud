import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import EmptyState from '../components/EmptyState';
import './WatchlistPage.css';

const WatchlistPage = ({ user }) => {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchWatchlist();
    }, []);

    const fetchWatchlist = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/watchlist');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setMovies(data);
        } catch (err) {
            console.error('[Watchlist]', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWatched = async (docId, revId, title) => {
        if (!window.confirm(`Mark "${title}" as watched and remove it?`)) return;
        try {
            const res = await fetch(`/api/watchlist/${docId}/${revId}`, { method: 'DELETE' });
            if (res.ok) {
                setMovies(prev => prev.filter(m => m._id !== docId));
                setSelectedMovie(null);
            }
        } catch (err) {
            console.error('[Delete]', err);
        }
    };

    return (
        <div className="page-wrapper">
            <Header user={user} />

            <main className="page-main">
                <div className="page-title-row">
                    <h2 className="page-heading">My Watchlist</h2>
                    <span className="movie-count">{movies.length} movie{movies.length !== 1 ? 's' : ''}</span>
                </div>

                {isLoading ? (
                    <div className="loading-grid">
                        {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
                    </div>
                ) : movies.length === 0 ? (
                    <EmptyState onAction={() => navigate('/search')} />
                ) : (
                    <div className="movies-grid">
                        {movies.map(movie => (
                            <MovieCard
                                key={movie._id}
                                movie={movie}
                                isWatchlist
                                onDetails={setSelectedMovie}
                                onWatched={handleWatched}
                            />
                        ))}
                    </div>
                )}
            </main>

            <MovieModal
                movie={selectedMovie}
                isWatchlist
                onClose={() => setSelectedMovie(null)}
                onWatched={handleWatched}
            />
        </div>
    );
};

export default WatchlistPage;
