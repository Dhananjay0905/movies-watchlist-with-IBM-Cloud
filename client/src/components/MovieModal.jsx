import React from 'react';
import './MovieModal.css';

const TMDB_IMG_W500 = 'https://image.tmdb.org/t/p/w500';

const MovieModal = ({ movie, onClose, onAdd, onWatched, isWatchlist }) => {
    if (!movie) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

                <div className="modal-poster-col">
                    <img
                        src={`${TMDB_IMG_W500}${movie.poster_path}`}
                        alt={movie.title}
                        className="modal-poster"
                    />
                </div>

                <div className="modal-info-col">
                    <h2 className="modal-title">{movie.title}</h2>

                    <div className="modal-meta-row">
                        {movie.release_date && <span className="meta-tag">{movie.release_date.slice(0, 4)}</span>}
                        {movie.vote_average && (
                            <span className="meta-tag">⭐ {movie.vote_average.toFixed(1)}</span>
                        )}
                    </div>

                    {movie.tagline && <p className="modal-tagline">"{movie.tagline}"</p>}

                    <p className="modal-overview">{movie.overview}</p>

                    {movie.genres?.length > 0 && (
                        <div className="modal-detail-row">
                            <span className="detail-label">Genres</span>
                            <span className="detail-value">{movie.genres.join(', ')}</span>
                        </div>
                    )}
                    {movie.director && (
                        <div className="modal-detail-row">
                            <span className="detail-label">Director</span>
                            <span className="detail-value">{movie.director}</span>
                        </div>
                    )}
                    {movie.actors?.length > 0 && (
                        <div className="modal-detail-row">
                            <span className="detail-label">Cast</span>
                            <span className="detail-value">{movie.actors.join(', ')} and more</span>
                        </div>
                    )}

                    <div className="modal-actions">
                        {isWatchlist ? (
                            <button
                                className="btn-modal btn-modal-watched"
                                onClick={() => onWatched(movie._id, movie._rev, movie.title)}
                            >
                                ✅ Mark as Watched
                            </button>
                        ) : (
                            <button
                                className="btn-modal btn-modal-add"
                                onClick={() => onAdd(movie)}
                            >
                                + Add to Watchlist
                            </button>
                        )}
                        <button className="btn-modal btn-modal-close" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieModal;
