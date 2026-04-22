import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import WatchlistPage from './pages/WatchlistPage';
import SearchPage from './pages/SearchPage';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/auth/user')
            .then(res => res.json())
            .then(data => {
                setUser(data.isAuthenticated ? data.user : null);
            })
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0a0a',
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid #2a2a2a',
                    borderTopColor: '#e50914',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public route */}
                <Route
                    path="/login"
                    element={user ? <Navigate to="/" replace /> : <LoginPage />}
                />

                {/* Protected routes — redirect to /login if not authenticated */}
                <Route
                    path="/"
                    element={user ? <WatchlistPage user={user} /> : <Navigate to="/login" replace />}
                />
                <Route
                    path="/search"
                    element={user ? <SearchPage user={user} /> : <Navigate to="/login" replace />}
                />

                {/* Fallback: unknown paths → home */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;