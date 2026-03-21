import { useTeacherTopStudents } from "../../../hooks/useTeacherQueries.js";

export default function TeacherTopStudentsCard() {
  const { data, isLoading, isError, error, refetch } = useTeacherTopStudents();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl h-full">
        <div className="card-body">
          <h2 className="card-title">Top 3 Users</h2>
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
          <h2 className="card-title">Top 3 Users</h2>
          <p className="text-error">{error?.response?.data?.error ?? error?.message ?? "Failed to load"}</p>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const list = Array.isArray(data) ? data.slice(0, 3) : [];

  return (
    <div className="glass-card card h-full shadow-sm hover:shadow-md transition-all duration-300">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight">Top 3 Users</h2>
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[160px] opacity-40">
            <p className="text-sm font-medium italic">No center ranking data yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((student, index) => (
              <div key={student?.id ?? index} className="flex items-center gap-4 group/item">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    index === 0
                      ? "bg-yellow-100 text-yellow-700 shadow-sm"
                      : index === 1
                        ? "bg-slate-100 text-slate-700"
                        : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate group-hover/item:text-primary transition-colors">
                    {student?.name ?? student?.username ?? "Anonymous User"}
                  </p>
                  <p className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Student</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-base-content/70">{student?.scoreOrCgpa ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
