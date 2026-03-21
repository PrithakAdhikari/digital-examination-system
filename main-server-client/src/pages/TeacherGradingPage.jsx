import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useStudentSubmission, useAssignQuestionMark } from "../hooks/useTeacherQueries";
import { toast } from "react-hot-toast";

const TeacherGradingPage = () => {
  const { subjectId, studentId } = useParams();
  const { data: submission, isLoading, isError, error } = useStudentSubmission(subjectId, studentId);
  const assignMarkMutation = useAssignQuestionMark();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [marks, setMarks] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  // Initialize marks and feedbacks from submission data
  useEffect(() => {
    if (submission) {
      const initialMarks = {};
      const initialFeedbacks = {};
      submission.forEach((q) => {
        if (q.marks_obtained !== null) initialMarks[q.answer_id] = q.marks_obtained;
        if (q.feedback) initialFeedbacks[q.answer_id] = q.feedback;
      });
      setMarks(initialMarks);
      setFeedbacks(initialFeedbacks);
    }
  }, [submission]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-600 min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Error loading submission</p>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error.message}</p>
        <Link to="/teacher/answers" className="text-primary-600 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  if (!submission || submission.length === 0) {
    return (
      <div className="p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">No questions found in this submission</p>
        <Link to="/teacher/answers" className="mt-4 text-primary-600 hover:underline">
          Back to list
        </Link>
      </div>
    );
  }

  const currentQuestion = submission[currentIndex];

  const handleSave = () => {
    const answerId = currentQuestion.answer_id;
    const marksObtained = marks[answerId];
    const feedback = feedbacks[answerId] || "";

    if (marksObtained === undefined || marksObtained === null) {
      toast.error("Please enter marks before saving.");
      return;
    }

    assignMarkMutation.mutate(
      {
        answer_id: answerId,
        marks_obtained: Number(marksObtained),
        feedback: feedback,
      },
      {
        onSuccess: () => {
          toast.success("Marks saved successfully!");
        },
        onError: (err) => {
          toast.error("Failed to save marks: " + err.message);
        },
      }
    );
  };

  const isLastQuestion = currentIndex === submission.length - 1;

  const handleNext = () => {
    if (!isLastQuestion) setCurrentIndex(currentIndex + 1);
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <Link
          to={`/teacher/answers`}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Exit Marking
        </Link>

        <div className="text-center">
          <span className="text-xs uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wide">Grading Student Submission</span>
          <div className="flex items-center space-x-2 text-gray-400 text-xs mt-1 justify-center">
            <span>#{submission[0]?.exam_name_txt}</span>
            <span>•</span>
            <span>{submission[0]?.subject_name_txt}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold px-3 py-1.5 rounded-md text-sm ring-1 ring-primary-200 dark:ring-primary-800">
            Question {currentIndex + 1} / {submission.length}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex">
        {/* Navigation Sidebar */}
        <aside className="w-20 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-6 space-y-4 overflow-y-auto overflow-hidden">
          {submission.map((q, idx) => {
            const isCompleted = marks[q.answer_id] !== undefined && marks[q.answer_id] !== null;
            return (
              <button
                key={q.question_id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all transform ${
                  currentIndex === idx
                    ? "bg-primary-600 text-white scale-110 shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/50"
                    : isCompleted
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-650"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Question and Answer Pane */}
          <section className="flex-1 overflow-y-auto p-8 space-y-8">
            {/* Question Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                  {currentQuestion.question_type}
                </span>
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Question</span>
              </div>
              <p className="text-xl font-medium text-gray-900 dark:text-gray-100 leading-relaxed">{currentQuestion.question_txt}</p>

              {currentQuestion.question_type === "MCQ" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  {[1, 2, 3, 4].map((opt) => (
                    <div
                      key={opt}
                      className={`p-4 rounded-lg border flex items-center shadow-sm ${
                        currentQuestion.correct_option === opt
                          ? "border-green-500 bg-green-50/50 dark:bg-green-900/20 dark:border-green-800"
                          : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750"
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm font-bold ${
                          currentQuestion.correct_option === opt
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {String.fromCharCode(64 + opt)}
                      </span>
                      <span
                        className={`text-sm ${
                          currentQuestion.correct_option === opt
                            ? "font-bold text-green-700 dark:text-green-400"
                            : "text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {currentQuestion[`option${opt}`]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student Answer Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700 min-h-[300px]">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Student Response</h3>
              </div>

              {currentQuestion.stud_answer ? (
                <div className="prose dark:prose-invert max-w-none">
                  {currentQuestion.question_type === "MCQ" ? (
                    <div className="flex items-center space-x-4">
                      <div className="text-lg font-bold p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        Option: {String.fromCharCode(64 + Number(currentQuestion.stud_answer.selected_option))}
                      </div>
                      {Number(currentQuestion.stud_answer.selected_option) === currentQuestion.correct_option ? (
                        <span className="flex items-center text-green-600 dark:text-green-400 font-bold">
                          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          Correct Answer
                        </span>
                      ) : (
                        <span className="flex items-center text-red-600 dark:text-red-400 font-bold">
                          <svg className="w-6 h-6 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Incorrect Answer
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="text-lg text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed italic bg-gray-50/50 dark:bg-gray-900/20 p-6 rounded-lg border border-gray-100 dark:border-gray-700 border-dashed">
                      {currentQuestion.stud_answer.answer_txt}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400 dark:text-gray-500 italic">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Question was left unanswered.
                </div>
              )}
            </div>
          </section>

          {/* Marking Pane */}
          <aside className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col z-10 shadow-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Evaluation
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Mark Assignment */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-750 p-4 rounded-lg">
                  <span className="text-sm font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Question Weight</span>
                  <span className="text-lg font-black text-primary-700 dark:text-primary-400">{currentQuestion.full_marks} Marks</span>
                </div>

                <div className="p-1">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Awarded Marks</label>
                  <div className="relative">
                    <input
                      type="number"
                      max={currentQuestion.full_marks || 0}
                      min={0}
                      className="block w-full px-4 py-4 text-xl font-black text-center border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-primary-500 focus:border-primary-500 dark:text-white transition-all hover:bg-white dark:hover:bg-gray-850"
                      value={marks[currentQuestion.answer_id] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "" || (Number(val) >= 0 && Number(val) <= (currentQuestion.full_marks || 0))) {
                          setMarks({ ...marks, [currentQuestion.answer_id]: val });
                        } else if (Number(val) > (currentQuestion.full_marks || 0)) {
                          setMarks({ ...marks, [currentQuestion.answer_id]: currentQuestion.full_marks });
                        }
                      }}
                      placeholder="0.00"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold pointer-events-none">/ {currentQuestion.full_marks}</div>
                  </div>
                </div>
              </div>

              {/* Feedback Section */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Feedback for Student</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-primary-500 focus:border-primary-500 dark:text-white min-h-[200px] text-sm resize-none shadow-inner transition-colors hover:bg-white dark:hover:bg-gray-850"
                  placeholder="Provide constructive feedback for the student's answer..."
                  value={feedbacks[currentQuestion.answer_id] || ""}
                  onChange={(e) => setFeedbacks({ ...feedbacks, [currentQuestion.answer_id]: e.target.value })}
                />
              </div>
            </div>

            {/* Pane Controls */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
              <button
                onClick={handleSave}
                disabled={assignMarkMutation.isPending}
                className="w-full bg-primary-600 text-white rounded-xl py-4 font-black text-lg shadow-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 mb-4 flex items-center justify-center space-x-2"
              >
                {assignMarkMutation.isPending ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Save Points</span>
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  disabled={isLastQuestion}
                  className="flex items-center justify-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-750 disabled:opacity-50 transition-colors"
                >
                  Next
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default TeacherGradingPage;
