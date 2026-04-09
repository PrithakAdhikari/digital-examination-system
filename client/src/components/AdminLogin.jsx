import { useState } from "react";
import axios from "axios";
import { Lock, Mail, RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "react-hot-toast";

const PROXY_URL = "http://localhost:8001";

export default function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${PROXY_URL}/auth/login`, { email, password });
      const { accessToken, user } = response.data;
      
      // Store token in session (not localStorage for security as per requirement)
      // The requirement says "once out of the admin panel we should always have to log in again"
      // So stay in memory/state.
      onLoginSuccess({ token: accessToken, user });
      toast.success("Admin Login Successful!");
    } catch (err) {
      console.error("Login failed:", err);
      toast.error(err.response?.data?.error || "Invalid credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card bg-base-100 shadow-2xl border border-base-300/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 w-full max-w-md mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 text-primary rounded-3xl group-hover:rotate-12 transition-transform duration-300">
            <Lock className="w-12 h-12" />
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tight">Admin Portal</h2>
        <p className="text-sm text-base-content/60 font-medium">Please authenticate to manage this terminal.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-40">Admin Email</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <input 
                type="email" 
                placeholder="admin@example.com" 
                className="input input-bordered w-full pl-12 rounded-2xl bg-base-200/50 border-base-300/50 focus:border-primary/50 transition-all font-medium"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-40">Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="input input-bordered w-full pl-12 rounded-2xl bg-base-200/50 border-base-300/50 focus:border-primary/50 transition-all font-medium"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn btn-primary btn-lg w-full rounded-2xl shadow-xl shadow-primary/20 text-lg font-bold gap-3 py-4"
        >
          {isLoading ? (
            <RefreshCcw className="w-6 h-6 animate-spin" />
          ) : (
            <ShieldCheck className="w-6 h-6" />
          )}
          {isLoading ? "Authenticating..." : "Login to Portal"}
        </button>
      </form>
    </div>
  );
}
