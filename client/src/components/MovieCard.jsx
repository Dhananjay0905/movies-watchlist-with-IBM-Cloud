import React from 'react';
import './MovieCard.css';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w300';

const MovieCard = ({ movie, onDetails, onAdd, onWatched, isWatchlist }) => {
    return (
        <div className="movie-card" onClick={() => onDetails(movie)}>
            <div className="card-poster-wrap">
                <img
                    src={`${TMDB_IMG}${movie.poster_path}`}
                    alt={movie.title}
                    className="card-poster"
                    loading="lazy"
                />
                <div className="card-overlay">
                    <span className="card-rating">⭐ {movie.vote_average?.toFixed(1) ?? 'N/A'}</span>
                </div>
            </div>
            <div className="card-body">
                <h3 className="card-title">{movie.title}</h3>
                <p className="card-year">{movie.release_date?.slice(0, 4) ?? ''}</p>
                <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    {isWatchlist ? (
                        <button
                            className="btn btn-watched"
                            onClick={() => onWatched(movie._id, movie._rev, movie.title)}
                        >
                            ✅ Watched
                        </button>
                    ) : (
                        <button
                            className="btn btn-add"
                            onClick={(e) => onAdd(e, movie)}
                        >
                            + Add
                        </button>
                    )}
                    <button className="btn btn-details" onClick={() => onDetails(movie)}>
                        ℹ Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
