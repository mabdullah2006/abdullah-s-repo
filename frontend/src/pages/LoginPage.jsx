import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await login(email, password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h2 className="auth-title">Attendance Manager</h2>
        <p className="muted">Sign in to manage daily attendance and payroll data.</p>
        {error && <p className="message">{error}</p>}
        <form onSubmit={handleSubmit} className="form-grid">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="button primary" type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
