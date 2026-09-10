import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { CaptchaSettingsService } from "../../api/services";

type CaptchaProvider = "local" | "google";
type CaptchaType = "math" | "text" | "random";

export default function CaptchaSettings() {
  const [settings, setSettings] = useState({
    is_enabled: false,
    provider: "local" as CaptchaProvider,
    captcha_type: "math" as CaptchaType,
    google_site_key: "",
    google_secret_key: "",
  });
  const [hasGoogleSecretSet, setHasGoogleSecretSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    CaptchaSettingsService.getSettings()
      .then((data) => {
        setSettings({
          is_enabled: !!data.is_enabled,
          provider: (data.provider as CaptchaProvider) || "local",
          captcha_type: (data.captcha_type as CaptchaType) || "math",
          google_site_key: data.google_site_key || "",
          google_secret_key: "",
        });
        setHasGoogleSecretSet(!!data.has_google_secret_set);
      })
      .catch(() => toast.error("Failed to load captcha settings."))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { ...settings };
      if (!payload.google_secret_key) delete payload.google_secret_key;
      const data = await CaptchaSettingsService.updateSettings(payload);
      setSettings((prev) => ({ ...prev, google_secret_key: "" }));
      setHasGoogleSecretSet(!!data.has_google_secret_set);
      toast.success("Captcha settings updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <p className="text-sm text-slate-500">Loading...</p>;
  }

  const isGoogle = settings.provider === "google";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700"
    >
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
          Require captcha on Login and Sign Up
        </span>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Provider
        </label>
        <select
          name="provider"
          value={settings.provider}
          onChange={handleChange}
          className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
        >
          <option value="local">Local — self-hosted, no external service</option>
          <option value="google">Google reCAPTCHA</option>
        </select>
      </div>

      {isGoogle ? (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Site Key
            </label>
            <input
              type="text"
              name="google_site_key"
              value={settings.google_site_key}
              onChange={handleChange}
              placeholder="6Lc..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Secret Key {hasGoogleSecretSet && <span className="text-emerald-600 text-xs font-normal">(currently set)</span>}
            </label>
            <input
              type="password"
              name="google_secret_key"
              value={settings.google_secret_key}
              onChange={handleChange}
              autoComplete="off"
              placeholder={hasGoogleSecretSet ? "Leave blank to keep existing key" : "6Lc..."}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Stored encrypted server-side. Get both keys from the{" "}
              <a
                href="https://www.google.com/recaptcha/admin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google reCAPTCHA admin console
              </a>
              .
            </p>
          </div>
        </>
      ) : (
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Challenge type
          </label>
          <select
            name="captcha_type"
            value={settings.captcha_type}
            onChange={handleChange}
            className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white dark:border-slate-600"
          >
            <option value="math">Math challenge (e.g. 7 + 3)</option>
            <option value="text">Type the code shown (e.g. K3F9Q)</option>
            <option value="random">Random — mix of both</option>
          </select>
        </div>
      )}

      <p className="text-sm text-slate-500">
        {settings.is_enabled ? (
          isGoogle ? (
            <>Google reCAPTCHA is required to log in and to self-register.</>
          ) : (
            <>
              A local challenge is generated by this server — no external service is used. It's
              required to log in and to self-register.
            </>
          )
        ) : (
          <>Captcha is off. Anyone can attempt to log in or sign up without solving a challenge.</>
        )}
      </p>

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
