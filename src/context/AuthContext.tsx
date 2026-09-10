'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, userMe, userLogin as apiLogin, userRegister as apiRegister } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { name: string; email: string; phone?: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ebanzo_user_token') : null;
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    const result = await userMe();
    if (result?.user) {
      setUser(result.user);
    } else {
      localStorage.removeItem('ebanzo_user_token');
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiLogin({ email, password });
    if (res.status === 'success' && res.data?.token) {
      localStorage.setItem('ebanzo_user_token', res.data.token);
      setUser(res.data.user);
      return { success: true, message: res.message || 'Logged in successfully!' };
    }
    return { success: false, message: res.message || 'Login failed. Please try again.' };
  };

  const register = async (data: { name: string; email: string; phone?: string; password: string }): Promise<{ success: boolean; message: string }> => {
    const res = await apiRegister(data);
    if (res.status === 'success' && res.data?.token) {
      localStorage.setItem('ebanzo_user_token', res.data.token);
      setUser(res.data.user);
      return { success: true, message: res.message || 'Account created!' };
    }
    return { success: false, message: res.message || 'Registration failed.' };
  };

  const logout = () => {
    localStorage.removeItem('ebanzo_user_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
