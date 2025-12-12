import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requireBroker?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireBroker = false }) => {
  const { token, currentUser } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireBroker && !currentUser?.is_broker) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
