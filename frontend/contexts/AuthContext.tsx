// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, getAuthToken, removeAuthToken, setAuthToken } from '../api';
import type { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User, token?: string) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const token = getAuthToken();
    
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await authAPI.verifyToken({ firebaseToken: token });
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        setError(null);
      } else {
        removeAuthToken();
        setUser(null);
        setIsAuthenticated(false);
        setError(response.error?.message || 'Authentication failed');
      }
    } catch (err) {
      console.error('Auth check error:', err);
      removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
      setError('Authentication check failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback((userData: User, token?: string) => {
    if (token) {
      setAuthToken(token);
    }
    setUser(userData);
    setIsAuthenticated(true);
    setError(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeAuthToken();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    }
  }, []);

  const updateUser = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};