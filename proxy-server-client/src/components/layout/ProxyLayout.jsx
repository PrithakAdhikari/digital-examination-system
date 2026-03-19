import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function ProxyLayout() {
  return (
    <div className="min-h-screen bg-base-100 text-base-content flex flex-col transition-colors duration-500 overflow-x-hidden relative">
      {/* Dynamic Background Elements */}
      <div className="fixed top-[-20%] right-[-20%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-20%] left-[-20%] w-[60%] h-[60%] bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 z-10">
        <div className="animate-fade-in h-full">
          <Outlet />
        </div>
      </main>

      <footer className="footer footer-center p-10 opacity-40 select-none">
        <aside>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">
            &copy; 2026 Digital Examination System Proxy Terminal
          </p>
        </aside>
      </footer>
    </div>
  );
}
