import { useSyncAnswers, useUnsyncedAnswers } from "../hooks/useProxyQueries.js";
import { toast } from "react-hot-toast";
import { 
  RefreshCcw, 
  Send,
  User,
  HelpCircle,
  Database,
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { useState } from "react";

export default function SyncQueuePage() {
  const { data: unsyncedData, isLoading, error, refetch: refetchUnsynced } = useUnsyncedAnswers();
  const syncAnswersMutation = useSyncAnswers();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSync = async () => {
    try {
      const res = await syncAnswersMutation.mutateAsync();
      toast.success(res.message || "Answers synced successfully.");
      refetchUnsynced();
    } catch (err) {
      toast.error("Sync failed: " + (err.response?.data?.error || err.message));
    }
  };

  const filteredData = unsyncedData?.data?.filter(item => 
    String(item.id).includes(searchTerm) || 
    String(item.stud_user_fk_id).includes(searchTerm) ||
    String(item.exam_question_fk_id).includes(searchTerm)
  ) || [];

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-xs font-bold uppercase tracking-widest text-primary">Scanning local storage...</p>
    </div>
  );

  if (error) return (
    <div className="alert alert-error mx-auto max-w-2xl mt-12 rounded-2xl shadow-xl shadow-error/10 border-none font-bold">
      <Database className="w-8 h-8" />
      <div>
        <h3 className="text-lg">Database Error</h3>
        <p className="text-xs opacity-80">{error.message}</p>
      </div>
      <button onClick={() => refetchUnsynced()} className="btn btn-sm btn-ghost bg-error-content/10">Retry</button>
    </div>
  );

  return (
    <div className="space-y-10 animate-fade-in py-6 max-w-7xl mx-auto">
      
      {/* 🚀 HEADER & STATS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="w-2 h-10 bg-success rounded-full shadow-lg shadow-success/30" />
             <h1 className="text-5xl font-black tracking-tight text-success uppercase italic">Sync Queue</h1>
          </div>
          <p className="text-base-content/50 font-medium pl-5 max-w-xl">
            This terminal manages the bidirectional synchronization between this node and the master registry. All answers are encrypted and signed locally.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          <div className="stats bg-base-100 shadow-xl border border-base-content/5 px-6 rounded-4xl overflow-hidden">
            <div className="stat place-items-center sm:place-items-start py-4">

              <div className="stat-title text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Unsynced Objects</div>
              <div className="stat-value text-4xl font-black text-success flex items-center gap-3">
                {unsyncedData?.data?.length || 0}
                {unsyncedData?.data?.length > 0 && <span className="w-3 h-3 rounded-full bg-success animate-ping"></span>}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleSync}
            disabled={syncAnswersMutation.isPending || !unsyncedData?.data?.length}
            className="btn btn-success btn-lg h-auto py-5 rounded-4xl font-black gap-4 group shadow-2xl shadow-success/10 border-none hover:scale-105 active:scale-95 transition-all"
          >

            {syncAnswersMutation.isPending ? (
              <RefreshCcw className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            )}
            <div className="text-left">
              <p className="text-[10px] opacity-70 leading-none mb-1 font-bold">Process All</p>
              <p className="leading-none tracking-tight text-xl">Sync Now</p>
            </div>
          </button>
        </div>
      </div>

      {/* 🔍 FILTER & BULK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
          <div className="relative group flex-1 max-w-md">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/30 group-focus-within:text-success transition-colors" />
             <input 
               type="text" 
               placeholder="Search by ID, User, or Question..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="input input-lg w-full pl-16 rounded-[1.8rem] bg-base-100/50 border-base-content/10 focus:border-success/30 focus:bg-base-100 focus:outline-none placeholder:opacity-40 transition-all font-medium text-base shadow-sm"
             />
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold opacity-30 px-4 whitespace-nowrap">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning" /> Local Only</div>
             <div className="w-px h-4 bg-base-content/20" />
             <div className="flex items-center gap-2 uppercase tracking-widest">{filteredData.length} Shown</div>
          </div>

      </div>

      {/* 📥 TABLE SECTION */}
      <div className="card bg-base-100/40 backdrop-blur-xl border border-base-content/5 rounded-[3rem] overflow-hidden shadow-2xl">
         <div className="overflow-x-auto">
           <table className="table w-full border-collapse">
             <thead>
               <tr className="text-[10px] font-black uppercase tracking-widest opacity-40 bg-base-200/40 border-b border-base-content/5">
                 <th className="py-6 pl-10">Object Reference</th>
                 <th>Student Identity</th>
                 <th>Resource ID</th>
                 <th>Snapshot Time</th>
                 <th className="pr-10 text-right">Synchronization Status</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-base-content/5">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5">
                      <div className="flex flex-col items-center justify-center py-32 space-y-4">
                        <div className="w-20 h-20 bg-base-200/50 rounded-[2.5rem] flex items-center justify-center">
                           <Database className="w-10 h-10 opacity-20" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold opacity-30">Warehouse Empty</h3>
                          <p className="text-sm font-medium opacity-20">No pending student answers found in local storage cluster.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map(item => (
                    <tr key={item.id} className="group hover:bg-success/5 transition-all duration-300">
                      <td className="pl-10 py-6">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-base-200 group-hover:bg-success/20 group-hover:text-success transition-colors flex items-center justify-center font-mono text-[10px] font-black">
                             #{item.id}
                           </div>
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase opacity-30 tracking-widest leading-none mb-1">LOCAL UID</span>
                             <span className="text-xs font-mono opacity-60">ANS_{item.id.toString().padStart(5, '0')}</span>
                           </div>
                        </div>
                      </td>
                      <td className="font-black">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><User className="w-4 h-4" /></div>
                           <div className="flex flex-col">
                             <span className="text-xs">User ID</span>
                             <span className="text-sm opacity-60 font-bold">STU-{item.stud_user_fk_id}</span>
                           </div>
                         </div>
                      </td>
                      <td>
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent"><HelpCircle className="w-4 h-4" /></div>
                           <div className="flex flex-col">
                             <span className="text-xs">Question ID</span>
                             <span className="text-sm opacity-60 font-bold">Q-{item.exam_question_fk_id}</span>
                           </div>
                         </div>
                      </td>
                      <td className="text-[11px] font-bold opacity-40">
                         {new Date(item.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="pr-10 text-right">
                         <div className="inline-flex items-center gap-3 bg-warning/10 text-warning py-2.5 px-5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest border border-warning/20 shadow-sm shadow-warning/5 animate-pulse">
                           <AlertTriangle className="w-3 h-3" />
                           Pending Sync
                         </div>
                      </td>
                    </tr>
                  ))
                )}
             </tbody>
           </table>
         </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
         <div className="flex-1 card bg-primary/5 border border-primary/20 rounded-[2.5rem] p-8 space-y-4">
            <div className="flex items-center gap-3 text-primary">
              <Database className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-widest text-xs">Integrity Notice</h3>
            </div>
            <p className="text-sm font-medium opacity-60 leading-relaxed">
              Every entry in this queue is cryptographically signed using AES-256-CBC and HMAC. 
              The Main Server will reject any tampered or unverified signatures during the push process.
            </p>
         </div>
         <div className="flex-1 card bg-base-100 border border-base-content/5 shadow-xl rounded-[2.5rem] p-8 flex items-center justify-center text-center">
            {unsyncedData?.data?.length === 0 ? (
               <div className="space-y-3">
                  <div className="w-12 h-12 bg-success rounded-2xl flex items-center justify-center text-success-content mx-auto shadow-lg shadow-success/20">
                     <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-success capitalize">Database Up-to-date</h4>
               </div>
            ) : (
               <div className="space-y-4">
                  <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Global Status</p>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3 overflow-hidden">
                      {[...Array(Math.min(filteredData.length, 4))].map((_, i) => (
                        <div key={i} className="h-10 w-10 rounded-full ring-4 ring-base-100 bg-base-200 flex items-center justify-center opacity-40">
                          <User className="w-5 h-5" />
                        </div>
                      ))}
                    </div>

                    <span className="text-xs font-black opacity-60">+{filteredData.length} pending objects</span>
                  </div>
               </div>
            )}
         </div>
      </div>

    </div>
  );
}
