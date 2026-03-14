import { useParams, useNavigate } from "react-router-dom";
import ExaminationForm from "../components/examinations/ExaminationForm.jsx";
import {
  useExamination,
  useCreateExamination,
  useUpdateExamination,
} from "../hooks/useAdminQueries.js";

export default function ExaminationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const selectedId = id ? Number(id) : null;

  const { data: examinationData, isLoading: loadingExam } = useExamination(selectedId);
  const createMutation = useCreateExamination();
  const updateMutation = useUpdateExamination(selectedId ?? 0);

  const initialData =
    selectedId && examinationData
      ? { examination: examinationData.examination, subjects: examinationData.subjects }
      : null;

  const handleSubmit = (payload) => {
    if (selectedId) {
      updateMutation.mutate(payload, {
        onSuccess: () => {
          navigate("/admin/examinations");
        },
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          navigate("/admin/examinations");
        },
      });
    }
  };

  const handleCancel = () => {
    navigate("/admin/examinations");
  };

  const submitError =
    createMutation.isError
      ? createMutation.error?.response?.data?.error ?? createMutation.error?.message
      : updateMutation.isError
        ? updateMutation.error?.response?.data?.error ?? updateMutation.error?.message
        : null;
        
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (loadingExam && selectedId) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center gap-4">
        <button 
          type="button" 
          className="btn btn-ghost btn-circle"
          onClick={handleCancel}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold">
          {selectedId ? "Edit Examination" : "Create New Examination"}
        </h1>
      </div>

      <ExaminationForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}
