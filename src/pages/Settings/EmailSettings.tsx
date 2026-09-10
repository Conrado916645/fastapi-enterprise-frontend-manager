import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { EmailSettingsService } from "../../api/services";

export default function EmailSettings() {
  const [settings, setSettings] = useState({
    is_enabled: true,
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    smtp_use_tls: true,
    from_email: "",
    from_name: "",
  });
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await EmailSettingsService.getSettings();
      setSettings({
        is_enabled: data.is_enabled ?? true,
        smtp_host: data.smtp_host || "",
        smtp_port: data.smtp_port || 587,
        smtp_username: data.smtp_username || "",
        smtp_password: "",
        smtp_use_tls: data.smtp_use_tls ?? true,
        from_email: data.from_email || "",
        from_name: data.from_name || "",
      });
    } catch (err) {
      toast.error("Failed to load email settings.");
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
      const payload = { ...settings };
      if (!payload.smtp_password) delete payload.smtp_password;
      await EmailSettingsService.updateSettings(payload);
      toast.success("Email settings updated.");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Update failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error("Enter a recipient email.");
      return;
    }
    setSending(true);
    try {
      await EmailSettingsService.sendTestEmail(testEmail);
      toast.success("Test email sent. Check your inbox.");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Test failed";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

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
            Enable Email Sending
          </span>
        </div>

        {/* Host */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            SMTP Host
          </label>
          <input
            type="text"
            name="smtp_host"
            value={settings.smtp_host}
            onChange={handleChange}
            placeholder="smtp.gmail.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        {/* Port */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Port
          </label>
          <input
            type="number"
            name="smtp_port"
            value={settings.smtp_port}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            SMTP Username
          </label>
          <input
            type="text"
            name="smtp_username"
            value={settings.smtp_username}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            SMTP Password
          </label>
          <input
            type="password"
            name="smtp_password"
            value={settings.smtp_password}
            onChange={handleChange}
            placeholder="Leave blank to keep existing"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        {/* TLS */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="smtp_use_tls"
            checked={settings.smtp_use_tls}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Use TLS
          </label>
        </div>

        {/* From Email */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            From Email
          </label>
          <input
            type="email"
            name="from_email"
            value={settings.from_email}
            onChange={handleChange}
            placeholder="no-reply@example.com"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        {/* From Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            From Name
          </label>
          <input
            type="text"
            name="from_name"
            value={settings.from_name}
            onChange={handleChange}
            placeholder="Your App"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>

      {/* Test Email Section */}
      <div className="mt-8 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-semibold mb-3 dark:text-white">
          Send Test Email
        </h2>
        <div className="flex gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="recipient@example.com"
            className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          />
          <button
            onClick={handleTestEmail}
            disabled={sending}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md focus:outline-none disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Test"}
          </button>
        </div>
      </div>
    </div>
  );
}