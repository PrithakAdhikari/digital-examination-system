import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAllSubmissions } from "../hooks/useTeacherQueries";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function TeacherAnswersPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAllSubmissions();

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card card border border-error/20 bg-error/5 animate-fade-in">
        <div className="card-body">
          <h2 className="text-lg font-bold flex items-center gap-2 text-error">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error loading submissions
          </h2>
          <p className="text-sm opacity-70 font-medium">
            {error?.response?.data?.error ?? error?.message ?? "Failed to load submissions list."}
          </p>
          <div className="card-actions mt-4">
            <button type="button" className="btn btn-sm btn-outline btn-error rounded-xl" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 px-2 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Student Submissions</h1>
          <p className="text-sm md:text-base text-base-content/50 mt-1 font-medium">Review and grade answer scripts assigned to you.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 md:p-8 border border-base-300/40 shadow-sm overflow-hidden bg-base-100">
        <div className="overflow-x-auto">
          <table className="table table-md w-full">
            <thead>
              <tr className="text-base-content/60 border-b border-base-300/40">
                <th className="font-bold uppercase tracking-wider text-[10px]">Examination & Batch</th>
                <th className="font-bold uppercase tracking-wider text-[10px]">Subject</th>
                <th className="font-bold uppercase tracking-wider text-[10px] text-center">Answers</th>
                <th className="font-bold uppercase tracking-wider text-[10px] text-right">Last Submission</th>
                <th className="font-bold uppercase tracking-wider text-[10px] text-center items-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 opacity-40">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l5 5v11a2 2 0 01-2 2z" />
                      </svg>
                      <span className="font-bold tracking-tight">No submissions to check</span>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-base-200/50 transition-colors border-b border-base-300/20 last:border-0 group">
                    <td>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">{row.exam_name_txt}</span>
                        <span className="text-[10px] uppercase font-black text-primary tracking-widest">{row.exam_batch_year} Batch</span>
                      </div>
                    </td>
                    <td>
                      <span className="font-semibold text-sm">{row.subject_name_txt}</span>
                    </td>
                    <td className="text-center">
                      <div className="badge badge-outline border-base-300 text-xs font-bold px-3 py-3">
                        {row.answers_count}
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="font-mono text-xs opacity-60 font-medium">
                        {formatDate(row.last_submitted_at)}
                      </span>
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-xl px-4 font-bold"
                        onClick={() => navigate(`/teacher/grading/${row.subject_fk_id}/${row.student_user_fk_id}`)}
                      >
                        Check Answers
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
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
