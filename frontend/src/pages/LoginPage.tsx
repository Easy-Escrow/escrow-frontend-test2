import React, { useState } from 'react';
import { useNavigate, useLocation, Link, Location } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticating } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await login({ email, password });
    const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';
    navigate(from, { replace: true });
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: 360 }}>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ width: '100%', padding: '8px' }} />
        </label>
        <button type="submit" disabled={isAuthenticating} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #111827', background: '#111827', color: '#fff', cursor: 'pointer' }}>
          {isAuthenticating ? 'Signing in...' : 'Login'}
        </button>
        <p>
          No account? <Link to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
