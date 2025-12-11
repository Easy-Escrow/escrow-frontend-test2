import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div style={{ padding: '24px' }}>
      <h1>Dashboard</h1>
      <p>Welcome back, {currentUser?.email ?? 'user'}.</p>
      {currentUser?.is_broker ? (
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Link to="/escrows/new">Create escrow</Link>
          <Link to="/escrows/123/invite">Invite participants to escrow #123</Link>
        </div>
      ) : (
        <p style={{ marginTop: '16px' }}>Become a broker to create and manage escrows.</p>
      )}
    </div>
  );
};

export default DashboardPage;
