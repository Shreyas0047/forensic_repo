import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "../services/authService";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("forensics_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      const persistedUser = localStorage.getItem("forensics_user");
      if (persistedUser) {
        setUser(JSON.parse(persistedUser));
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (payload) => {
    const { token: nextToken, user: nextUser } = await authApi.login(payload);
    localStorage.setItem("forensics_token", nextToken);
    localStorage.setItem("forensics_user", JSON.stringify(nextUser));
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    setToken(nextToken);
    setUser(nextUser);
  };

  const register = async (payload) => {
    const { token: nextToken, user: nextUser } = await authApi.register(payload);
    localStorage.setItem("forensics_token", nextToken);
    localStorage.setItem("forensics_user", JSON.stringify(nextUser));
    api.defaults.headers.common.Authorization = `Bearer ${nextToken}`;
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem("forensics_token");
    localStorage.removeItem("forensics_user");
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, isAuthenticated: Boolean(token) }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
