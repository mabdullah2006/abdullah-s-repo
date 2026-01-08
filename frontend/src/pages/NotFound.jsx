import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div style={{ padding: '40px' }}>
      <h2>Page not found</h2>
      <Link to="/">Go home</Link>
    </div>
  );
}

export default NotFound;
