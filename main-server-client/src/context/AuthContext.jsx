import { createContext, useContext, useMemo } from "react";
import { getStoredToken, setStoredToken, clearStoredToken } from "../api/axiosInstance.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useMemo(
    () => ({
      isAuthenticated: !!getStoredToken(),
      setToken: setStoredToken,
      clearToken: clearStoredToken,
      getToken: getStoredToken,
    }),
    []
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
