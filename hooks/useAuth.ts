import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { login as apiLogin, logout as apiLogout } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  const login = async (username: string, password: string) => {
    const response = await apiLogin(username, password);
    if (response && response.user && response.token) {
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token);
    } else {
        throw new Error("Invalid credentials or server error");
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  // FIX: Replaced JSX with React.createElement to be compatible with a .ts file. This resolves parsing errors.
  return React.createElement(AuthContext.Provider, { value: { user, login, logout } }, children);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
