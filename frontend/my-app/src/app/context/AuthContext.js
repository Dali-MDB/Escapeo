"use client";

import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);

  /**
   * 

   */

  const contextData = {
    authenticated,
    setAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
