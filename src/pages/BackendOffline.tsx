import { ServerOff, RefreshCw } from "lucide-react";

export default function BackendOffline({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8 bg-slate-50 dark:bg-slate-950">
      <ServerOff size={48} className="text-red-500" />
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Can't Reach the Server</h1>
      <p className="text-slate-500 max-w-sm">
        The backend API isn't responding. It may be restarting or temporarily offline — please try again in a moment.
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
      >
        <RefreshCw size={18} /> Retry
      </button>
    </div>
  );
}
