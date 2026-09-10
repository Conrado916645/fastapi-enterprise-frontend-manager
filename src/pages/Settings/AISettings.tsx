import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { AISettingsService } from "../../api/services";

export default function AISettings() {
  const [settings, setSettings] = useState({
    is_enabled: false,
    provider: "anthropic",
    model_name: "",
    base_url: "",
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
        base_url: data.base_url || "",
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

  const isLocal = settings.provider === "local";

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700"
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
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-sm font-medium text-slate-900 dark:text-slate-300">
            Enable AI Integration
          </span>
        </div>

        {/* Provider */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Provider
          </label>
          <select
            name="provider"
            value={settings.provider}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
            <option value="local">Local / Self-hosted</option>
          </select>
          {isLocal && (
            <p className="text-xs text-slate-500 mt-1">
              Any server that speaks the OpenAI-compatible API — Ollama, LM Studio, vLLM, llama.cpp, etc.
            </p>
          )}
        </div>

        {/* Base URL — only needed for a local/self-hosted server */}
        {isLocal && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Base URL
            </label>
            <input
              type="text"
              name="base_url"
              value={settings.base_url}
              onChange={handleChange}
              placeholder="http://localhost:11434/v1"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              The endpoint of your local model server, e.g. Ollama's default at{" "}
              <code>http://localhost:11434/v1</code>.
            </p>
          </div>
        )}

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Model
          </label>
          <input
            type="text"
            name="model_name"
            value={settings.model_name}
            onChange={handleChange}
            placeholder={isLocal ? "llama3.1" : "claude-sonnet-5"}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
          {isLocal && (
            <p className="text-xs text-slate-500 mt-1">
              The model name as your local server expects it, e.g. <code>llama3.1</code> or <code>mistral</code>.
            </p>
          )}
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            API Token {isLocal && <span className="text-slate-400 font-normal">(optional)</span>}{" "}
            {hasApiKeySet && <span className="text-emerald-600 text-xs font-normal">(currently set)</span>}
          </label>
          <input
            type="password"
            name="api_key"
            value={settings.api_key}
            onChange={handleChange}
            placeholder={
              hasApiKeySet
                ? "Leave blank to keep existing token"
                : isLocal
                  ? "Leave blank if your local server doesn't require one"
                  : "sk-..."
            }
            autoComplete="off"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
          <p className="text-xs text-slate-500 mt-1">
            {isLocal
              ? "Most local servers don't require one, but it's stored encrypted server-side if you set it."
              : "Stored encrypted server-side. Never shown again after saving."}
          </p>
        </div>

        {/* Custom Prompt */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Custom Prompt
          </label>
          <textarea
            name="custom_prompt"
            value={settings.custom_prompt}
            onChange={handleChange}
            rows={5}
            placeholder="Optional system prompt / instructions to send with every request..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600 resize-y"
          />
          <p className="text-xs text-slate-500 mt-1">
            Fill this in only if the feature needs a custom prompt — leave blank to use the default.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
