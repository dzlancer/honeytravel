import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mobileApi } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  loyaltyPoints: number;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mobileApi.init().then(() => {
      mobileApi.getProfile()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    });
  }, []);

  const login = async (email: string, password: string) => {
    const res = await mobileApi.login(email, password);
    await mobileApi.setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await mobileApi.register(data);
    await mobileApi.setTokens(res.accessToken, res.refreshToken);
    setUser(res.user);
  };

  const logout = async () => {
    await mobileApi.clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
