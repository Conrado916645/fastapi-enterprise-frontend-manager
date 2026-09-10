import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AISettingsService } from "../../api/services";

export default function AISettings() {
  const [settings, setSettings] = useState({
    is_enabled: false,
    provider: "anthropic",
    model_name: "",
    api_key: "",
    custom_prompt: "",
  });
  const [hasApiKeySet, setHasApiKeySet] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await AISettingsService.getSettings();
      setSettings({
        is_enabled: data.is_enabled ?? false,
        provider: data.provider || "anthropic",
        model_name: data.model_name || "",
        api_key: "",
        custom_prompt: data.custom_prompt || "",
      });
      setHasApiKeySet(!!data.has_api_key_set);
    } catch (err) {
      toast.error("Failed to load AI settings.");
    }
  };

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...settings };
      if (!payload.api_key) delete payload.api_key;
      const data = await AISettingsService.updateSettings(payload);
      setHasApiKeySet(!!data.has_api_key_set);
      setSettings((prev) => ({ ...prev, api_key: "" }));
      toast.success("AI settings updated.");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Update failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white dark:bg-slate-800 p-6 rounded-lg shadow"
      >
        {/* Enable / Disable toggle */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="is_enabled"
              checked={settings.is_enabled}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-300">
            Enable AI Integration
          </span>
        </div>

        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Provider
          </label>
          <select
            name="provider"
            value={settings.provider}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Model
          </label>
          <input
            type="text"
            name="model_name"
            value={settings.model_name}
            onChange={handleChange}
            placeholder="claude-sonnet-5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Token {hasApiKeySet && <span className="text-emerald-600 text-xs font-normal">(currently set)</span>}
          </label>
          <input
            type="password"
            name="api_key"
            value={settings.api_key}
            onChange={handleChange}
            placeholder={hasApiKeySet ? "Leave blank to keep existing token" : "sk-..."}
            autoComplete="off"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
          <p className="text-xs text-slate-500 mt-1">
            Stored encrypted server-side. Never shown again after saving.
          </p>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Custom Prompt
          </label>
          <textarea
            name="custom_prompt"
            value={settings.custom_prompt}
            onChange={handleChange}
            rows={5}
            placeholder="Optional system prompt / instructions to send with every request..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 resize-y"
          />
          <p className="text-xs text-slate-500 mt-1">
            Fill this in only if the feature needs a custom prompt — leave blank to use the default.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
