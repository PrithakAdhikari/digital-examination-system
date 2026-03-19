import { useState } from "react";
import { useCenters } from "../../hooks/useAdminQueries.js";

function formatDate(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  } catch {
    return value;
  }
}

export default function CentersList({ onEdit, onCreateNew, onDelete }) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useCenters({ page, limit: 10 });
  const list = data?.data ?? [];
  const pagination = data?.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 0 };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 bg-base-100/50 rounded-2xl glass-card">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <span className="text-sm font-bold opacity-40 tracking-widest uppercase">Fetching Centers...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="alert alert-error glass-card border-error/20 shadow-xl animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="font-bold">{error?.response?.data?.error ?? error?.message ?? "Failed to load centers"}</span>
      </div>
    );
  }

  return (
    <div className="glass-card shadow-sm border border-base-300/30 overflow-hidden animate-fade-in mb-8">
      <div className="p-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 gap-4 border-b border-base-300/30 bg-base-200/20">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Examination Centers</h2>
            <p className="text-sm text-base-content/50 font-medium mt-1">Manage remote centers and whitelisting configurations</p>
          </div>
          <button 
            type="button" 
            className="btn btn-primary rounded-xl px-6 shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105" 
            onClick={onCreateNew}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Provision Center
          </button>
        </div>
        
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto px-6 pb-6">
          <table className="table table-md w-full border-separate border-spacing-y-3">
            <thead>
              <tr className="text-base-content/40 uppercase tracking-widest text-[10px] font-black">
                <th className="bg-transparent border-none pl-4">ID</th>
                <th className="bg-transparent border-none min-w-[200px]">Center Name</th>
                <th className="bg-transparent border-none">Whitelist IP</th>
                <th className="bg-transparent border-none">Whitelist URL</th>
                <th className="bg-transparent border-none">Created On</th>
                <th className="bg-transparent border-none text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 bg-base-100/50 rounded-2xl border border-base-300/30 shadow-inner">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <span className="text-lg font-bold">No centers provisioned yet.</span>
                      <button className="btn btn-primary btn-sm rounded-lg" onClick={onCreateNew}>Add Your First Center</button>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((row) => (
                  <tr key={row.id} className="group/tr transition-all duration-300">
                    <td className="bg-base-100 group-hover/tr:bg-base-200/50 border-y border-l border-base-300/30 rounded-l-2xl pl-4 py-6">
                      <span className="text-xs font-black opacity-20 tracking-tighter">#{row.id}</span>
                    </td>
                    <td className="bg-base-100 group-hover/tr:bg-base-200/50 border-y border-base-300/30">
                      <div className="flex flex-col">
                        <span className="font-bold text-base group-hover/tr:text-primary transition-colors">{row.center_name_txt}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${row.secret_key_hash ? 'bg-success' : 'bg-amber-500'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${row.secret_key_hash ? 'opacity-40' : 'text-amber-600 dark:text-amber-400 opacity-100'}`}>
                            {row.secret_key_hash ? 'Active Node' : 'Provisioned'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="bg-base-100 group-hover/tr:bg-base-200/50 border-y border-base-300/30">
                      <code className="text-[10px] font-black border border-base-300 bg-base-200 px-2 py-1 rounded-md opacity-70">
                        {row.whitelist_ip || "ANY"}
                      </code>
                    </td>
                    <td className="bg-base-100 group-hover/tr:bg-base-200/50 border-y border-base-300/30">
                      <span className="text-[11px] font-bold opacity-60">
                        {row.whitelist_url || "ANY"}
                      </span>
                    </td>
                    <td className="bg-base-100 group-hover/tr:bg-base-200/50 border-y border-base-300/30">
                      <span className="text-xs font-semibold text-base-content/70">
                        {formatDate(row.createdAt_ts)}
                      </span>
                    </td>
                    <td className="bg-base-100 group-hover/tr:bg-base-200/50 border-y border-r border-base-300/30 rounded-r-2xl pr-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn btn-ghost btn-circle btn-sm hover:bg-primary/20 hover:text-primary transition-all duration-200"
                          onClick={() => onEdit(row)}
                          title="Edit Center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-circle btn-sm hover:bg-error/20 hover:text-error transition-all duration-200"
                          onClick={() => onDelete(row.id, row.center_name_txt)}
                          title="Delete Center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Placeholder (similar to ExaminationsList) */}
        <div className="lg:hidden px-6 pb-8 space-y-4">
          {list.map((row) => (
             <div key={row.id} className="p-5 rounded-2xl bg-base-100 border border-base-300/30 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black opacity-20 tracking-tighter mb-1">#{row.id}</span>
                    <span className="font-bold text-lg leading-tight">{row.center_name_txt}</span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${row.secret_key_hash ? 'bg-success' : 'bg-amber-500'}`}></div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${row.secret_key_hash ? 'opacity-40' : 'text-amber-600 dark:text-amber-400 opacity-100'}`}>
                        {row.secret_key_hash ? 'Active Node' : 'Provisioned'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-ghost btn-circle btn-sm bg-base-200/50" onClick={() => onEdit(row)}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[11px] font-bold">
                    <div className="p-3 rounded-xl bg-base-200/30">
                        <p className="opacity-30 mb-1 font-black uppercase text-[9px]">IP</p>
                        {row.whitelist_ip || "ANY"}
                    </div>
                    <div className="p-3 rounded-xl bg-base-200/30">
                        <p className="opacity-30 mb-1 font-black uppercase text-[9px]">Date</p>
                        {formatDate(row.createdAt_ts)}
                    </div>
                </div>
             </div>
          ))}
        </div>
        
        {pagination.totalPages > 1 && (
          <div className="p-8 border-t border-base-300/30 bg-base-200/10">
            <div className="flex justify-center">
              <div className="join glass-effect border border-base-300/30 shadow-sm p-1">
                <button
                  type="button"
                  className="join-item btn btn-sm btn-ghost rounded-lg font-bold"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="join-item btn btn-sm btn-ghost px-6 no-animation font-black text-xs">
                  {pagination.page} <span className="mx-2 opacity-30">/</span> {pagination.totalPages}
                </div>
                <button
                  type="button"
                  className="join-item btn btn-sm btn-ghost rounded-lg font-bold"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
