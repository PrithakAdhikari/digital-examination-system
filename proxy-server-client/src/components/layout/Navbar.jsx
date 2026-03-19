import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { Server, LogOut, Moon, Sun, User } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { clearToken } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
  }, []);

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-40 w-full px-4 md:px-8 py-3 md:py-5 animate-fade-in">
      <div className="navbar glass-effect rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl px-4 md:px-6">
        <div className="navbar-start flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 active:scale-95 transition-transform group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-content shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform">
              <Server className="w-6 h-6" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-black tracking-tight leading-none text-base-content">DES Proxy</span>
              <span className="text-[10px] uppercase tracking-[0.2em] opacity-40 font-black">Node Manager</span>
            </div>
          </Link>
        </div>
        
        <div className="navbar-end gap-2 md:gap-4">
          {/* Theme Toggle */}
          <button 
            type="button" 
            className="btn btn-ghost btn-circle rounded-2xl hover:bg-base-200/50 transition-all duration-300" 
            onClick={toggleTheme}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              {theme === "light" ? (
                <Sun className="h-5 w-5 text-amber-500 animate-fade-in" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-400 animate-fade-in" />
              )}
            </div>
          </button>

          {/* User Profile Dropdown */}
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar rounded-2xl ring-1 ring-base-content/5 hover:ring-primary/30 transition-all">
              <div className="w-10 rounded-2xl bg-base-300 flex items-center justify-center">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.firstName} />
                ) : (
                  <User className="w-5 h-5 opacity-40" />
                )}
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content menu glass-effect rounded-3xl z-50 mt-4 w-64 p-3 shadow-2xl border border-white/10 animate-slide-up">
              <div className="px-5 py-4 border-b border-base-content/5 mb-2">
                <p className="text-sm font-black truncate text-base-content">
                  {user ? `${user.username}` : "Node Admin"}
                </p>
                <p className="text-[10px] uppercase tracking-widest font-black opacity-30 mt-1 truncate">
                  {user?.email || "No email"}
                </p>
              </div>

              <li className="mt-1">
                <button 
                  type="button" 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error/10 hover:text-error rounded-2xl transition-all duration-200 group"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-sm font-black uppercase tracking-widest">Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
