import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, clearToken, getToken } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  subscriptionInactive: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionInactive, setSubscriptionInactive] = useState(false);

  const refreshUser = async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }
    try {
      const u = await api.auth.me();
      setUser(u);
      setIsAuthenticated(true);
      setSubscriptionInactive(false);
    } catch (err: any) {
      if (err.status === 403 && err.code === "SUBSCRIPTION_INACTIVE") {
        // Token valid but subscription ended — stay "authenticated" to show proper page
        setIsAuthenticated(true);
        setSubscriptionInactive(true);
      } else {
        clearToken();
        setIsAuthenticated(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    setSubscriptionInactive(false);
  };

  const logout = () => {
    clearToken();
    setUser(null);
    setIsAuthenticated(false);
    setSubscriptionInactive(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, subscriptionInactive, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
