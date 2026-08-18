import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { IngestionService } from "../../api/services";

export default function SourceForm({ source, onClose, onSaved }: any) {
  const [form, setForm] = useState({
    name: "",
    endpoint: "",
    method: "GET",
    auth_type: "",
    auth_credentials_env: "",
    headers: [] as { key: string; value: string }[],
    pagination_type: "",
    pagination_config_json: "{}",
    validation_rules_json: "{}",
    schedule: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (source) {
      let headersArray: { key: string; value: string }[] = [];
      if (source.headers && typeof source.headers === "object") {
        headersArray = Object.entries(source.headers).map(([key, value]) => ({
          key,
          value: String(value),
        }));
      }

      setForm({
        name: source.name || "",
        endpoint: source.endpoint || "",
        method: source.method || "GET",
        auth_type: source.auth_type || "",
        auth_credentials_env: source.auth_credentials?.token_env || "",
        headers: headersArray,
        pagination_type: source.pagination_type || "",
        pagination_config_json: source.pagination_config
          ? JSON.stringify(source.pagination_config, null, 2)
          : "{}",
        validation_rules_json: source.validation_rules
          ? JSON.stringify(source.validation_rules, null, 2)
          : "{}",
        schedule: source.schedule || "",
      });
    }
  }, [source]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      // Clear auth credentials when auth type is set to none
      if (name === "auth_type" && (value === "" || value === "none")) {
        return { ...prev, auth_type: "", auth_credentials_env: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleHeaderChange = (index: number, field: "key" | "value", val: string) => {
    setForm((prev) => {
      const newHeaders = [...prev.headers];
      newHeaders[index][field] = val;
      return { ...prev, headers: newHeaders };
    });
  };

  const addHeader = () => {
    setForm((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: "", value: "" }],
    }));
  };

  const removeHeader = (index: number) => {
    setForm((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate and parse JSON fields
    let paginationConfig: any;
    let validationRules: any;

    try {
      paginationConfig = JSON.parse(form.pagination_config_json || "{}");
    } catch {
      toast.error("Pagination Config is not valid JSON.");
      return;
    }

    try {
      validationRules = JSON.parse(form.validation_rules_json || "{}");
    } catch {
      toast.error("Validation Rules is not valid JSON.");
      return;
    }

    // Build payload
    const payload: any = {
      name: form.name,
      endpoint: form.endpoint,
      method: form.method,
      auth_type: form.auth_type || null,
      headers: form.headers.reduce(
        (acc, h) => (h.key ? { ...acc, [h.key]: h.value } : acc),
        {}
      ),
      pagination_type: form.pagination_type || null,
      pagination_config: paginationConfig,
      validation_rules: validationRules,
      schedule: form.schedule || null,
    };

    // Handle auth_credentials
    if (form.auth_type === "bearer" || form.auth_type === "api_key") {
      payload.auth_credentials = { token_env: form.auth_credentials_env };
    } else if (form.auth_type === "basic") {
      payload.auth_credentials = { username_env: "", password_env: "" };
    }

    // Debug: log the exact payload being sent
    console.log("Submitting payload:", payload);

    try {
      if (source) {
        await IngestionService.updateSource(source.id, payload);
        toast.success("Source updated.");
      } else {
        await IngestionService.createSource(payload);
        toast.success("Source created.");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Save failed.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6 my-8">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          {source ? "Edit Source" : "Add Source"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>

          {/* Endpoint */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Endpoint URL *</label>
            <input
              name="endpoint"
              value={form.endpoint}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>

          {/* Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Method</label>
            <select
              name="method"
              value={form.method}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {/* Authentication */}
          <fieldset className="border p-3 rounded-md dark:border-gray-600">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Authentication</legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">Auth Type</label>
                <select
                  name="auth_type"
                  value={form.auth_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
                >
                  <option value="">None</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="api_key">API Key</option>
                  <option value="basic">Basic Auth</option>
                </select>
              </div>
              {form.auth_type !== "" && form.auth_type !== "none" && (
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400">
                    {form.auth_type === "basic" ? "Username Env Var" : "Token Env Variable"}
                  </label>
                  <input
                    name="auth_credentials_env"
                    value={form.auth_credentials_env}
                    onChange={handleChange}
                    placeholder="e.g., STRIPE_API_KEY"
                    className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Environment variable name where the secret is stored.
                  </p>
                </div>
              )}
            </div>
          </fieldset>

          {/* Custom Headers */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Headers</label>
              <button
                type="button"
                onClick={addHeader}
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                + Add Header
              </button>
            </div>
            {form.headers.map((header, idx) => (
              <div key={idx} className="flex gap-2 mt-2">
                <input
                  placeholder="Key"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(idx, "key", e.target.value)}
                  className="w-1/3 px-2 py-1 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <input
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(idx, "value", e.target.value)}
                  className="flex-1 px-2 py-1 border rounded dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
                <button
                  type="button"
                  onClick={() => removeHeader(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <fieldset className="border p-3 rounded-md dark:border-gray-600">
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Pagination</legend>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400">Pagination Type</label>
              <select
                name="pagination_type"
                value={form.pagination_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
              >
                <option value="">None</option>
                <option value="cursor">Cursor</option>
                <option value="page">Page Number</option>
              </select>
            </div>
            <div className="mt-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400">Pagination Config (JSON)</label>
              <textarea
                name="pagination_config_json"
                value={form.pagination_config_json}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-md font-mono text-sm dark:bg-slate-700 dark:text-white dark:border-slate-600"
                placeholder='{"cursor_param": "starting_after", "results_field": "data"}'
              />
              <p className="text-xs text-gray-500 mt-1">
                JSON object with cursor/parameter names, results field, etc.
              </p>
            </div>
          </fieldset>

          {/* Validation Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Validation Rules (JSON)</label>
            <textarea
              name="validation_rules_json"
              value={form.validation_rules_json}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm dark:bg-slate-700 dark:text-white dark:border-slate-600"
              placeholder='{"required_fields": ["id", "name"]}'
            />
          </div>

          {/* Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Schedule (cron expression)</label>
            <input
              name="schedule"
              value={form.schedule}
              onChange={handleChange}
              placeholder="0 * * * * (every hour)"
              className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}