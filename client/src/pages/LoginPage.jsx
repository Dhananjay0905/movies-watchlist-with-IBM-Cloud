import React from 'react';
import './LoginPage.css';

const LoginPage = () => {
    return (
        <div className="login-bg">
            <div className="login-card">
                <div className="login-icon">🎬</div>
                <h1 className="login-title">MovieWatchlist</h1>
                <p className="login-subtitle">
                    Search millions of movies and build your personal watchlist.
                </p>

                <ul className="login-features">
                    <li>🔍 Search any movie from TMDB</li>
                    <li>💾 Save movies to your personal list</li>
                    <li>✅ Track what you've watched</li>
                    <li>🔒 Secure login via IBM App ID</li>
                </ul>

                <a href="/auth/login" className="login-btn">
                    Login / Sign Up
                </a>

                <p className="login-note">
                    Authentication handled securely by IBM Cloud App ID
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
