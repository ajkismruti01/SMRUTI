import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { api } from '@/api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activeFamily, setActiveFamily] = useState(null);
  const [families, setFamilies] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkUserAuth = useCallback(async () => {
    try {
      setIsLoadingAuth(true);
      setAuthError(null);
      const res = await api.auth.me();

      if (res && res.user) {
        setUser(res.user);
        setIsAuthenticated(true);
        setActiveFamily(res.activeFamily || null);
        setFamilies(res.families || []);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setActiveFamily(null);
        setFamilies([]);
      }
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
  }, [checkUserAuth]);

  const logout = async (shouldRedirect = true) => {
    try {
      await api.auth.logout(shouldRedirect ? '/login' : null);
    } catch (e) {
      // ignore
    }
    setUser(null);
    setIsAuthenticated(false);
    setActiveFamily(null);
    setFamilies([]);
  };

  const switchFamily = (familyId) => {
    const fam = families.find((f) => f._id === familyId || f.id === familyId);
    if (fam) {
      setActiveFamily(fam);
      if (user) {
        user.currentFamilyId = fam._id || fam.id;
      }
    }
  };

  const navigateToLogin = (returnUrl = window.location.pathname) => {
    api.auth.redirectToLogin(returnUrl);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeFamily,
        families,
        isAuthenticated,
        isLoadingAuth,
        authError,
        authChecked,
        logout,
        switchFamily,
        navigateToLogin,
        checkUserAuth,
        setActiveFamily,
        setFamilies,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
