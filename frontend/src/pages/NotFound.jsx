import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="app-shell">
      <div className="page">
        <div className="card">
          <h2>Page not found</h2>
          <p className="muted">The page you are looking for does not exist.</p>
          <Link className="button primary" to="/">Go home</Link>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
