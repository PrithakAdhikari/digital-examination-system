import { useExaminations, useSelectExamination, useRemoveExamination, useRegistrationStatus } from "../hooks/useProxyQueries.js";
import { toast } from "react-hot-toast";
import { 
  AlertCircle, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  RefreshCcw, 
  Calendar, 
  Info, 
  Layers, 
  ChevronRight,
  Monitor
} from "lucide-react";

const getSubjectStatus = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();
  const diffMinutes = (start - now) / (1000 * 60);

  if (diffMinutes > 60) return { label: "Upcoming", color: "badge-ghost opacity-40" };
  if (diffMinutes > 0) return { label: "Starting Soon", color: "badge-warning animate-pulse" };
  return { label: "Ready to Sync", color: "badge-success" };
};

function formatDate(dateString) {
  const d = new Date(dateString);
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export default function ExaminationsPage() {
  const { data: statusData, refetch: refetchStatus } = useRegistrationStatus();
  const { data, isLoading, error, refetch } = useExaminations();
  const selectExamMutation = useSelectExamination();
  const removeExamMutation = useRemoveExamination();


  const selectedExamId = statusData?.selected_examination_id;
  const selectedSubjectId = statusData?.selected_subject_id;



  const handleSelect = async (exam, subject) => {
    try {
      await selectExamMutation.mutateAsync({ 
          examId: exam.id, 
          subjectId: subject.id,
          startTime: subject.exam_startTime_ts 
      });
      toast.success(`Selected ${subject.subject_name_txt} for sync!`);
      refetch();
      refetchStatus();
    } catch (err) {
      toast.error("Failed to select: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to stop synchronizing this subject? This won't delete answers but will stop automatic fetching.")) {
      return;
    }

    try {
      await removeExamMutation.mutateAsync();
      toast.success("Synchronization stopped.");
      refetch();
      refetchStatus();
    } catch (err) {
      toast.error("Failed to remove: " + (err.response?.data?.error || err.message));
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
      <span className="loading loading-spinner loading-lg text-primary"></span>
      <p className="text-xs font-bold uppercase tracking-widest">Loading Examinations...</p>
    </div>
  );
  
  if (error) return (
    <div className="alert alert-error mx-auto max-w-2xl mt-12 rounded-2xl shadow-xl shadow-error/10 border-none font-bold">
      <AlertCircle className="w-8 h-8" />
      <div>
        <h3 className="text-lg">Network Error</h3>
        <p className="text-xs opacity-80">{error.message}</p>
      </div>
      <button onClick={() => refetch()} className="btn btn-sm btn-ghost bg-error-content/10">Retry</button>
    </div>
  );

  const exams = data?.data || [];
  const ongoingExam = exams.find(e => String(e.id) === String(selectedExamId));

  console.log(ongoingExam, selectedSubjectId);

  const ongoingSubject = ongoingExam?.subjects?.find(s => String(s.id) === String(selectedSubjectId));

  console.log(ongoingSubject);
  
  return (
    <div className="space-y-12 animate-fade-in p-2 md:p-6 max-w-7xl mx-auto">
      
      {/* 🚀 ONGOING STATUS HEADER */}
      <div className="relative group">
        <div className="absolute inset-x-0 -top-4 -bottom-4 bg-linear-to-r from-primary/10 via-accent/10 to-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
        
        {ongoingExam ? (
          <div className="card bg-base-100/40 backdrop-blur-xl border border-primary/20 shadow-2xl rounded-[3rem] overflow-hidden">
            <div className="card-body p-8 md:p-12">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
                
                <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-primary flex items-center justify-center text-primary-content shadow-2xl shadow-primary/40 group-hover:rotate-6 transition-transform duration-500">
                      <Monitor className="w-10 h-10" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-success border-4 border-base-100 flex items-center justify-center text-success-content animate-bounce-subtle shadow-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-2">
                       <span className="badge badge-primary py-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-lg shadow-primary/10">Active Session</span>
                       <div className="flex items-center gap-2 text-xs font-bold opacity-60 bg-base-300/30 py-2 px-4 rounded-xl backdrop-blur-sm">
                          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
                          Syncing Mode
                       </div>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">{ongoingExam.exam_name_txt}</h2>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 pt-2">
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Subject</span>
                          <div className="flex items-center gap-2 font-bold text-primary text-xl">
                            <Layers className="w-5 h-5" /> {ongoingSubject?.subject_name_txt || 'Retrieving...'}
                          </div>
                       </div>
                       <div className="w-px h-10 bg-base-content/10 hidden md:block" />
                       <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black uppercase opacity-30 tracking-widest">Scheduled For</span>
                          <div className="flex items-center gap-2 font-bold text-lg">
                            <Calendar className="w-4 h-4 opacity-40" /> {ongoingSubject ? formatDate(ongoingSubject.exam_startTime_ts) : '—'}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={handleRemove}
                    disabled={removeExamMutation.isPending}
                    className="btn btn-ghost hover:bg-error/10 hover:text-error btn-lg h-20 rounded-[1.8rem] px-8 font-black group transition-all"
                  >
                    <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    <div className="text-left">
                      <p className="text-[10px] opacity-40 leading-none mb-1 font-bold">Cancel</p>
                      <p className="leading-none tracking-tight">Stop Active</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-base-200/50 rounded-[2.5rem] p-12 text-center border-4 border-dashed border-base-content/5 animate-pulse-subtle">
             <div className="flex flex-col items-center gap-5 opacity-30">
                <div className="w-20 h-20 rounded-3xl bg-base-content/5 flex items-center justify-center italic font-black text-4xl">?</div>
                <div>
                  <h3 className="text-xl font-bold">No Examination Selected</h3>
                  <p className="text-sm font-medium">Choose a subject from the list below to start local synchronization.</p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* 📚 AVAILABLE LIST */}
      <div className="space-y-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/20" />
              <h1 className="text-4xl font-black tracking-tight">Available Subject Syncs</h1>
            </div>
            <p className="text-base-content/50 font-medium pl-4">Synchronize question papers and setup local exam parameters.</p>
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
            Reload Source
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="card bg-base-100/50 backdrop-blur-xl shadow-2xl border border-base-content/5 rounded-[3rem] overflow-hidden">
            <div className="card-body items-center text-center py-24 space-y-6">
              <div className="p-8 bg-base-200 rounded-[2.5rem]">
                <Info className="w-16 h-16 opacity-20" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h2 className="text-2xl font-black italic opacity-40 tracking-tight">Empty Inventory</h2>
                <p className="text-sm font-medium opacity-40">Ensure this exam center is properly registered and assigned subjects in the master server cluster.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-2 md:px-0">
            {exams.map((exam) => {
              const isAnySubjectActive = String(exam.id) === String(selectedExamId);
              return (
                <div key={exam.id} className={`card bg-base-100/60 backdrop-blur-sm shadow-xl border-2 transition-all duration-500 overflow-hidden rounded-[2.5rem] group hover:bg-base-100 ${isAnySubjectActive ? 'border-primary ring-8 ring-primary/5 bg-base-100' : 'border-base-content/5 hover:border-primary/20'}`}>
                  <div className="card-body p-8 md:p-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className={`badge ${isAnySubjectActive ? 'badge-primary' : 'badge-ghost opacity-40'} py-3 px-4 text-[9px] font-black uppercase tracking-widest rounded-lg`}>EXAM-ID {exam.id}</span>
                        </div>
                        <h2 className={`text-2xl md:text-3xl font-black tracking-tight leading-tight mt-2 transition-colors ${isAnySubjectActive ? 'text-primary' : 'group-hover:text-primary'}`}>{exam.exam_name_txt}</h2>
                      </div>
                      <div className="p-3 bg-base-200/50 rounded-2xl border border-base-content/5">
                        <Monitor className="w-5 h-5 opacity-20" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="h-[2px] w-6 bg-primary/20" />
                        <span className="text-[11px] font-black uppercase opacity-40 tracking-widest">Select Subject</span>
                        <div className="h-[2px] flex-1 bg-primary/20" />
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        {exam.subjects && exam.subjects.map(subject => {
                          const isSubjectActive = String(subject.id) === String(selectedSubjectId);
                          const status = getSubjectStatus(subject.exam_startTime_ts);
                          
                          return (
                            <div 
                              key={subject.id} 
                              className={`group/item relative p-5 rounded-[1.8rem] border-2 transition-all duration-300 cursor-default ${
                                isSubjectActive 
                                  ? 'bg-primary/5 border-primary/40 shadow-xl shadow-primary/5' 
                                  : 'bg-base-200/40 border-transparent hover:border-base-300 hover:bg-base-100'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-4">
                                <div className="space-y-2 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className={`text-base font-black truncate ${isSubjectActive ? 'text-primary' : ''}`}>
                                      {subject.subject_name_txt}
                                    </span>
                                    {!isSubjectActive && (
                                      <span className={`badge badge-sm rounded-[5px] text-[8px] font-black uppercase tracking-widest py-2.5 px-3 border-none ${status.color}`}>
                                        {status.label}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-[11px] font-bold opacity-40">
                                    <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {formatDate(subject.exam_startTime_ts)}</div>
                                    <div className="flex items-center gap-1.5 sm:flex"><Info className="w-3.5 h-3.5" /> ID: {subject.id}</div>
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={() => handleSelect(exam, subject)}
                                  disabled={selectExamMutation.isPending || isSubjectActive}
                                  className={`btn shrink-0 min-w-[120px] h-12 rounded-2xl font-black uppercase tracking-tight text-xs transition-all ${
                                    isSubjectActive 
                                      ? 'btn-success bg-success/10 border-none text-success no-animation cursor-default' 
                                      : 'btn-primary shadow-lg shadow-primary/20 group-hover/item:translate-x-1'
                                  }`}
                                >
                                  {selectExamMutation.isPending ? (
                                    <span className="loading loading-spinner loading-xs"></span>
                                  ) : isSubjectActive ? (
                                    <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Active</div>
                                  ) : (
                                    <div className="flex items-center gap-2">Initialize <ChevronRight className="w-4 h-4" /></div>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
