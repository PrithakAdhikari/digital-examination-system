import { useUserCounts } from "../../hooks/useAdminQueries.js";

export default function UserStatsCard() {
  const { data, isLoading, isError, error, refetch } = useUserCounts();

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Number of Users</h2>
          <p className="text-sm text-base-content/70">Number of Students/Teachers</p>
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
          <h2 className="card-title">Number of Users</h2>
          <p className="text-error">{error?.response?.data?.error ?? error?.message ?? "Failed to load"}</p>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const teachers = data?.teachers ?? 0;
  const students = data?.students ?? 0;

  return (
    <div className="glass-card card h-full shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="card-body p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-tight">Active Users</h2>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/30 group-hover:bg-primary/5 transition-colors duration-300">
            <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-1">Teachers</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-primary">{teachers}</span>
            </div>
          </div>
          
          <div className="p-4 rounded-2xl bg-base-200/50 border border-base-300/30 group-hover:bg-accent/5 transition-colors duration-300">
            <p className="text-xs font-bold text-base-content/40 uppercase tracking-widest mb-1">Students</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-accent">{students}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
