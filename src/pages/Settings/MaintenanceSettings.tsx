import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, Server } from "lucide-react";
import { toast } from "react-toastify";
import { MaintenanceService, type MaintenanceSettings as Settings } from "../../api/services";
import { useMaintenance } from "../../context/maintenance";

// <input type="datetime-local"> wants local "YYYY-MM-DDTHH:mm".
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function apiError(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export default function MaintenanceSettings() {
  const { refresh: refreshStatus } = useMaintenance();
  const [server, setServer] = useState<Settings | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const apply = (data: Settings) => {
    setServer(data);
    setIsEnabled(data.is_enabled);
    setMessage(data.message || "");
    setEndsAt(toLocalInput(data.ends_at));
  };

  const load = useCallback(
    () =>
      MaintenanceService.getSettings()
        .then(apply)
        .catch(() => toast.error("Failed to load maintenance settings."))
        .finally(() => setInitialLoading(false)),
    [],
  );

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await MaintenanceService.updateSettings({
        is_enabled: isEnabled,
        message: message.trim() || null,
        // Local picker value -> UTC ISO; null when cleared.
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      apply(data);
      await refreshStatus(); // updates the banner immediately
      toast.success(isEnabled ? "Maintenance mode is ON." : "Maintenance mode is OFF.");
    } catch (err) {
      toast.error(apiError(err, "Update failed"));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800"
    >
      {server?.forced_by_env && (
        <div className="flex gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
          <Server size={18} className="shrink-0 mt-0.5" />
          <span>
            Maintenance is <strong>forced on by the server</strong> (<code>MAINTENANCE_MODE=true</code> in the backend
            environment). It stays on until that's set back to <code>false</code> and the API restarts — the toggle
            below can't override it.
          </span>
        </div>
      )}

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => setIsEnabled(e.target.checked)}
          className="w-5 h-5 accent-amber-600"
        />
        <span className="font-semibold text-slate-900 dark:text-white">Enable maintenance mode</span>
      </label>

      {isEnabled && (
        <div className="flex gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <span>
            Everyone without <code>system:update</code> is signed out of the app and sees the maintenance page until
            you turn this off. Administrators keep full access.
          </span>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message shown to users</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="We're performing scheduled maintenance. Please check back soon."
          className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Expected back at <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          type="datetime-local"
          value={endsAt}
          onChange={(e) => setEndsAt(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
        <p className="text-xs text-slate-500 mt-1">
          Shown on the maintenance page, and sent to API clients as a <code>Retry-After</code> hint. It doesn't end
          maintenance automatically.
        </p>
      </div>

      {server?.updated_by && (
        <p className="text-xs text-slate-400">
          Last changed by {server.updated_by}
          {server.updated_at ? ` · ${new Date(server.updated_at).toLocaleString()}` : ""}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-colors disabled:opacity-60 ${
          isEnabled ? "bg-amber-600 hover:bg-amber-700" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
