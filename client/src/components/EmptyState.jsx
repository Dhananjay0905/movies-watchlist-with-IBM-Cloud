import React from 'react';
import './EmptyState.css';

const EmptyState = ({ onAction }) => (
    <div className="empty-state">
        <div className="empty-icon">🦗</div>
        <h2>It's quiet... too quiet.</h2>
        <p>You haven't saved any movies yet.</p>
        <p className="empty-sub">Are you actually going outside? Disgusting.</p>
        <button className="empty-cta" onClick={onAction}>
            Fix this tragedy → Search Movies
        </button>
    </div>
);

export default EmptyState;
