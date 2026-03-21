import { useTeacherUpcomingExaminations } from "../../../hooks/useTeacherQueries.js";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function roleLabel(assignedAs) {
  if (assignedAs === "SETTER") return "Setter";
  if (assignedAs === "CHECKER") return "Checker";
  if (assignedAs === "SETTER_AND_CHECKER") return "Setter + Checker";
  return "Assigned";
}

export default function TeacherUpcomingExaminationsCard() {
  const { data, isLoading, isError, error, refetch } = useTeacherUpcomingExaminations();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl h-full">
        <div className="card-body">
          <h2 className="card-title">Upcoming Examinations</h2>
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card bg-base-100 shadow-xl h-full">
        <div className="card-body">
          <h2 className="card-title">Upcoming Examinations</h2>
          <p className="text-error">{error?.response?.data?.error ?? error?.message ?? "Failed to load"}</p>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="glass-card card h-full shadow-sm hover:shadow-md transition-all duration-300">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight">Upcoming Details</h2>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-11 9h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v11a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[160px] opacity-40 italic">
            <p className="text-sm font-medium">No upcoming assigned examinations.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {list.map((item) => (
              <div key={item.examId} className="rounded-xl border border-base-300/30 bg-base-200/20 p-3">
                <p className="text-sm font-bold truncate">{item.examName}</p>
                <p className="text-[11px] opacity-60 mt-1">{formatDate(item.examStartTime)}</p>
                <span className="inline-flex mt-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-primary/10 text-primary">
                  {roleLabel(item.assignedAs)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
