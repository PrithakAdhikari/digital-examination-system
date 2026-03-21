import { useState, useMemo } from "react";
import { 
  useExaminations, 
  useExamination, 
  useUsers, 
  useAnswersBySubject, 
  useAssignBulkStudents 
} from "../hooks/useAdminQueries.js";

export default function AnswersPage() {
  const [selectedExamId, setSelectedExamId] = useState(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Data Fetching
  const { data: examsData } = useExaminations({ limit: 100 });
  const { data: selectedExamData } = useExamination(selectedExamId, { enabled: !!selectedExamId });
  const { data: teachersData } = useUsers({ role: "TEACHER" });
  const { data: answersData, isLoading: loadingAnswers } = useAnswersBySubject(selectedSubjectId);
  const assignMutation = useAssignBulkStudents();

  const exams = examsData?.data ?? [];
  const subjects = selectedExamData?.subjects ?? [];
  const teachers = teachersData?.data ?? [];
  const answers = answersData ?? [];

  // Handlers
  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId) 
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === answers.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(answers.map(a => a.student_id));
    }
  };

  const handleSubmit = () => {
    if (!selectedSubjectId || !selectedTeacherId || selectedStudentIds.length === 0) return;

    assignMutation.mutate({
      subject_fk_id: selectedSubjectId,
      checker_user_fk_id: selectedTeacherId,
      student_user_fk_ids: selectedStudentIds
    }, {
      onSuccess: () => {
        setSelectedStudentIds([]);
        // Optional: Show success toast
      }
    });
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-base-content hover:text-primary transition-colors cursor-default">
          Answers
        </h1>
        <p className="text-sm font-medium text-base-content/50 uppercase tracking-[0.2em]">
          Manage checkers of Answers
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-[2rem] bg-base-100 border border-base-300/50 shadow-xl shadow-base-300/10">
        {/* Examination Select */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-base-content/30 tracking-widest ml-1">Examination</label>
          <div className="dropdown w-full">
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-outline border-base-300 w-full justify-between hover:bg-base-200 hover:border-primary/20 text-left font-bold h-14 rounded-2xl transition-all normal-case overflow-hidden bg-base-200/50"
            >
              <div className="flex items-center gap-2 truncate">
                {selectedExamId ? (
                  <>
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                      E
                    </div>
                    <span className="text-sm truncate">
                      {exams.find(e => e.id === selectedExamId)?.exam_name_txt}
                    </span>
                  </>
                ) : (
                  <span className="text-base-content/30 font-medium text-sm">Select Examination...</span>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[21] menu p-2 shadow-2xl bg-base-100 border border-base-300/50 rounded-2xl w-full mt-2 max-h-60 overflow-y-auto block animate-in fade-in zoom-in duration-200">
              {exams.map((exam) => (
                <li key={exam.id} className="mb-0.5">
                  <button
                    type="button"
                    className={`flex flex-col items-start p-3 rounded-xl transition-all ${
                      selectedExamId === exam.id 
                        ? "bg-primary/10 text-primary font-bold shadow-sm" 
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => {
                      setSelectedExamId(exam.id);
                      setSelectedSubjectId(null);
                      setSelectedStudentIds([]);
                      document.activeElement.blur();
                    }}
                  >
                    <span className="text-sm leading-tight">{exam.exam_name_txt}</span>
                    <span className="text-[9px] opacity-40 uppercase tracking-tighter">ID: {exam.id}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Subject Select */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-base-content/30 tracking-widest ml-1">Subject</label>
          <div className="dropdown w-full">
            <div 
              tabIndex={0} 
              role="button" 
              className={`btn btn-outline border-base-300 w-full justify-between hover:bg-base-200 hover:border-primary/20 text-left font-bold h-14 rounded-2xl transition-all normal-case overflow-hidden bg-base-200/50 ${!selectedExamId ? "btn-disabled opacity-30 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2 truncate">
                {selectedSubjectId ? (
                  <>
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                      S
                    </div>
                    <span className="text-sm truncate">
                      {subjects.find(s => s.id === selectedSubjectId)?.subject_name_txt}
                    </span>
                  </>
                ) : (
                  <span className="text-base-content/30 font-medium text-sm">Select Subject...</span>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[21] menu p-2 shadow-2xl bg-base-100 border border-base-300/50 rounded-2xl w-full mt-2 max-h-60 overflow-y-auto block animate-in fade-in zoom-in duration-200">
              {subjects.length === 0 ? (
                <li className="p-4 text-center opacity-40 text-[10px] font-black uppercase tracking-widest">No Subjects found</li>
              ) : (
                subjects.map((sub) => (
                  <li key={sub.id} className="mb-0.5">
                    <button
                      type="button"
                      className={`flex flex-col items-start p-3 rounded-xl transition-all ${
                        selectedSubjectId === sub.id 
                          ? "bg-primary/10 text-primary font-bold shadow-sm" 
                          : "hover:bg-base-200"
                      }`}
                      onClick={() => {
                        setSelectedSubjectId(sub.id);
                        setSelectedStudentIds([]);
                        document.activeElement.blur();
                      }}
                    >
                      <span className="text-sm leading-tight">{sub.subject_name_txt}</span>
                      <span className="text-[9px] opacity-40 uppercase tracking-tighter">ID: {sub.id}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Assign Teacher Select (Custom Dropdown for premium feel) */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-base-content/30 tracking-widest ml-1">Assign Teacher</label>
          <div className="dropdown w-full">
            <div 
              tabIndex={0} 
              role="button" 
              className="btn btn-outline border-base-300 w-full justify-between hover:bg-base-200 hover:border-primary/20 text-left font-bold h-14 rounded-2xl transition-all normal-case overflow-hidden bg-base-200/50"
            >
              <div className="flex items-center gap-2 truncate">
                {selectedTeacherId ? (
                  <>
                    <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">
                      {teachers.find(u => u.id === selectedTeacherId)?.firstname_txt?.[0]}
                    </div>
                    <span className="text-sm truncate">
                      {teachers.find(u => u.id === selectedTeacherId)?.firstname_txt} {teachers.find(u => u.id === selectedTeacherId)?.lastname_txt}
                    </span>
                  </>
                ) : (
                  <span className="text-base-content/30 font-medium text-sm">Choose Teacher...</span>
                )}
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <ul tabIndex={0} className="dropdown-content z-[20] menu p-2 shadow-2xl bg-base-100 border border-base-300/50 rounded-2xl w-full mt-2 max-h-60 overflow-y-auto block animate-in fade-in zoom-in duration-200">
              {teachers.map((u) => (
                <li key={u.id} className="mb-0.5">
                  <button
                    type="button"
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      selectedTeacherId === u.id 
                        ? "bg-primary/10 text-primary font-bold shadow-sm" 
                        : "hover:bg-base-200"
                    }`}
                    onClick={() => {
                      setSelectedTeacherId(u.id);
                      document.activeElement.blur();
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                        selectedTeacherId === u.id ? "bg-primary text-white" : "bg-base-300 shadow-inner"
                      }`}>
                        {u.firstname_txt?.[0]}
                      </div>
                      <div className="flex flex-col items-start translate-y-[1px]">
                        <span className="text-sm leading-tight">{u.firstname_txt} {u.lastname_txt}</span>
                        <span className="text-[9px] opacity-40 uppercase tracking-tighter">@{u.username}</span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Answers Table */}
      <div className="rounded-[2rem] bg-base-100 border border-base-300/50 shadow-2xl shadow-base-300/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-lg w-full">
            <thead className="bg-base-200/50 border-b border-base-300/50">
              <tr className="text-base-content/40 uppercase text-[10px] font-black tracking-widest h-16">
                <th className="pl-8">Answer ID / Student</th>
                <th>Date Submitted</th>
                <th>Assigned Answer Checker</th>
                <th className="pr-8 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span>Actions</span>
                    <input 
                      type="checkbox" 
                      className="checkbox checkbox-xs rounded-md"
                      checked={answers.length > 0 && selectedStudentIds.length === answers.length}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-base-300/10">
              {loadingAnswers ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center">
                    <span className="loading loading-spinner loading-lg text-primary/40"></span>
                  </td>
                </tr>
              ) : answers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center font-medium opacity-30 italic">
                    {selectedSubjectId ? "No student submissions found for this subject" : "Select an Examination and Subject to see answers"}
                  </td>
                </tr>
              ) : (
                answers.map((ans) => (
                  <tr key={ans.student_id} className="hover:bg-primary/5 transition-colors group">
                    <td className="pl-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-base-200 flex items-center justify-center text-xs font-black group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                          {ans.full_name?.[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm tracking-tight">{ans.full_name}</span>
                          <span className="text-[10px] opacity-40 uppercase tracking-widest font-bold">SID: {ans.student_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm font-medium opacity-60">
                      {ans.submitted_at ? new Date(ans.submitted_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : "N/A"}
                    </td>
                    <td>
                      {ans.checker_name ? (
                        <div className="badge badge-lg bg-success/10 text-success border-none font-bold text-xs h-8 px-4 py-0 rounded-xl">
                          {ans.checker_name}
                        </div>
                      ) : (
                        <div className="badge badge-lg bg-base-300 text-base-content/40 border-none font-bold text-xs h-8 px-4 py-0 rounded-xl">
                          Unassigned
                        </div>
                      )}
                    </td>
                    <td className="pr-8 text-center px-0">
                      <input 
                        type="checkbox" 
                        className="checkbox checkbox-primary rounded-xl transition-all hover:scale-110 active:scale-95" 
                        checked={selectedStudentIds.includes(ans.student_id)}
                        onChange={() => handleToggleStudent(ans.student_id)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex justify-end pr-4">
        <button 
          className="btn btn-primary btn-lg rounded-2xl shadow-xl shadow-primary/20 gap-3 px-10 h-16 normal-case font-black transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-30"
          disabled={!selectedTeacherId || selectedStudentIds.length === 0 || assignMutation.isPending}
          onClick={handleSubmit}
        >
          {assignMutation.isPending && <span className="loading loading-spinner loading-xs" />}
          Submit
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
