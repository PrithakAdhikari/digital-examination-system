import { useStudents } from "../hooks/useProxyQueries.js";
import { 
  Users, 
  User as UserIcon, 
  Search, 
  RefreshCcw, 
  AlertCircle, 
  Info,
  Hash,
  Fingerprint
} from "lucide-react";
import { useState } from "react";

export default function StudentsPage() {
  const { data, isLoading, error, refetch } = useStudents();
  const [searchTerm, setSearchTerm] = useState("");

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-xs font-bold uppercase tracking-widest">Fetching Students...</p>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-error mx-auto max-w-2xl mt-12 rounded-2xl shadow-xl shadow-error/10 border-none font-bold">
      <AlertCircle className="w-8 h-8" />
      <div>
        <h3 className="text-lg">Connection Error</h3>
        <p className="text-xs opacity-80">{error.message}</p>
      </div>
      <button onClick={() => refetch()} className="btn btn-sm btn-ghost bg-error-content/10">Retry</button>
    </div>
  );

  const students = data?.data || [];
  const filteredStudents = students.filter(s => 
    s.firstname_txt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastname_txt.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.stud_exam_symbol_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12 animate-fade-in p-2 md:p-6 max-w-7xl mx-auto">
      
      {/* 🚀 HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
            <h1 className="text-4xl font-black tracking-tight">Active Students</h1>
          </div>
          <p className="text-base-content/50 font-medium pl-4">Manage and monitor students assigned to this examination center.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text" 
              placeholder="Search students..." 
              className="input input-bordered w-full pl-12 rounded-2xl bg-base-100/50 border-base-300/50 focus:border-primary/50 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => {
              const refreshBtn = document.getElementById('refresh-btn');
              refreshBtn.classList.add('animate-spin');
              refetch().finally(() => refreshBtn.classList.remove('animate-spin'));
            }} 
            className="btn btn-ghost bg-base-100 rounded-2xl shadow-sm border border-base-300/50 px-6 font-bold"
          >
            <RefreshCcw id="refresh-btn" className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="card bg-base-100/50 backdrop-blur-xl shadow-2xl border border-base-content/5 rounded-[3rem] overflow-hidden">
          <div className="card-body items-center text-center py-24 space-y-6">
            <div className="p-8 bg-base-200 rounded-[2.5rem]">
              <Users className="w-16 h-16 opacity-20" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h2 className="text-2xl font-black italic opacity-40 tracking-tight">No Students Found</h2>
              <p className="text-sm font-medium opacity-40">Ensure students are correctly assigned to this center in the master server cluster.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2 md:px-0">
          {filteredStudents.map((student) => (
            <div key={student.id} className="card bg-base-100/60 backdrop-blur-sm shadow-xl border-2 border-base-content/5 transition-all duration-300 overflow-hidden rounded-[2.5rem] group hover:bg-base-100 hover:border-primary/20 hover:ring-8 hover:ring-primary/5">
              <div className="card-body p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  <div className="badge badge-ghost opacity-40 py-3 px-4 text-[9px] font-black uppercase tracking-widest rounded-lg">ID {student.id}</div>
                </div>

                <div className="space-y-1 mb-6">
                  <h2 className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">
                    {student.firstname_txt} {student.lastname_txt}
                  </h2>
                  <p className="text-sm font-bold opacity-40 lowercase">@{student.username}</p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3 p-4 bg-base-200/50 rounded-2xl border border-base-content/5 hover:border-base-content/10 transition-colors">
                    <Hash className="w-4 h-4 opacity-30" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Symbol No</span>
                      <span className="text-sm font-bold font-mono">{student.stud_exam_symbol_no || "N/A"}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-base-200/50 rounded-2xl border border-base-content/5 hover:border-base-content/10 transition-colors">
                    <Fingerprint className="w-4 h-4 opacity-30" />
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Reg No</span>
                      <span className="text-sm font-bold font-mono">{student.stud_exam_reg_no || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2 text-xs font-bold opacity-30 group-hover:opacity-60 transition-opacity">
                  <Info className="w-3.5 h-3.5" />
                  <span>Assigned to this terminal center</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
