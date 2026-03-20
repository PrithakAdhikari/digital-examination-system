import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function ProxyLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="drawer">
      <input
        id="proxy-drawer"
        type="checkbox"
        className="drawer-toggle"
        checked={drawerOpen}
        onChange={(e) => setDrawerOpen(e.target.checked)}
      />
      <div className="drawer-content flex flex-col min-h-screen bg-base-200/50">
        {/* Abstract background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/5 blur-[120px]" />
        </div>
        
        <Navbar onMenuClick={() => setDrawerOpen(true)} />
        <main className="flex-1 p-4 lg:p-10 page-transition">
          <div className="w-full max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <div className="drawer-side z-[100]">
        <label 
          htmlFor="proxy-drawer" 
          aria-label="close sidebar" 
          className="drawer-overlay"
        ></label>
        <aside className="w-80 h-full glass-effect border-r border-base-300/50 shadow-2xl overflow-y-auto bg-base-100 lg:bg-transparent">
          <Sidebar 
            onLinkClick={() => setDrawerOpen(false)} 
            onClose={() => setDrawerOpen(false)}
          />
        </aside>
      </div>
    </div>
  );
}
