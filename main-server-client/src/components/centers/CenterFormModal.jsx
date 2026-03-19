import { useState, useEffect } from "react";
import { useCreateCenter, useUpdateCenter } from "../../hooks/useAdminQueries.js";

export default function CenterFormModal({ isOpen, onClose, centerToEdit }) {
  const [formData, setFormData] = useState({
    center_name_txt: "",
    whitelist_ip: "",
    whitelist_url: "",
  });
  const [createdData, setCreatedData] = useState(null);

  const createMutation = useCreateCenter();
  const updateMutation = useUpdateCenter(centerToEdit?.id);

  useEffect(() => {
    if (centerToEdit) {
      setFormData({
        center_name_txt: centerToEdit.center_name_txt || "",
        whitelist_ip: centerToEdit.whitelist_ip || "",
        whitelist_url: centerToEdit.whitelist_url || "",
      });
    } else {
      setFormData({
        center_name_txt: "",
        whitelist_ip: "",
        whitelist_url: "",
      });
    }
    setCreatedData(null);
  }, [centerToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (centerToEdit) {
      updateMutation.mutate(formData, {
        onSuccess: () => onClose(),
      });
    } else {
      createMutation.mutate(formData, {
        onSuccess: (data) => {
          setCreatedData(data.data);
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box glass-card p-8 max-w-2xl border border-base-300/30">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
          onClick={onClose}
        >
          ✕
        </button>

        {createdData ? (
          <div className="animate-fade-in space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-success/10 flex items-center justify-center text-success mb-6 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-bold text-3xl tracking-tight">Center Created!</h3>
              <p className="text-base-content/60 font-medium">Successfully provisioned &quot;{createdData.center_name_txt}&quot;</p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 p-6 rounded-2xl space-y-4">
              <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-black uppercase tracking-widest">Important: Provision Key</span>
              </div>
              <p className="text-[13px] leading-relaxed font-semibold opacity-70">
                This key is required for the Proxy Server to register. It will <span className="text-error font-bold italic underline">NEVER</span> be shown again. Copy it now.
              </p>
              
              <div className="flex flex-col gap-2 mt-4">
                <label className="text-[10px] uppercase font-black opacity-30 px-1">Exam Center ID</label>
                <div className="join w-full">
                  <input 
                    type="text" 
                    readOnly 
                    value={createdData.exam_center_id} 
                    className="join-item input input-bordered bg-base-200/50 font-mono text-xs w-full focus:outline-none" 
                  />
                  <button 
                    className="join-item btn btn-square btn-ghost border border-base-300 h-12"
                    onClick={() => navigator.clipboard.writeText(createdData.exam_center_id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-black opacity-30 px-1">Provision Key</label>
                <div className="join w-full">
                  <input 
                    type="text" 
                    readOnly 
                    value={createdData.provision_key} 
                    className="join-item input input-bordered bg-base-200/50 font-mono text-xs w-full focus:outline-none" 
                  />
                  <button 
                    className="join-item btn btn-square btn-ghost border border-base-300 h-12"
                    onClick={() => navigator.clipboard.writeText(createdData.provision_key)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <button className="btn btn-primary w-full rounded-2xl h-14 font-bold" onClick={onClose}>
              Done, I've Copied the Keys
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-bold text-2xl tracking-tight">
                {centerToEdit ? "Edit Center" : "Create New Center"}
              </h3>
              <p className="text-sm text-base-content/50 font-medium mt-1">
                {centerToEdit ? "Modify center details and whitelisting" : "Provision a new examination center and generate remote keys"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-bold uppercase text-[10px] tracking-widest opacity-40">Center Name</span>
                </label>
                <input
                  type="text"
                  name="center_name_txt"
                  value={formData.center_name_txt}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Kathmandu Engineering College"
                  className="input input-bordered w-full rounded-xl bg-base-200/30 font-medium focus:ring-2 focus:ring-primary/20 transition-all border-base-300/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold uppercase text-[10px] tracking-widest opacity-40">Whitelist IP</span>
                  </label>
                  <input
                    type="text"
                    name="whitelist_ip"
                    value={formData.whitelist_ip}
                    onChange={handleChange}
                    placeholder="e.g. 192.168.1.100"
                    className="input input-bordered w-full rounded-xl bg-base-200/30 font-medium focus:ring-2 focus:ring-primary/20 transition-all border-base-300/50"
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-bold uppercase text-[10px] tracking-widest opacity-40">Whitelist URL</span>
                  </label>
                  <input
                    type="text"
                    name="whitelist_url"
                    value={formData.whitelist_url}
                    onChange={handleChange}
                    placeholder="e.g. kec.edu.np"
                    className="input input-bordered w-full rounded-xl bg-base-200/30 font-medium focus:ring-2 focus:ring-primary/20 transition-all border-base-300/50"
                  />
                </div>
              </div>
            </div>

            <div className="modal-action gap-3 pt-6 border-t border-base-300/20">
              <button
                type="button"
                className="btn btn-ghost rounded-xl px-6 font-bold"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rounded-xl px-8 font-bold shadow-lg shadow-primary/20"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : centerToEdit ? (
                  "Update Center"
                ) : (
                  "Create & Generate Keys"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      <div className="modal-backdrop backdrop-blur-sm bg-base-900/20" onClick={onClose} aria-hidden />
    </div>
  );
}
