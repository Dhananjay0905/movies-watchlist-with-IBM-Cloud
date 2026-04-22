import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import Watchlist from './Watchlist';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in by calling our backend API
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
        if (data.isAuthenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Auth check failed", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '20%' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Logic: If user exists, show Watchlist. If not, show Login. */}
      {user ? <Watchlist user={user} /> : <LoginPage />}
    </div>
  );
}

export default App;