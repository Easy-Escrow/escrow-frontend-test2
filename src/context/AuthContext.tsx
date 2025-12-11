import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { loginRequest, logoutRequest } from '../api/auth';
import { AuthResponse, LoginPayload, User } from '../types/auth';

interface AuthContextValue {
  token: string | null;
  currentUser: User | null;
  isAuthenticating: boolean;
  login: (payload: LoginPayload) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (user: User | null) => void;
  applyAuthResponse: (response: AuthResponse) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'escrow_token';
const USER_KEY = 'escrow_user';

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [currentUser]);

  const login = async (payload: LoginPayload) => {
    const response = await loginMutation.mutateAsync(payload);
    applyAuthResponse(response);
    return response;
  };

  const logout = () => {
    logoutRequest().catch(() => undefined);
    setToken(null);
    setCurrentUser(null);
  };

  const updateUser = (user: User | null) => {
    setCurrentUser(user);
  };

  const applyAuthResponse = (response: AuthResponse) => {
    setToken(response.token);
    setCurrentUser(response.user);
  };

  const value = useMemo(
    () => ({
      token,
      currentUser,
      login,
      logout,
      updateUser,
      applyAuthResponse,
      isAuthenticating: loginMutation.isPending,
    }),
    [token, currentUser, updateUser, applyAuthResponse, loginMutation.isPending],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
