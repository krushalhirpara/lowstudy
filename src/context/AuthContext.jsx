"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  isProfileComplete: false,
  refreshUser: async () => {},
  logout: async () => {},
  setUser: () => {},
});

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/student/me', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!res.ok) {
        setUser(null);
        return null;
      }

      const data = await res.json();
      if (data?.authenticated && data?.user) {
        setUser(data.user);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      console.warn('[AuthContext] Session load error:', err?.message || err);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const refreshUser = useCallback(async () => {
    return await fetchCurrentUser();
  }, [fetchCurrentUser]);

  const logout = useCallback(async (redirectUrl = '/login') => {
    try {
      await fetch('/api/student/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch (err) {
      console.warn('[AuthContext] Logout network error:', err?.message || err);
    } finally {
      setUser(null);
      if (redirectUrl) {
        router.push(redirectUrl);
      }
      router.refresh();
    }
  }, [router]);

  const isAuthenticated = Boolean(user?.id);
  const isProfileComplete = Boolean(user?.city && (user?.universityId || user?.university));

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isProfileComplete,
        refreshUser,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
