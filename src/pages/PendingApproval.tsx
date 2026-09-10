import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hourglass, RefreshCw, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PendingApproval() {
  const navigate = useNavigate();
  const { currentUser, hasAnyAccess, refreshCurrentUser, clearCurrentUser } = useAuth();
  const [checking, setChecking] = useState(false);

  // If an admin has since granted access (e.g. checked in another tab),
  // move on to the dashboard as soon as we notice.
  useEffect(() => {
    if (currentUser && hasAnyAccess(currentUser)) {
      navigate("/home", { replace: true });
    }
  }, [currentUser]);

  const handleCheckAgain = async () => {
    setChecking(true);
    const user = await refreshCurrentUser();
    setChecking(false);
    if (user && hasAnyAccess(user)) {
      navigate("/home", { replace: true });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    clearCurrentUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8 bg-slate-50 dark:bg-slate-950">
      <Hourglass size={48} className="text-amber-500" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Waiting on Admin Approval</h1>
      <p className="text-slate-500 max-w-md">
        {currentUser?.username && <>Welcome, @{currentUser.username}. </>}
        Your account has been created, but an administrator needs to assign you a role before you can
        use anything here. Check back soon, or reach out to your admin directly.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={handleCheckAgain}
          disabled={checking}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={checking ? "animate-spin" : ""} /> Check Again
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-6 py-3 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}
