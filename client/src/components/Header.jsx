import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ user }) => {
    const { pathname } = useLocation();

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-brand">
                    <span className="header-icon">🎬</span>
                    <h1>MovieWatchlist</h1>
                </div>
                <nav className="header-nav">
                    <Link
                        to="/"
                        className={`nav-link ${pathname === '/' ? 'nav-link--active' : ''}`}
                    >
                        My Watchlist
                    </Link>
                    <Link
                        to="/search"
                        className={`nav-link ${pathname === '/search' ? 'nav-link--active' : ''}`}
                    >
                        Search Movies
                    </Link>
                </nav>
            </div>
            <div className="header-user">
                <span className="user-name">{user?.name}</span>
                <a href="/auth/logout" className="logout-btn">Logout</a>
            </div>
        </header>
    );
};

export default Header;
