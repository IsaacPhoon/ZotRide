import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authAPI, tokenManager } from "../services/api";
import type { User } from "../services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenManager.getToken();
      const savedUser = tokenManager.getUser();

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const { user: verifiedUser } = await authAPI.verifyJWT();
          setUser(verifiedUser);
          tokenManager.setUser(verifiedUser);
        } catch (error) {
          // Token is invalid, clear auth state
          tokenManager.clearAuth();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData: User) => {
    tokenManager.setToken(token);
    tokenManager.setUser(userData);
    setUser(userData);
  };

  const logout = () => {
    tokenManager.clearAuth();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const updatedUser = await authAPI.getCurrentUser();
      setUser(updatedUser);
      tokenManager.setUser(updatedUser);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      logout();
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    tokenManager.setUser(updatedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
