import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAssignedQuestionsToWrite } from "../hooks/useTeacherQueries.js";
import { useCreateTeacherQuestionPaper } from "../hooks/useTeacherQuestionMutations.js";
import { useDraftPersistence } from "../hooks/useDraftPersistence.js";

function createEmptyQuestion() {
  return {
    localId: `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    question_txt: "",
    full_marks: "",
    question_type: "SHORT",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_option: "",
  };
}

function resolveDefaultBatchYear(assignedSubject) {
  const raw = assignedSubject?.exam_startTime_ts;
  if (!raw) return String(new Date().getFullYear());
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(new Date().getFullYear());
  return String(date.getFullYear());
}

export default function TeacherQuestionCreatePage() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const createMutation = useCreateTeacherQuestionPaper();
  const { data: assignedList } = useAssignedQuestionsToWrite();
  const assignedFromState = location.state?.assignedSubject ?? null;

  const assignedSubject = useMemo(() => {
    if (assignedFromState && String(assignedFromState.subject_id) === String(subjectId)) {
      return assignedFromState;
    }
    const rows = Array.isArray(assignedList) ? assignedList : [];
    return rows.find((row) => String(row.subject_id) === String(subjectId)) ?? null;
  }, [assignedFromState, assignedList, subjectId]);

  const initialDraft = useMemo(
    () => ({
      exam_batch_year: resolveDefaultBatchYear(assignedSubject),
      questions: [createEmptyQuestion()],
    }),
    [assignedSubject]
  );

  const draftKey = `teacher-question-draft-${subjectId}`;
  const { value: draft, setValue: setDraft, clearDraft } = useDraftPersistence(draftKey, initialDraft);
  const [formError, setFormError] = useState("");

  const questions = Array.isArray(draft?.questions) && draft.questions.length > 0 ? draft.questions : [createEmptyQuestion()];

  const updateDraft = (updater) => {
    setDraft((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      return next;
    });
  };

  const updateQuestion = (index, field, value) => {
    updateDraft((prev) => {
      const nextQuestions = [...(prev?.questions ?? [])];
      const current = { ...nextQuestions[index] };
      current[field] = value;

      if (field === "question_type" && value !== "MCQ") {
        current.option1 = "";
        current.option2 = "";
        current.option3 = "";
        current.option4 = "";
        current.correct_option = "";
      }

      nextQuestions[index] = current;
      return { ...prev, questions: nextQuestions };
    });
  };

  const addQuestion = () => {
    updateDraft((prev) => ({
      ...prev,
      questions: [...(prev?.questions ?? []), createEmptyQuestion()],
    }));
  };

  const removeQuestion = (index) => {
    updateDraft((prev) => {
      const next = [...(prev?.questions ?? [])];
      next.splice(index, 1);
      return {
        ...prev,
        questions: next.length > 0 ? next : [createEmptyQuestion()],
      };
    });
  };

  const validate = () => {
    if (!draft?.exam_batch_year?.trim()) {
      return "Batch year is required.";
    }

    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];
      if (!q.question_txt?.trim()) {
        return `Question ${i + 1}: Question text is required.`;
      }
      if (!q.full_marks || Number(q.full_marks) <= 0) {
        return `Question ${i + 1}: Full marks must be greater than 0.`;
      }

      if (q.question_type === "MCQ") {
        if (!q.option1?.trim() || !q.option2?.trim() || !q.option3?.trim() || !q.option4?.trim()) {
          return `Question ${i + 1}: All 4 options are required for MCQ.`;
        }
        if (!["1", "2", "3", "4"].includes(String(q.correct_option))) {
          return `Question ${i + 1}: Select a correct option for MCQ.`;
        }
      }
    }

    return "";
  };

  const handleSubmit = () => {
    setFormError("");
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }

    const payload = {
      subject_fk_id: Number(subjectId),
      exam_batch_year: draft.exam_batch_year,
      paper_checkers_list: null,
      questions: questions.map((q) => ({
        question_txt: q.question_txt.trim(),
        question_type: q.question_type,
        full_marks: Number(q.full_marks),
        option1: q.question_type === "MCQ" ? q.option1.trim() : null,
        option2: q.question_type === "MCQ" ? q.option2.trim() : null,
        option3: q.question_type === "MCQ" ? q.option3.trim() : null,
        option4: q.question_type === "MCQ" ? q.option4.trim() : null,
        correct_option: q.question_type === "MCQ" ? Number(q.correct_option) : null,
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        clearDraft();
        navigate("/teacher/questions");
      },
      onError: (e) => {
        setFormError(e?.response?.data?.error ?? e?.message ?? "Failed to submit questions.");
      },
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <button type="button" className="btn btn-ghost btn-circle" onClick={() => navigate("/teacher/questions")}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Question</h1>
          <p className="text-sm text-base-content/55">This question will be stored locally until you submit it.</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6 border border-base-300/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-4">
          <div className="md:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/50">Subject</label>
            <p className="text-sm font-semibold mt-1">{assignedSubject?.subject_name_txt ?? `Subject #${subjectId}`}</p>
          </div>
          <div>
            <label className="label-text text-xs font-bold uppercase tracking-wider text-base-content/50">Exam Batch Year</label>
            <input
              type="text"
              className="input input-bordered w-full rounded-xl mt-1"
              value={draft?.exam_batch_year ?? ""}
              onChange={(e) => updateDraft((prev) => ({ ...prev, exam_batch_year: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.localId} className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-base-300/40 p-4 bg-base-100/70 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Question {index + 1}</p>
                  <button
                    type="button"
                    className="btn btn-xs btn-ghost text-error"
                    onClick={() => removeQuestion(index)}
                    disabled={questions.length === 1}
                  >
                    Remove
                  </button>
                </div>

                <div>
                  <label className="label-text text-xs font-bold uppercase tracking-wider text-base-content/50">Question Text</label>
                  <textarea
                    className="textarea textarea-bordered rounded-xl w-full mt-1 bg-base-200 text-base-content"
                    rows={3}
                    value={q.question_txt}
                    onChange={(e) => updateQuestion(index, "question_txt", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label-text text-xs font-bold uppercase tracking-wider text-base-content/50">Question Full Marks</label>
                    <input
                      type="number"
                      className="input input-bordered rounded-xl w-full mt-1"
                      min="1"
                      value={q.full_marks}
                      onChange={(e) => updateQuestion(index, "full_marks", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label-text text-xs font-bold uppercase tracking-wider text-base-content/50">Question Type</label>
                    <select
                      className="select select-bordered rounded-xl w-full mt-1"
                      value={q.question_type}
                      onChange={(e) => updateQuestion(index, "question_type", e.target.value)}
                    >
                      <option value="MCQ">MCQ</option>
                      <option value="SHORT">Short Question</option>
                      <option value="LONG">Long Question</option>
                    </select>
                  </div>
                </div>

                {q.question_type === "MCQ" ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((opt) => (
                      <div key={opt} className="grid grid-cols-[1fr_auto] gap-2 items-center">
                        <input
                          type="text"
                          className="input input-bordered rounded-xl w-full"
                          placeholder={`Option ${opt}`}
                          value={q[`option${opt}`]}
                          onChange={(e) => updateQuestion(index, `option${opt}`, e.target.value)}
                        />
                        <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                          <input
                            type="radio"
                            name={`correct-${q.localId}`}
                            className="radio radio-primary radio-sm"
                            checked={String(q.correct_option) === String(opt)}
                            onChange={() => updateQuestion(index, "correct_option", String(opt))}
                          />
                          Correct
                        </label>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-base-300/40 p-4 bg-base-100/70 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-bold">Question Preview</p>
                  <span className="font-black text-lg opacity-70">[{q.full_marks || 0}]</span>
                </div>
                <p className="font-medium">Q.{index + 1}. {q.question_txt?.trim() || "(Question text will appear here)"}</p>
                <p className="text-xs opacity-60">Type: {q.question_type}</p>

                {q.question_type === "MCQ" ? (
                  <div className="space-y-1 pt-1">
                    {[1, 2, 3, 4].map((opt) => (
                      <div key={`pv-opt-${q.localId}-${opt}`} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="checkbox checkbox-xs" checked={String(q.correct_option) === String(opt)} readOnly />
                        <span>{q[`option${opt}`]?.trim() || `Option ${opt}`}</span>
                        {String(q.correct_option) === String(opt) ? (
                          <span className="text-[10px] uppercase font-bold text-success">(Correct)</span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-outline rounded-xl w-full" onClick={addQuestion}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Other Question
          </button>
        </div>

        {(formError || createMutation.isError) ? (
          <div className="alert alert-error mt-4">
            <span>{formError || createMutation.error?.response?.data?.error || "Failed to submit."}</span>
          </div>
        ) : null}

        <div className="flex justify-end mt-6">
          <button type="button" className="btn btn-primary rounded-xl px-8" onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? <span className="loading loading-spinner loading-sm" /> : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
