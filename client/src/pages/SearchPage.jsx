import React, { useState } from 'react';
import Header from '../components/Header';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import './SearchPage.css';

const SearchPage = ({ user }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [isLoadingModal, setIsLoadingModal] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            setResults(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[Search]', err);
        } finally {
            setIsSearching(false);
        }
    };

    const fetchRichDetails = async (movieId) => {
        const res = await fetch(`/api/movies/${movieId}`);
        if (!res.ok) throw new Error('Failed to fetch details');
        return res.json();
    };

    const handleViewDetails = async (movie) => {
        setIsLoadingModal(true);
        try {
            const rich = await fetchRichDetails(movie.id);
            setSelectedMovie(rich);
        } catch {
            alert('Could not load movie details.');
        } finally {
            setIsLoadingModal(false);
        }
    };

    const handleQuickAdd = async (e, movie) => {
        e.stopPropagation();
        const btn = e.currentTarget;
        btn.textContent = 'Saving…';
        btn.disabled = true;
        try {
            const rich = await fetchRichDetails(movie.id);
            await addToWatchlist(rich);
        } catch {
            alert('Failed to add movie.');
        } finally {
            btn.textContent = '+ Add';
            btn.disabled = false;
        }
    };

    const addToWatchlist = async (movie) => {
        const res = await fetch('/api/watchlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movie),
        });
        if (res.ok) {
            alert(`✅ "${movie.title}" added to your watchlist!`);
            setSelectedMovie(null);
        } else {
            alert('Failed to save movie.');
        }
    };

    return (
        <div className="page-wrapper">
            <Header user={user} />

            <main className="page-main">
                <h2 className="page-heading">Search Movies</h2>

                <form className="search-form" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for a movie title…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        autoFocus
                    />
                    <button type="submit" className="search-btn" disabled={isSearching}>
                        {isSearching ? 'Searching…' : '🔍 Search'}
                    </button>
                </form>

                {isSearching && (
                    <div className="loading-grid">
                        {[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}
                    </div>
                )}

                {!isSearching && hasSearched && results.length === 0 && (
                    <div className="no-results">
                        <span>😶</span>
                        <p>No movies found for "<strong>{query}</strong>"</p>
                    </div>
                )}

                {!isSearching && results.length > 0 && (
                    <>
                        <p className="results-count">{results.length} results for "<strong>{query}</strong>"</p>
                        <div className="movies-grid">
                            {results.map(movie => (
                                <MovieCard
                                    key={movie.id}
                                    movie={movie}
                                    isWatchlist={false}
                                    onDetails={handleViewDetails}
                                    onAdd={handleQuickAdd}
                                />
                            ))}
                        </div>
                    </>
                )}

                {isLoadingModal && (
                    <div className="modal-loading-overlay">
                        <div className="modal-spinner" />
                    </div>
                )}
            </main>

            <MovieModal
                movie={selectedMovie}
                isWatchlist={false}
                onClose={() => setSelectedMovie(null)}
                onAdd={addToWatchlist}
            />
        </div>
    );
};

export default SearchPage;
