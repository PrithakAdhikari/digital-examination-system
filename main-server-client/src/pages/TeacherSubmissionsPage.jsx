import React, { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStudentsToGrade } from "../hooks/useTeacherQueries";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function TeacherSubmissionsPage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useStudentsToGrade(subjectId);

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <span className="loading loading-spinner loading-lg text-primary opacity-40 shadow-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card card border-error overflow-hidden animate-fade-in max-w-2xl mx-auto mt-12 bg-base-100">
        <div className="card-body p-10 items-center text-center">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-6 text-error">
             <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h2 className="card-title text-2xl font-black tracking-tight">System Outage</h2>
          <p className="text-base-content/60 font-medium">Failed to establish connection for subject checking: {error?.message}</p>
          <div className="card-actions mt-8 gap-4 w-full">
            <Link to="/teacher/answers" className="btn btn-outline rounded-2xl flex-1 uppercase font-black text-[10px] tracking-widest">Return Home</Link>
            <button className="btn btn-error rounded-2xl flex-1 uppercase font-black text-[10px] tracking-widest text-error-content" onClick={() => refetch()}>Force Refresh</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-8 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
           <Link to="/teacher/answers" className="btn btn-circle btn-ghost bg-base-200/50 hover:bg-base-200 border border-base-300/30">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           </Link>
           <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-1 leading-none">Submissions Hub</span>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                 Checking Student Pool
              </h1>
           </div>
        </div>
      </div>

      <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-base-300/40 shadow-2xl bg-base-100 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
           <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
        </div>

        <div className="overflow-x-auto relative z-10">
          <table className="table table-md w-full border-separate border-spacing-y-4">
            <thead>
              <tr className="text-base-content/40 border-none font-black uppercase tracking-[0.2em] text-[10px]">
                <th className="pl-6">Candidate Identifier</th>
                <th>Participation Stat</th>
                <th className="text-center">Response Count</th>
                <th className="text-right">Capture Stamp</th>
                <th className="text-center">Operation</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-20">
                     <div className="flex flex-col items-center gap-4 opacity-30 grayscale">
                        <div className="w-20 h-20 rounded-full border-4 border-dashed border-base-content/50 flex items-center justify-center animate-spin-slow">
                           <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        </div>
                        <span className="font-black text-xs uppercase tracking-widest leading-none">Empty Assignment Pool</span>
                     </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="bg-base-200/20 hover:bg-base-200/50 transition-all rounded-2xl group shadow-sm">
                    <td className="pl-6 py-6 rounded-l-3xl">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-neutral text-neutral-content flex items-center justify-center font-black text-xs shadow-inner">
                             {row.firstname_txt?.charAt(0) || "S"}{row.lastname_txt?.charAt(0) || idx + 1}
                          </div>
                          <div className="flex flex-col">
                             <span className="font-black tracking-tight text-sm uppercase">Anonymized Candidate</span>
                             <span className="text-[10px] font-mono opacity-40 font-bold uppercase">ID: {row.student_user_fk_id}</span>
                          </div>
                       </div>
                    </td>
                    <td>
                       <span className={`badge badge-sm uppercase font-black text-[9px] tracking-widest px-3 py-3 border-none shadow-sm ${row.answers_count > 0 ? "bg-success/20 text-success" : "bg-warning/20 text-warning animate-pulse"}`}>
                          {row.answers_count > 0 ? "Submitted" : "Pending Sync"}
                       </span>
                    </td>
                    <td className="text-center font-black text-lg opacity-40 px-3">
                       {row.answers_count}
                    </td>
                    <td className="text-right pr-6 py-6 font-mono text-xs opacity-50 font-black tracking-tighter">
                       {formatDate(row.last_submitted_at)}
                    </td>
                    <td className="text-center pr-6 py-6 rounded-r-3xl">
                       {row.answers_count > 0 ? (
                         <button
                           className="btn btn-sm btn-primary rounded-xl px-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
                           onClick={() => navigate(`/teacher/grading/${subjectId}/${row.student_user_fk_id}`)}
                         >
                           Inspect
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                         </button>
                       ) : (
                         <div className="tooltip tooltip-left" data-tip="Awaiting student data sync">
                           <button className="btn btn-sm btn-disabled grayscale opacity-30 rounded-xl px-1 font-black uppercase text-[10px]">Inactive</button>
                         </div>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
