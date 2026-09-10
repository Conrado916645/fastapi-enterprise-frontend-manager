import { useNavigate } from "react-router-dom";
import { ShieldOff } from "lucide-react";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8 bg-slate-50 dark:bg-slate-950">
      <ShieldOff size={48} className="text-red-500" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">401 — Unauthorized</h1>
      <p className="text-slate-500 max-w-sm">
        You need to sign in to view this page. Your session may have expired or you were never logged in.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
      >
        Go to Login
      </button>
    </div>
  );
}
