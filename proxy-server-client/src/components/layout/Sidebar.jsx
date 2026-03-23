import { NavLink } from "react-router-dom";
import { useUnsyncedCount } from "../../hooks/useProxyQueries.js";
import { 
  Monitor, 
  LayoutDashboard, 
  Terminal, 
  Cpu, 
  Smartphone, 
  Share2,
  Users
} from "lucide-react";


const navItems = [
  { 
    to: "/registration", 
    end: true, 
    label: "Registration", 
    note: "Main Server Setup",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 013 11c0-2.78 1.129-5.295 2.953-7.108M12 11V3m0 8c0-2.61.119-5.127.347-7.597M12 11c.529-4.362 2.618-8.272 5.655-11M12 11c3.517 0 6.799-1.009 9.571-2.753m-2.04-3.44l-.09.054A10.003 10.003 0 0113 3c-2.78 0-5.295 1.129-7.108 2.953M21 12c0 2.78-1.129 5.295-2.953 7.108M18 21l-.054-.09A10.003 10.003 0 0121 12c0 2.78-1.129 5.295-2.953 7.108M12 21v-8" />
      </svg>
    )
  },
  { 
    to: "/examinations", 
    end: false, 
    label: "Examinations", 
    note: "Fetch & Select Exams",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  { 
    to: "/monitor", 
    end: false, 
    label: "Question Terminal",
    note: "Real-time Monitor",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 21h6l-.75-4M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  { 
    to: "/code-tester", 
    end: false, 
    label: "Code Tester",
    note: "Sandbox execution",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    to: "/clients",
    end: false,
    label: "Clients",
    note: "PC Monitoring",
    icon: <Smartphone className="h-5 w-5" />
  },
  {
    to: "/students",
    end: false,
    label: "Students",
    note: "Manage Students", // Added a default note
    icon: <Users className="h-5 w-5" />
  },
  {
    to: "/sync-queue",
    end: false,
    label: "Sync Queue",
    note: "Local DB Status",
    badge: true,
    icon: <Share2 className="h-5 w-5" />
  }
];


export default function Sidebar({ onLinkClick, onClose }) {
  const { data: countData } = useUnsyncedCount();
  const unsyncedCount = countData?.count || 0;

  return (
    <div className="flex flex-col h-full py-6 px-4 w-full">
      <div className="px-2 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold tracking-tight">Proxy Terminal</h2>
        </div>
        <button 
          type="button" 
          className="btn btn-ghost btn-sm btn-square rounded-lg lg:hidden" 
          onClick={onClose}
          aria-label="Close menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="px-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40 mb-4 px-2">Main Menu</p>
          <ul className="menu menu-md gap-1.5 p-0">
            {navItems.map(({ to, end, label, note, icon, badge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? "bg-primary text-primary-content shadow-lg shadow-primary/25 font-semibold active-nav-glow" 
                        : "hover:bg-primary/10 text-base-content/70 hover:text-primary"
                    }`
                  }
                >
                  <span className={`shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                    {icon}
                  </span>
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                       <span className="text-sm truncate">{label}</span>
                       {badge && unsyncedCount > 0 && (
                         <span className={`badge badge-sm badge-success font-black border-none animate-pulse-subtle`}>
                           {unsyncedCount}
                         </span>
                       )}
                    </div>
                    {note && (
                      <span className="text-[10px] font-normal leading-tight opacity-60 truncate">
                        {note}
                      </span>
                    )}
                  </div>


                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-auto px-2 pt-4 border-t border-base-300/30">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
          <p className="text-xs font-bold text-primary mb-1">Status</p>
          <p className="text-[10px] opacity-60 leading-relaxed">Proxy node is active and monitoring for examinations.</p>
        </div>
        <div className="flex items-center gap-3 px-2 py-2 group cursor-default">
          <div className="w-9 h-9 rounded-xl bg-neutral text-neutral-content flex items-center justify-center overflow-hidden shadow-inner shrink-0">
            <span className="text-[10px] font-bold">PT</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate">Proxy Terminal</span>
            <span className="text-[10px] opacity-40 truncate">v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
