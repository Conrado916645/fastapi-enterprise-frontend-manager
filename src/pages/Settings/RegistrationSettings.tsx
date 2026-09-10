import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { RegistrationSettingsService } from "../../api/services";

export default function RegistrationSettings() {
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    RegistrationSettingsService.getSettings()
      .then((data) => setAllowSelfRegistration(!!data.allow_self_registration))
      .catch(() => toast.error("Failed to load registration settings."))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleToggle = async () => {
    const next = !allowSelfRegistration;
    setLoading(true);
    try {
      const data = await RegistrationSettingsService.updateSettings({ allow_self_registration: next });
      setAllowSelfRegistration(!!data.allow_self_registration);
      toast.success(`Self-registration ${next ? "enabled" : "disabled"}.`);
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
    <div className="space-y-5 bg-white dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allowSelfRegistration}
            onChange={handleToggle}
            disabled={loading}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
        </label>
        <span className="text-sm font-medium text-slate-900 dark:text-slate-300">
          Allow users to create their own account
        </span>
      </div>

      <p className="text-sm text-slate-500">
        {allowSelfRegistration ? (
          <>
            Anyone can sign up for their own account at <code>/signup</code>. New self-registered
            accounts start with <strong>no permissions or groups</strong> — you still need to grant
            access afterward from the User List or Groups page.
          </>
        ) : (
          <>
            Self-registration is off. New accounts can only be created by an admin from the User List page.
          </>
        )}
      </p>
    </div>
  );
}
