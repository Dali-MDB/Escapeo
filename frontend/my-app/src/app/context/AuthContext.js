"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { refreshAccessToken, logout } from "../utils/auth";

// Create the context
export const AuthContext = createContext(null);

// Custom hook to use the AuthContext
export function useAuth() {
  return useContext(AuthContext);
}


/**
 * 
 * 
 */

// AuthProvider component
export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        setIsAuthenticated(true); // User is authenticated
      } else {
        try {
          const newToken = await refreshAccessToken(); // Try to refresh the token
          if (newToken) {
            setIsAuthenticated(false); // Token refreshed successfully
          } else {
            setIsAuthenticated(false); // No valid token, log out
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          setIsAuthenticated(false); // Handle error by logging out
        }
      }

      setIsLoading(false); // Stop loading
    };

    checkAuth();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}