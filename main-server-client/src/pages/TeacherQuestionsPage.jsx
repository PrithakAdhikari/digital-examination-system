import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignedQuestionsToWrite } from "../hooks/useTeacherQueries.js";

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export default function TeacherQuestionsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useAssignedQuestionsToWrite();

  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card card">
        <div className="card-body">
          <h2 className="text-lg font-bold">Questions to write</h2>
          <p className="text-error">{error?.response?.data?.error ?? error?.message ?? "Failed to load assigned questions."}</p>
          <button type="button" className="btn btn-sm btn-outline w-fit" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-base-300/40 shadow-sm">
        <div className="mb-6 border-b border-base-300/40 pb-4">
          <h1 className="text-2xl font-bold tracking-tight">Questions to write</h1>
          <p className="text-sm text-base-content/55 mt-1">You have been assigned these questions</p>
        </div>

        <div className="overflow-x-auto">
          <table className="table table-md">
            <thead>
              <tr>
                <th>Subject ID</th>
                <th>Subject</th>
                <th>Full Marks / Pass Marks</th>
                <th>Examinations</th>
                <th>Exam Start Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-base-content/50 font-medium">
                    No assigned subjects found.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.subject_id} className="hover">
                    <td className="font-mono text-xs">{row.subject_id}</td>
                    <td className="font-semibold">{row.subject_name_txt}</td>
                    <td>{row.full_marks} / {row.pass_marks}</td>
                    <td>{row.exam_name_txt}</td>
                    <td>{formatDate(row.exam_startTime_ts)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary rounded-xl"
                        onClick={() =>
                          navigate(`/teacher/questions/create/${row.subject_id}`, {
                            state: { assignedSubject: row },
                          })
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create Question
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
