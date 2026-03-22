import { useState, useEffect } from "react";
import { Server, Key, Globe, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useSaveProvisionKey, useRegisterWithMainServer, useRegistrationStatus } from "../hooks/useProxyQueries.js";

export default function RegistrationPage() {
  const [formData, setFormData] = useState({
    exam_center_id: "",
    provision_key: "",
    main_server_url: "http://192.168.1.100:8000",
  });
  const [step, setStep] = useState(1); // 1: Input, 2: Registering, 3: Success
  const [error, setError] = useState(null);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  const { data: status, isLoading: isStatusLoading } = useRegistrationStatus();
  const saveMutation = useSaveProvisionKey();
  const registerMutation = useRegisterWithMainServer();

  useEffect(() => {
    if (status?.is_registered) {
      setStep(3);
    }
    if (!isStatusLoading) {
        setIsInitialCheck(false);
    }
  }, [status, isStatusLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartRegistration = async (e) => {
    e.preventDefault();
    setError(null);
    setStep(2);

    try {
      // Step 1: Save locally
      await saveMutation.mutateAsync(formData);
      
      // Step 2: Register with main server
      await registerMutation.mutateAsync();
      
      setStep(3);
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Registration failed");
      setStep(1);
    }
  };

  if (isInitialCheck) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="w-full animate-slide-up">
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-10 text-center space-y-4">
          <div className="w-20 h-20 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 transform hover:scale-110 transition-transform duration-300">
            <Server className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-base-content">Proxy Node Setup</h1>
            <p className="text-base-content/60 font-medium mt-2">Connect this node to the central Examination System</p>
          </div>
        </div>

        {step === 3 ? (
          <div className="glass-card p-10 text-center space-y-8 border-indigo-500/20 shadow-2xl animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
              <ShieldCheck className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight text-base-content">
                {status?.is_registered ? "Registration already done" : "Registration Successful"}
              </h2>
              <p className="text-base-content/60 font-medium">Your proxy server is securely authenticated with the Main Server.</p>
            </div>
            <div className="pt-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-left space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Connection Status</p>
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-sm font-bold text-base-content/80">Authenticated & Secure</span>
                    </div>
                </div>
            </div>
          </div>
        ) : (
          <div className="glass-card shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
            <div className="p-8 md:p-10">
              <form onSubmit={handleStartRegistration} className="space-y-6">
                {error && (
                  <div className="alert alert-error rounded-2xl border-none shadow-lg shadow-red-500/10 font-bold text-sm animate-fade-in">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="form-control group">
                    <label className="label">
                      <span className="label-text flex items-center gap-2 font-black uppercase text-[10px] tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">
                        <Globe className="w-3 h-3" /> Main Server URL
                      </span>
                    </label>
                    <input
                      type="url"
                      name="main_server_url"
                      value={formData.main_server_url}
                      onChange={handleChange}
                      required
                      placeholder="https://main-server.com"
                      className="input input-bordered w-full rounded-2xl bg-slate-50 dark:bg-slate-900/30 font-semibold focus:ring-4 focus:ring-indigo-500/10 transition-all h-14 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div className="form-control group">
                    <label className="label">
                      <span className="label-text flex items-center gap-2 font-black uppercase text-[10px] tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">
                        <Server className="w-3 h-3" /> Exam Center ID
                      </span>
                    </label>
                    <input
                      type="text"
                      name="exam_center_id"
                      value={formData.exam_center_id}
                      onChange={handleChange}
                      required
                      placeholder="Paste your unique Center ID"
                      className="input input-bordered w-full rounded-2xl bg-slate-50 dark:bg-slate-900/30 font-semibold focus:ring-4 focus:ring-indigo-500/10 transition-all h-14 border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  <div className="form-control group">
                    <label className="label">
                      <span className="label-text flex items-center gap-2 font-black uppercase text-[10px] tracking-widest opacity-40 group-focus-within:opacity-100 transition-opacity">
                        <Key className="w-3 h-3" /> Provision Key
                      </span>
                    </label>
                    <input
                      type="password"
                      name="provision_key"
                      value={formData.provision_key}
                      onChange={handleChange}
                      required
                      placeholder="Enter the one-time provision key"
                      className="input input-bordered w-full rounded-2xl bg-slate-50 dark:bg-slate-900/30 font-mono transition-all h-14 border-slate-200 dark:border-slate-800"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary w-full rounded-2xl h-14 font-bold text-lg shadow-xl shadow-indigo-500/20 group relative overflow-hidden"
                    disabled={step === 2}
                  >
                    {step === 2 ? (
                      <span className="flex items-center gap-3">
                        <Loader2 className="w-5 h-5 animate-spin" /> Verifying Credentials...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Complete Registration <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>
            
            <div className="px-10 py-6 bg-base-200/50 border-t border-base-content/5 text-center">
              <p className="text-xs font-semibold text-base-content/40">
                Setup is required only once per node installation.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
