import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import EscrowCreatePage from './pages/EscrowCreatePage';
import EscrowInvitePage from './pages/EscrowInvitePage';
import BecomeBrokerPage from './pages/BecomeBrokerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

const App: React.FC = () => {
  return (
    <div>
      <NavBar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/escrows/new"
          element={
            <ProtectedRoute requireBroker>
              <EscrowCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/escrows/:id/invite"
          element={
            <ProtectedRoute requireBroker>
              <EscrowInvitePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/become-broker"
          element={
            <ProtectedRoute>
              <BecomeBrokerPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;
