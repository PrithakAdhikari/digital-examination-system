import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { getStoredToken, setStoredToken as setTokenInStorage, clearStoredToken } from "../api/axiosInstance.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getStoredToken());

  const setToken = useCallback((newToken) => {
    setTokenInStorage(newToken);
    setTokenState(newToken);
  }, []);

  const clearToken = useCallback(() => {
    clearStoredToken();
    setTokenState(null);
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated: !!token,
      setToken,
      clearToken,
      getToken: () => token,
    }),
    [token, setToken, clearToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
