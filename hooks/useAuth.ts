import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';
import { login as apiLogin, logout as apiLogout } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (username: string) => {
    const loggedInUser = await apiLogin(username);
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
    } else {
        throw new Error("Invalid credentials");
    }
  };

  const logout = () => {
    apiLogout();
    setUser(null);
    localStorage.removeItem('user');
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
