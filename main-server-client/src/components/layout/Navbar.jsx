import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { clearStoredToken } from "../../api/axiosInstance.js";

export default function Navbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
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
    clearStoredToken();
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="sticky top-0 z-40 w-full px-2 md:px-6 py-2 md:py-4 animate-fade-in">
      <div className="navbar glass-effect rounded-2xl md:rounded-3xl border border-white/20 shadow-xl px-2 md:px-4">
        <div className="navbar-start">
          <button
            type="button"
            className="btn btn-ghost btn-square rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
            onClick={onMenuClick}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/admin" className="ml-2 flex items-center gap-3 group">
            <div className="hidden sm:flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">DES</span>
              <span className="text-[10px] uppercase tracking-widest opacity-50 font-semibold">Digital Exam System</span>
            </div>
          </Link>
        </div>
        
        <div className="navbar-end gap-3">
          {/* Theme Toggle */}
          <button 
            type="button" 
            className="btn btn-ghost btn-circle rounded-xl hover:bg-base-200 transition-all duration-300" 
            onClick={toggleTheme}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
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

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle rounded-xl avatar placeholder focus:ring-2 focus:ring-primary/30 transition-all">
              <div className="bg-neutral text-neutral-content rounded-xl w-10 shadow-inner overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <span className="text-xs font-bold">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <ul tabIndex={0} className="dropdown-content menu glass-effect rounded-2xl z-50 mt-4 w-52 p-2 shadow-2xl border border-base-300/30">
              <div className="px-4 py-3 border-b border-base-300/30 mb-2">
                <p className="text-sm font-bold truncate">
                  {user ? `${user.firstName} ${user.lastName}` : "Guest Admin"}
                </p>
                <p className="text-xs opacity-50 truncate">{user?.email || "No email"}</p>
              </div>
              <li>
                <button 
                  type="button" 
                  onClick={handleLogout}
                  className="text-error hover:bg-error/10 rounded-xl transition-colors duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
