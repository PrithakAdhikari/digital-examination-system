import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClients, deleteClient } from "../api/proxyApi";
import { formatDistanceToNow } from "date-fns";
import { Monitor, RefreshCcw, Wifi, WifiOff, Cpu, Clock, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["clients"],
    queryFn: getClients,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("Client deleted successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || "Failed to delete client");
    },
  });

  const handleDelete = (clientId, physicalId) => {
    if (window.confirm(`Are you sure you want to delete client ${physicalId}? This action cannot be undone.`)) {
      deleteMutation.mutate(clientId);
    }
  };

  const clients = data?.data || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            Examination Clients
          </h1>
          <p className="text-base-content/60 mt-2 font-medium">
            Monitor and manage connected examination terminals in real-time.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className={`btn btn-primary btn-md rounded-2xl shadow-lg shadow-primary/20 gap-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
            isFetching ? "animate-pulse" : ""
          }`}
        >
          <RefreshCcw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Syncing..." : "Refresh Status"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="stats shadow-xl bg-base-100/50 backdrop-blur-md border border-base-300/50 rounded-3xl overflow-hidden">
          <div className="stat">
            <div className="stat-figure text-primary">
              <Monitor className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title font-bold text-xs uppercase tracking-widest opacity-60">Total Clients</div>
            <div className="stat-value text-primary">{clients.length}</div>
            <div className="stat-desc font-medium mt-1">Registered terminals</div>
          </div>
        </div>

        <div className="stats shadow-xl bg-base-100/50 backdrop-blur-md border border-base-300/50 rounded-3xl overflow-hidden">
          <div className="stat">
            <div className="stat-figure text-success">
              <Wifi className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title font-bold text-xs uppercase tracking-widest opacity-60">Online Now</div>
            <div className="stat-value text-success">
              {clients.filter((c) => c.status === "online").length}
            </div>
            <div className="stat-desc font-medium mt-1 text-success">Active connections</div>
          </div>
        </div>

        <div className="stats shadow-xl bg-base-100/50 backdrop-blur-md border border-base-300/50 rounded-3xl overflow-hidden">
          <div className="stat">
            <div className="stat-figure text-error">
              <WifiOff className="w-8 h-8 opacity-20" />
            </div>
            <div className="stat-title font-bold text-xs uppercase tracking-widest opacity-60">Offline</div>
            <div className="stat-value text-error">
              {clients.filter((c) => c.status === "offline").length}
            </div>
            <div className="stat-desc font-medium mt-1 text-error">Disconnected</div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-2xl border border-base-300/50 rounded-4xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-lg w-full">
            <thead>
              <tr className="bg-base-200/50 border-b border-base-300/50">
                <th className="font-bold text-xs uppercase tracking-widest py-6">Physical ID</th>
                <th className="font-bold text-xs uppercase tracking-widest">Device Identifier</th>
                <th className="font-bold text-xs uppercase tracking-widest">Status</th>
                <th className="font-bold text-xs uppercase tracking-widest">Last Heartbeat</th>
                <th className="font-bold text-xs uppercase tracking-widest">Registered At</th>
                <th className="font-bold text-xs uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-20">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-base-content/40 font-medium">Loading client data...</p>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-20">
                    <div className="flex flex-col items-center opacity-20">
                      <Monitor className="w-20 h-20 mb-4" />
                      <p className="text-xl font-bold">No clients registered yet</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-base-200/30 transition-colors border-b border-base-200/50 group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${
                          client.status === 'online' ? 'bg-success/10 text-success' : 'bg-base-300/30 text-base-content/30'
                        } group-hover:scale-110 transition-transform duration-300`}>
                          <Cpu className="w-5 h-5" />
                        </div>
                        <span className="font-black text-lg">{client.client_physical_id}</span>
                      </div>
                    </td>
                    <td>
                      <code className="text-xs font-mono bg-base-200 px-3 py-1.5 rounded-lg border border-base-300/50">
                        {client.device_id}
                      </code>
                    </td>
                    <td>
                      <div className={`badge badge-lg border-0 gap-2 font-bold py-4 px-6 rounded-2xl ${
                        client.status === "online" 
                          ? "bg-success/10 text-success animate-pulse-subtle" 
                          : "bg-error/10 text-error"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          client.status === "online" ? "bg-success" : "bg-error"
                        }`}></span>
                        {client.status.toUpperCase()}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-base-content/60 font-medium">
                        <Clock className="w-4 h-4" />
                        {client.last_heartbeat 
                          ? formatDistanceToNow(new Date(client.last_heartbeat), { addSuffix: true })
                          : "Never"}
                      </div>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-base-content/40">
                        {new Date(client.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDelete(client.client_id, client.client_physical_id)}
                        disabled={deleteMutation.isPending}
                        className="btn btn-ghost btn-sm btn-square text-error hover:bg-error/10 rounded-xl transition-all duration-300 group-hover:scale-110"
                        title="Delete Client"
                      >
                        <Trash2 className="w-4 h-4" />
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
