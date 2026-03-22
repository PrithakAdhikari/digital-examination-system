import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useTheme } from "./context/ThemeContext.jsx";
import { 
  Monitor, 
  Sun, 
  Moon, 
  Cpu, 
  CheckCircle2, 
  AlertCircle, 
  Heart, 
  Play, 
  Square,
  RefreshCcw,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useQuestionFetcher } from "./hooks/useQuestionFetcher.js";
import ExaminationView from "./components/ExaminationView.jsx";

const PROXY_URL = "http://192.168.1.100:8001";

function App() {
  const { theme, toggleTheme } = useTheme();
  const [registered, setRegistered] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);
  const [heartbeatActive, setHeartbeatActive] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [lastHeartbeat, setLastHeartbeat] = useState(null);
  const [isExamMode, setIsExamMode] = useState(false);

  // Start question fetcher when registered
  const { questions } = useQuestionFetcher(registered);

  // Load registration from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("client_registration");
    if (stored) {
      const data = JSON.parse(stored);
      setClientDetails(data);
      setRegistered(true);
    }
  }, []);

  const registerClient = async () => {
    setIsRegistering(true);
    const deviceId = `TERM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    try {
      const response = await axios.post(`${PROXY_URL}/register-client`, { device_id: deviceId });
      const data = response.data;
      
      localStorage.setItem("client_registration", JSON.stringify(data));
      setClientDetails(data);
      setRegistered(true);
      toast.success("Client Registered Successfully!");
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error("Failed to register client. Is Proxy Server running?");
    } finally {
      setIsRegistering(false);
    }
  };

  const sendHeartbeat = useCallback(async () => {
    if (!clientDetails?.client_id || !heartbeatActive) return;

    try {
      await axios.post(`${PROXY_URL}/heartbeat/${clientDetails.client_id}`);
      setLastHeartbeat(new Date());
      console.log("Heartbeat sent at:", new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Heartbeat failed:", err.message);
    }
  }, [clientDetails, heartbeatActive]);

  useEffect(() => {
    let interval;
    if (registered && heartbeatActive) {
      // Send immediately
      sendHeartbeat();
      // Then every 5 seconds
      interval = setInterval(sendHeartbeat, 5000);
    }
    return () => clearInterval(interval);
  }, [registered, heartbeatActive, sendHeartbeat]);

  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      {/* Navbar */}
      <div className="navbar glass-effect sticky top-0 z-50 px-6 py-4 border-b border-base-content/5 shadow-sm">
        <div className="flex-1 flex items-center gap-3 group">
          <div className="p-1.5 md:p-2 bg-primary rounded-xl text-primary-content shadow-lg shadow-primary/20 group-hover:rotate-12 transition-transform duration-300">
            <Monitor className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight leading-none uppercase">DES</h1>
            <p className="text-[8px] md:text-[10px] font-bold opacity-40 tracking-widest leading-none uppercase mt-1">Examination Client {isExamMode && "• In Exam"}</p>
          </div>
        </div>
        <div className="flex-none gap-1 md:gap-2">
          {registered && !isExamMode && questions.length > 0 && (
            <button 
              onClick={() => setIsExamMode(true)}
              className="btn btn-primary btn-xs md:btn-sm rounded-lg md:rounded-xl px-3 md:px-6 font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              <span className="hidden xs:inline">Enter Exam</span>
              <span className="xs:hidden">Enter</span>
            </button>
          )}
          <button 
            onClick={toggleTheme} 
            className="btn btn-ghost btn-circle btn-sm md:btn-md rounded-xl hover:bg-base-300"
          >
            {theme === "light" ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-12 flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        {isExamMode ? (
          <ExaminationView onExit={() => setIsExamMode(false)} />
        ) : (
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            {!registered ? (
              <div className="card bg-base-100 shadow-2xl border border-base-300/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 text-center space-y-6 md:space-y-8">
                <div className="flex justify-center">
                  <div className="p-4 md:p-6 bg-error/10 text-error rounded-3xl animate-pulse-subtle">
                    <AlertCircle className="w-12 h-12 md:w-16 md:h-16" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl md:text-4xl font-black tracking-tight">Client Not Registered</h2>
                  <p className="text-sm md:text-base text-base-content/60 font-medium max-w-sm mx-auto">
                    This terminal has not been registered with the local proxy server yet.
                  </p>
                </div>
                
                <button 
                  onClick={registerClient}
                  disabled={isRegistering}
                  className="btn btn-primary btn-lg w-full rounded-2xl shadow-xl shadow-primary/20 text-base md:text-lg font-bold gap-3 py-4"
                >
                  {isRegistering ? (
                    <RefreshCcw className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
                  )}
                  {isRegistering ? "Registering..." : "Register Client"}
                </button>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-2xl border border-base-300/50 rounded-3xl md:rounded-[2.5rem] overflow-hidden text-sm md:text-base">
                <div className="bg-success/5 p-6 md:p-10 text-center space-y-6 md:space-y-8 border-b border-success/10">
                  <div className="flex justify-center">
                    <div className="p-4 md:p-6 bg-success/10 text-success rounded-3xl">
                      <CheckCircle2 className="w-12 h-12 md:w-16 md:h-16" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl md:text-4xl font-black tracking-tight text-success">Registered</h2>
                    <div className="badge badge-success badge-lg gap-2 py-3 md:py-4 px-4 md:px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] md:text-xs">
                      <span className="w-2 h-2 rounded-full bg-success-content animate-pulse"></span>
                      Terminal {clientDetails?.client_physical_id}
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="p-4 md:p-6 bg-base-200 rounded-2xl md:rounded-3xl border border-base-300 space-y-1 md:space-y-2">
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-40">Client ID</p>
                      <p className="font-mono text-xs md:text-sm break-all truncate">{clientDetails?.client_id}</p>
                    </div>
                    <div className="p-4 md:p-6 bg-base-200 rounded-2xl md:rounded-3xl border border-base-300 space-y-1 md:space-y-2">
                      <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-40">Heartbeat Status</p>
                      <div className="flex items-center gap-2">
                        <Heart className={`w-3 h-3 md:w-4 md:h-4 ${heartbeatActive ? "text-error fill-error animate-ping" : "opacity-20"}`} />
                        <span className="font-bold text-xs md:text-sm uppercase">
                          {heartbeatActive ? "Active" : "Paused"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {lastHeartbeat && (
                    <div className="flex items-center justify-center gap-2 text-xs font-medium opacity-40">
                      <RefreshCcw className="w-3 h-3" />
                      Last signal sent at {lastHeartbeat.toLocaleTimeString()}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => setHeartbeatActive(!heartbeatActive)}
                      className={`btn btn-lg flex-1 rounded-2xl font-bold uppercase tracking-widest gap-3 shadow-lg ${
                        heartbeatActive 
                          ? "btn-error btn-outline hover:bg-error/10" 
                          : "btn-success shadow-success/20"
                      }`}
                    >
                      {heartbeatActive ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                      {heartbeatActive ? "Stop Heartbeat" : "Resume Heartbeat"}
                    </button>
                    
                    <button 
                      onClick={() => {
                          localStorage.removeItem("client_registration");
                          setRegistered(false);
                          setClientDetails(null);
                          setHeartbeatActive(false);
                          toast.error("Client Unregistered (Local Only)");
                      }}
                      className="btn btn-ghost btn-lg rounded-2xl font-bold uppercase tracking-widest opacity-40 hover:opacity-100 hover:bg-error/10 hover:text-error transition-all"
                    >
                      Unregister
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/10 blur-[120px]" />
      </div>
    </div>
  );
}

export default App;
