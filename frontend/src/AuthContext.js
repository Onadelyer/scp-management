import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    isAdmin: false,
    username: null,
  });

  useEffect(() => {
    // Load authentication state from localStorage when the app starts
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');

    if (token && userRole && username) {
      setAuth({
        isAuthenticated: true,
        isAdmin: userRole === 'admin',
        username: username,
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
