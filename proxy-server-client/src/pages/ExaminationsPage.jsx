import { useExaminations, useSelectExamination, useRemoveExamination, useRegistrationStatus } from "../hooks/useProxyQueries.js";
import { toast } from "react-hot-toast";
import { AlertCircle, Trash2, CheckCircle2, Clock } from "lucide-react";

export default function ExaminationsPage() {
  const { data: statusData, refetch: refetchStatus } = useRegistrationStatus();
  const { data, isLoading, error, refetch } = useExaminations();
  const selectExamMutation = useSelectExamination();
  const removeExamMutation = useRemoveExamination();

  const selectedId = statusData?.selected_examination_id;

  const handleSelect = async (exam) => {
    try {
      await selectExamMutation.mutateAsync({ 
          examId: exam.id, 
          startTime: exam.exam_startTime_ts 
      });
      toast.success("Examination selected successfully.");
      refetch();
      refetchStatus();
    } catch (err) {
      toast.error("Failed to select examination: " + (err.response?.data?.error || err.message));
    }
  };

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to remove the current ongoing examination? This will stop all fetching processes and clear local cache.")) {
      return;
    }

    try {
      await removeExamMutation.mutateAsync();
      toast.success("Examination removed.");
      refetch();
      refetchStatus();
    } catch (err) {
      toast.error("Failed to remove: " + (err.response?.data?.error || err.message));
    }
  };

  if (isLoading) return <div className="flex justify-center p-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (error) return <div className="alert alert-error mx-auto max-w-2xl mt-10">Error: {error.message}</div>;

  const exams = data?.data || [];

  const ongoingExam = exams.find(e => String(e.id) === String(selectedId));

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Ongoing Examination Section */}
      {ongoingExam && (
        <div className="card bg-primary/5 border border-primary/20 shadow-2xl rounded-[2rem] overflow-hidden">
          <div className="card-body p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-primary-content shadow-lg shadow-primary/20">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Currently Active</span>
                  <div className="badge badge-primary badge-sm font-black rounded-lg">LIVE</div>
                </div>
                <h2 className="text-3xl font-black tracking-tight">{ongoingExam.exam_name_txt}</h2>
                <div className="flex items-center gap-4 text-xs font-bold opacity-60">
                   <div className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Starts: {new Date(ongoingExam.exam_startTime_ts).toLocaleString()}</div>
                   <div className="w-1 h-1 rounded-full bg-base-content/20"></div>
                   <div>ID: {ongoingExam.id}</div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleRemove}
              disabled={removeExamMutation.isPending}
              className="btn btn-error btn-lg rounded-2xl px-10 font-bold group shadow-lg shadow-error/10 border-none hover:scale-105 transition-all"
            >
              {removeExamMutation.isPending ? (
                <span className="loading loading-spinner"></span>
              ) : (
                <>
                  <Trash2 className="w-5 h-5 group-hover:shake" />
                  Remove Exam
                </>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Available Examinations</h1>
            <p className="text-base-content/60 mt-1">Exams assigned to this center by the Main Server.</p>
          </div>
          <button onClick={() => refetch()} className="btn btn-ghost btn-sm bg-base-300/50">
            Refresh List
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden">
            <div className="card-body items-center text-center py-20">
              <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center mb-4">
                <AlertCircle className="w-10 h-10 opacity-20" />
              </div>
              <h2 className="card-title opacity-40">No examinations found</h2>
              <p className="opacity-40">Ensure this center is assigned to exams on the Main Server.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam) => {
              const isActive = String(exam.id) === String(selectedId);
              return (
                <div key={exam.id} className={`card bg-base-100 shadow-xl border transition-all duration-300 group ${isActive ? 'border-primary ring-2 ring-primary/10 scale-[0.98]' : 'border-base-300 hover:border-primary/50'}`}>
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-2">
                      <div className={`badge ${isActive ? 'badge-primary' : 'badge-primary badge-outline'} text-[10px] font-bold`}>EXAM ID: {exam.id}</div>
                      <div className="text-[10px] opacity-40 font-mono">
                        {new Date(exam.createdAt_ts).toLocaleDateString()}
                      </div>
                    </div>
                    <h2 className={`card-title text-xl font-bold group-hover:text-primary transition-colors ${isActive ? 'text-primary' : ''}`}>{exam.exam_name_txt}</h2>
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2 text-xs opacity-60">
                        <Clock className="h-4 w-4" />
                        <span>Starts: {new Date(exam.exam_startTime_ts).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-6">
                      <button 
                        onClick={() => handleSelect(exam)}
                        disabled={selectExamMutation.isPending || isActive}
                        className={`btn btn-sm rounded-lg px-6 font-bold ${isActive ? 'btn-success btn-ghost no-animation' : 'btn-primary'}`}
                      >
                        {selectExamMutation.isPending ? "Selecting..." : isActive ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Selected
                          </span>
                        ) : "Select Exam"}
                      </button>
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
