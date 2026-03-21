import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useStudentSubmission, useAssignQuestionMark } from "../hooks/useTeacherQueries";
import { toast } from "react-hot-toast";

export default function TeacherGradingPage() {
  const { subjectId, studentId } = useParams();
  const { data: submission, isLoading, isError, error, refetch } = useStudentSubmission(subjectId, studentId);
  const assignMarkMutation = useAssignQuestionMark();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [marks, setMarks] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  const questions = useMemo(() => (Array.isArray(submission) ? submission : []), [submission]);

  // Initial state setup
  useEffect(() => {
    if (questions.length > 0) {
      const initialMarks = {};
      const initialFeedbacks = {};
      questions.forEach((q) => {
        if (q.marks_obtained !== null) initialMarks[q.answer_id] = q.marks_obtained;
        if (q.feedback) initialFeedbacks[q.answer_id] = q.feedback;
      });
      setMarks(initialMarks);
      setFeedbacks(initialFeedbacks);
    }
  }, [questions]);

  // Calculate total marks obtained across all answers
  const totalObtained = useMemo(() => {
    return questions.reduce((acc, q) => {
      const m = marks[q.answer_id];
      return acc + (m ? Number(m) : 0);
    }, 0);
  }, [marks, questions]);

  const totalPossible = useMemo(() => {
    return questions.reduce((acc, q) => acc + (q.full_marks || 0), 0);
  }, [questions]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <span className="loading loading-spinner loading-lg text-primary" />
        <span className="text-sm font-bold opacity-60">Loading paper...</span>
      </div>
    );
  }

  if (isError || questions.length === 0) {
    return (
      <div className="p-12 text-center bg-base-100 rounded-3xl border border-base-300 mx-auto max-w-lg mt-12">
        <h2 className="text-xl font-bold mb-4">No content available</h2>
        <Link to="/teacher/answers" className="btn btn-primary rounded-xl">Go Back</Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  const handleSaveMarks = (newMarks, newFeedback = null) => {
    const answerId = currentQ.answer_id;
    const finalMarks = newMarks !== undefined ? newMarks : marks[answerId];
    const finalFeedback = newFeedback !== null ? newFeedback : (feedbacks[answerId] || "");

    if (finalMarks === "" || finalMarks === undefined || finalMarks === null) return;

    assignMarkMutation.mutate(
      {
        answer_id: answerId,
        marks_obtained: Number(finalMarks),
        feedback: finalFeedback,
      },
      {
        onSuccess: () => {
          toast.success("Saved");
        },
      }
    );
  };

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-140px)] gap-6 p-4 md:p-6 lg:p-8 overflow-hidden">
      {/* Top Header - Stats & Back */}
      <div className="flex flex-row justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <Link to="/teacher/answers" className="btn btn-ghost btn-outline btn-sm rounded-xl">
             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             Back
          </Link>
          <div className="hidden sm:block font-bold text-base-content/70">
            Full Marks: <span className="text-base-content">{totalPossible}</span>
          </div>
        </div>
        <div className="font-bold text-base-content/70">
          Obtained: <span className="text-primary">{totalObtained}</span>
        </div>
      </div>

      {/* Main Container - Two Columns */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
        
        {/* Left Card - Question */}
        <div className="flex-1 flex flex-col bg-base-100 rounded-3xl border border-base-300/60 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between px-8 py-6 border-b border-base-200">
            <h3 className="text-xl font-black uppercase tracking-widest text-base-content/40">Question</h3>
            <div className="text-2xl font-black text-base-content/20">[{currentQ.full_marks}]</div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="text-lg md:text-xl font-semibold leading-relaxed">
              Q.{currentIndex + 1}. {currentQ.question_txt}
            </div>

            {currentQ.question_type === "MCQ" && (
                <div className="grid grid-cols-1 gap-3 mt-8 max-w-md">
                    {[1, 2, 3, 4].map((num) => (
                        <div key={num} className={`flex items-center gap-3 p-4 rounded-2xl border ${currentQ.correct_option === num ? "bg-success/5 border-success/30 text-success" : "bg-base-200/30 border-base-300/30 opacity-60"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${currentQ.correct_option === num ? "bg-success text-success-content" : "bg-base-300"}`}>
                                {String.fromCharCode(64 + num)}
                            </div>
                            <span className="text-sm font-bold">{currentQ[`option${num}`]}</span>
                        </div>
                    ))}
                </div>
            )}
          </div>

          <div className="px-8 py-6 border-t border-base-200 flex items-center gap-4 bg-base-200/20">
            <span className="text-sm font-bold tracking-tight opacity-60 uppercase">Assigned Marks</span>
            <input 
              type="number"
              className="input input-bordered w-24 h-10 rounded-xl font-black text-center text-primary"
              max={currentQ.full_marks}
              min={0}
              value={marks[currentQ.answer_id] ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || (Number(v) >= 0 && Number(v) <= currentQ.full_marks)) {
                  setMarks({ ...marks, [currentQ.answer_id]: v });
                }
              }}
              onBlur={() => handleSaveMarks()}
            />
            <button 
              className="btn btn-sm btn-primary rounded-xl px-6 font-bold uppercase transition-all" 
              onClick={() => handleSaveMarks()}
              disabled={assignMarkMutation.isPending}
            >
              {assignMarkMutation.isPending ? "..." : "Save"}
            </button>
          </div>
        </div>

        {/* Right Card - Answer */}
        <div className="flex-1 flex flex-col bg-base-100 rounded-3xl border border-base-300/60 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-base-200">
            <h3 className="text-xl font-black uppercase tracking-widest text-base-content/40">Answer</h3>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            {currentQ.stud_answer ? (
                <div className="text-lg leading-relaxed whitespace-pre-wrap font-medium text-base-content/80">
                  {currentQ.question_type === "MCQ" ? (
                    <div className="flex items-center gap-3 p-6 bg-base-200 rounded-2xl w-fit">
                       <span className="text-xs font-bold opacity-40 uppercase tracking-widest">Picked</span>
                       <span className="text-4xl font-black">{String.fromCharCode(64 + Number(currentQ.stud_answer.selected_option))}</span>
                    </div>
                  ) : currentQ.stud_answer.answer_txt}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center opacity-20 italic">
                  No response provided
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Pagination Container */}
      <div className="flex items-center justify-center py-2 shrink-0">
        <div className="join bg-base-100 shadow-sm border border-base-300 rounded-2xl overflow-hidden p-1">
          <button 
            className="join-item btn btn-ghost btn-sm px-4" 
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
          </button>
          
          {questions.map((_, idx) => {
            const hasMarks = marks[questions[idx].answer_id] !== undefined && marks[questions[idx].answer_id] !== null && marks[questions[idx].answer_id] !== "";
            return (
              <button
                key={idx}
                className={`join-item btn btn-sm px-4 border-none ${currentIndex === idx ? "btn-primary" : hasMarks ? "bg-success/20 text-success" : "bg-transparent opacity-40"}`}
                onClick={() => setCurrentIndex(idx)}
              >
                {idx + 1}
              </button>
            );
          })}

          <button 
            className="join-item btn btn-ghost btn-sm px-4" 
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
