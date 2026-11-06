import { useState } from "react";
import { Link } from "react-router-dom";
import { LogIn, RefreshCw, Wrench } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useMaintenance } from "../context/maintenance";

function formatEta(endsAt: string | null): string | null {
  if (!endsAt) return null;
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return null;
  const minutes = Math.round((end.getTime() - Date.now()) / 60000);
  const at = end.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  if (minutes <= 0) return `We expected to be back by ${at} — finishing up now.`;
  if (minutes < 60) return `Expected back in about ${minutes} minute${minutes === 1 ? "" : "s"} (${at}).`;
  return `Expected back around ${at}.`;
}

/** Full-page screen shown to non-admins while maintenance mode is on. */
export default function Maintenance() {
  const { status, refresh } = useMaintenance();
  const { appName } = useAuth();
  const [checking, setChecking] = useState(false);
  const eta = formatEta(status?.ends_at ?? null);

  const checkNow = async () => {
    setChecking(true);
    await refresh();
    setChecking(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-5 p-8 bg-slate-50 dark:bg-slate-950">
      <div className="p-5 rounded-full bg-amber-100 dark:bg-amber-900/30">
        <Wrench size={44} className="text-amber-600 dark:text-amber-400" />
      </div>
      <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">
        503 · Under Maintenance
      </p>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">{appName} is down for maintenance</h1>
      <p className="text-slate-600 dark:text-slate-300 max-w-lg whitespace-pre-line">
        {status?.message || "We're performing scheduled maintenance. Please check back soon."}
      </p>
      {eta && <p className="text-sm text-slate-500 dark:text-slate-400">{eta}</p>}
      <p className="text-xs text-slate-400">This page checks automatically and reloads when we're back.</p>

      <div className="flex flex-wrap justify-center gap-3 mt-2">
        <button
          onClick={checkNow}
          disabled={checking}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-60"
        >
          <RefreshCw size={16} className={checking ? "animate-spin" : ""} /> Check Now
        </button>
        <Link
          to="/login"
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
        >
          <LogIn size={16} /> Administrator Sign In
        </Link>
      </div>
    </div>
  );
}
