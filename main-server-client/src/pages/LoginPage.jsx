import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { login } from "../api/auth.js";
import { setStoredToken } from "../api/axiosInstance.js";

export default function LoginPage() {
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Simplified Logo Area */}
        <div className="mb-12 flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white font-black text-xl mb-4">
            D
          </div>
          <h1 className="text-xl font-bold text-black tracking-tight">Examinations System</h1>
          <p className="text-xs text-black/40 uppercase tracking-widest font-black mt-1">Admin Access</p>
        </div>

        {/* Minimalist Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-black/40 tracking-wider ml-1">Email</label>
            <input
              type="email"
              placeholder="admin@des.com"
              className="w-full px-4 h-12 bg-white border border-black/10 rounded-xl focus:border-black focus:ring-0 transition-all text-sm outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-black/40 tracking-wider ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 h-12 bg-white border border-black/10 rounded-xl focus:border-black focus:ring-0 transition-all text-sm outline-none"
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
            className="w-full h-12 bg-black text-white rounded-xl text-sm font-bold hover:bg-black/90 active:scale-[0.98] transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="loading loading-spinner loading-sm text-white"></span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-12 text-[10px] font-bold text-black/20 uppercase tracking-tighter">
          Powered by Digital Examination System v2.0
        </p>
      </div>
    </div>
  );
}
