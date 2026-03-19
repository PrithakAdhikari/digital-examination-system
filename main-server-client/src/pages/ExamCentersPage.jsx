import { useState } from "react";
import CentersList from "../components/centers/CentersList.jsx";
import CenterFormModal from "../components/centers/CenterFormModal.jsx";
import { useDeleteCenter } from "../hooks/useAdminQueries.js";

export default function ExamCentersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [centerToEdit, setCenterToEdit] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const deleteMutation = useDeleteCenter();

  const handleCreateNew = () => {
    setCenterToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditCenter = (center) => {
    setCenterToEdit(center);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id, name) => setDeleteTarget({ id, name });
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <CentersList
        onCreateNew={handleCreateNew}
        onEdit={handleEditCenter}
        onDelete={handleDeleteClick}
      />

      <CenterFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        centerToEdit={centerToEdit}
      />

      {/* Delete Confirmation Modal */}
      <div className={`modal ${deleteTarget ? "modal-open" : ""}`}>
        <div className="modal-box glass-card border border-error/20 p-8 max-w-lg">
          <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 className="font-bold text-2xl tracking-tight">Deprovision Center?</h3>
          <p className="py-4 text-base-content/60 font-medium">
            You are about to remove <span className="font-bold text-base-content">&quot;{deleteTarget?.name}&quot;</span>. 
            Remote nodes will lose access immediately. This action cannot be undone.
          </p>
          <div className="modal-action gap-3">
            <button type="button" className="btn btn-ghost rounded-xl font-bold" onClick={() => setDeleteTarget(null)}>
              Keep Center
            </button>
            <button
              type="button"
              className="btn btn-error rounded-xl px-8 font-bold shadow-lg shadow-error/20"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : "Remove Permanently"}
            </button>
          </div>
        </div>
        <div className="modal-backdrop backdrop-blur-sm bg-base-900/20" onClick={() => setDeleteTarget(null)} aria-hidden />
      </div>
    </div>
  );
}
