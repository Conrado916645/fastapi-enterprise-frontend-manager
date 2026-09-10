import { useState } from "react";
import { apiClient } from "../api/client";
import { Loader2 } from "lucide-react";
import { notify } from "../utils/toast";

export default function ChangePasswordModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      notify.error("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.post("/users/me/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      notify.success("Password updated successfully!");
      onClose();
      window.location.reload();
    } catch (err: any) {
      notify.error(
        err.response?.data?.detail ||
          "Failed to update password. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 p-8 rounded-lg w-full max-w-sm border border-slate-200 dark:border-slate-800"
      >
        <h2 className="text-xl font-bold mb-2 dark:text-white">
          Security Update Required
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Verify your current credentials to set a new password.
        </p>

        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 mb-6 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold flex justify-center hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Set New Password"}
        </button>
      </form>
    </div>
  );
}
