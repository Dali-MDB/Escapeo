// context/AuthContext.js
'use client';

import { createContext,useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize state from localStorage or default to false
  const [authenticated, setAuthenticated] = useState(false);

  // Update localStorage whenever authenticated changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authenticated', authenticated);
    }
  }, [authenticated]);

  return (
    <AuthContext.Provider value={{ authenticated, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};