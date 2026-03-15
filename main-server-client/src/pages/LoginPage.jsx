import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth.js";
import { setStoredToken } from "../api/axiosInstance.js";
import { useTheme } from "../context/ThemeContext.jsx";

export default function LoginPage() {
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? "/admin";

  const mutation = useMutation({
    mutationFn: (credentials) => login(credentials),
    onSuccess: (data) => {
      if (data?.accessToken) {
        setStoredToken(data.accessToken);
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        navigate(from, { replace: true });
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Theme Toggle in Corner */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          type="button" 
          className="btn btn-ghost btn-circle rounded-xl hover:bg-base-200 transition-all duration-300" 
          onClick={toggleTheme}
        >
          <div className="relative w-6 h-6">
            <div className={`absolute inset-0 transform transition-all duration-500 ${theme === "light" ? "rotate-0 opacity-100 scale-100" : "rotate-90 opacity-0 scale-0"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className={`absolute inset-0 transform transition-all duration-500 ${theme === "dark" ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      <div className="w-full max-w-[400px] flex flex-col items-center z-10">
        {/* Simplified Logo Area */}
        <div className="mb-12 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-content font-black text-xl mb-4 shadow-lg shadow-primary/20">
            D
          </div>
          <h1 className="text-xl font-bold text-base-content tracking-tight">Examinations System</h1>
          <p className="text-xs text-base-content/40 uppercase tracking-widest font-black mt-1">Admin Access</p>
        </div>

        {/* Minimalist Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-base-content/40 tracking-wider ml-1">Email</label>
            <input
              type="email"
              placeholder="admin@des.com"
              className="w-full px-4 h-12 bg-base-200 border border-base-content/10 rounded-xl focus:border-primary focus:ring-0 transition-all text-sm outline-none text-base-content"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-base-content/40 tracking-wider ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 h-12 bg-base-200 border border-base-content/10 rounded-xl focus:border-primary focus:ring-0 transition-all text-sm outline-none text-base-content"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 animate-fade-in">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[11px] font-bold text-red-600">
                {mutation.error?.response?.data?.error ?? mutation.error?.message ?? "Invalid credentials."}
              </span>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full h-12 bg-primary text-primary-content rounded-xl text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-primary/20"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm text-primary-content"></span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-12 text-[10px] font-bold text-base-content/20 uppercase tracking-tighter">
          Powered by Digital Examination System v2.0
        </p>
      </div>
    </div>
  );
}
