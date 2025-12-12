import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavBar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderBottom: '1px solid #e5e7eb' }}>
      <Link to="/dashboard" style={{ fontWeight: 700, textDecoration: 'none', color: '#111827' }}>
        Escrow Platform
      </Link>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {currentUser?.is_broker === false && (
          <Link to="/become-broker" style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#111827', color: '#fff', textDecoration: 'none' }}>
            Become a broker
          </Link>
        )}
        {currentUser ? (
          <button type="button" onClick={handleLogout} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer' }}>
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: '#111827' }}>
              Login
            </Link>
            <Link to="/register" style={{ textDecoration: 'none', color: '#111827' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
