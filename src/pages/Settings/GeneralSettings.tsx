import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { GeneralSettingsService } from "../../api/services";

export default function GeneralSettings() {
  const [settings, setSettings] = useState({
    app_name: "",
    frontend_domain: "",
    backend_domain: "",
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    GeneralSettingsService.getSettings()
      .then((data) => {
        setSettings({
          app_name: data.app_name || "",
          frontend_domain: data.frontend_domain || "",
          backend_domain: data.backend_domain || "",
        });
      })
      .catch(() => toast.error("Failed to load general settings."))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await GeneralSettingsService.updateSettings(settings);
      setSettings({
        app_name: data.app_name || "",
        frontend_domain: data.frontend_domain || "",
        backend_domain: data.backend_domain || "",
      });
      toast.success("General settings updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Update failed");
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
      className="space-y-5 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          App Name
        </label>
        <input
          type="text"
          name="app_name"
          required
          value={settings.app_name}
          onChange={handleChange}
          placeholder="My App"
          className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
        />
        <p className="text-xs text-slate-500 mt-1">
          Shown on the login page and in the sidebar.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Frontend Domain(s)
        </label>
        <input
          type="text"
          name="frontend_domain"
          value={settings.frontend_domain}
          onChange={handleChange}
          placeholder="http://localhost:5173, https://app.example.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
        />
        <p className="text-xs text-slate-500 mt-1">
          Comma-separated. These are the only origins the API will accept browser requests
          from (CORS). Leave blank to allow any origin — fine for local dev, not recommended
          once this is reachable from the internet.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Backend Domain
        </label>
        <input
          type="text"
          name="backend_domain"
          value={settings.backend_domain}
          onChange={handleChange}
          placeholder="https://api.example.com"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
        />
        <p className="text-xs text-slate-500 mt-1">
          This API's own public URL — informational only, not used for CORS.
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
