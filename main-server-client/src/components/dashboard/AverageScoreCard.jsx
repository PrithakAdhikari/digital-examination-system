import { useExamAverageScores } from "../../hooks/useAdminQueries.js";

export default function AverageScoreCard() {
  const { data, isLoading, isError, error, refetch } = useExamAverageScores();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Average Score per Exam</h2>
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Average Score per Exam</h2>
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
    <div className="glass-card card shadow-sm hover:shadow-md transition-all duration-300">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight text-nowrap">Average Performance</h2>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        
        {list.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[160px] opacity-40 italic">
            <p className="text-sm font-medium">Waiting for results...</p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar max-h-64">
            <table className="table table-md w-full border-separate border-spacing-y-2">
              <thead className="bg-base-200/40 sticky top-0 z-10">
                <tr>
                  <th className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest opacity-40">Examination</th>
                  <th className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest opacity-40 text-right">Avg Score</th>
                </tr>
              </thead>
              <tbody>
                {list.map((row, i) => (
                  <tr key={row?.examinationId ?? i} className="group/tr transition-colors duration-200">
                    <td className="bg-base-200/20 border-none rounded-l-xl p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold truncate max-w-[200px] group-hover/tr:text-primary transition-colors">{row?.examinationName ?? "Internal Assessment"}</span>
                        <span className="text-[10px] opacity-40 font-medium">Session 2024</span>
                      </div>
                    </td>
                    <td className="bg-base-200/20 border-none rounded-r-xl p-4 text-right">
                      <span className="text-sm font-black text-base-content/70">{row?.averageScore ?? "0.0"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
