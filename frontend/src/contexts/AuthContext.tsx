import React, { useEffect, useState, createContext, useContext } from 'react';
import { authService, AuthResponse, LoginCredentials } from '../services/authService';

interface Admin {
  id: number;
  email: string;
  name: string;
  login?: string;
  avatar_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('gh_admin_token');
    const storedAdmin = localStorage.getItem('admin');
    
    if (token && storedAdmin) {
      setIsAuthenticated(true);
      setAdmin(JSON.parse(storedAdmin));
    }
    setLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials);
    setIsAuthenticated(true);
    setAdmin(response.admin);
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      admin,
      login,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}