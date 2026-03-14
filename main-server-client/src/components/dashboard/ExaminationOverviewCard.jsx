import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useExamSummary } from "../../hooks/useAdminQueries.js";

const COLORS = ["#36d399", "#fbbd23", "#9ca3af"];

export default function ExaminationOverviewCard() {
  const { data, isLoading, isError, error, refetch } = useExamSummary();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Examination Overview</h2>
          <div className="flex justify-center items-center h-48">
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
          <h2 className="card-title">Examination Overview</h2>
          <p className="text-error">{error?.response?.data?.error ?? error?.message ?? "Failed to load"}</p>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const ongoing = data?.ongoing ?? 0;
  const finished = data?.finished ?? 0;
  const total = data?.total ?? 0;
  const scheduled = Math.max(0, total - ongoing - finished);
  const chartData = [
    { name: "Finished", value: finished, fill: COLORS[0] },
    { name: "Ongoing", value: ongoing, fill: COLORS[1] },
    { name: "Scheduled", value: scheduled, fill: COLORS[2] },
  ].filter((d) => d.value > 0);

  return (
    <div className="glass-card card h-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight">Exam Status</h2>
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 opacity-40">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">No active data</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="h-44 w-full relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-2xl font-black">{total}</p>
                  <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Total</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={entry.name} fill={entry.fill} className="outline-none hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-2 w-full mt-4">
              {chartData.map((entry) => (
                <div key={entry.name} className="flex flex-col items-center p-2 rounded-xl bg-base-200/30 border border-base-300/20">
                  <span className="text-xs font-bold" style={{ color: entry.fill }}>{entry.value}</span>
                  <span className="text-[9px] uppercase font-bold opacity-40">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
