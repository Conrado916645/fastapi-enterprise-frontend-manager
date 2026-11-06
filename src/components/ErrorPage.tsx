import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Clock,
  FileQuestion,
  Home,
  LogIn,
  RefreshCw,
  ServerCrash,
  ServerOff,
  ShieldAlert,
  ShieldOff,
  WifiOff,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ErrorCode =
  | 400 | 401 | 403 | 404 | 408 | 429
  | 500 | 502 | 503 | 504
  | "offline";

type Action = "home" | "back" | "login" | "retry";

const CONFIG: Record<string, { title: string; message: string; icon: LucideIcon; tone: string; actions: Action[] }> = {
  "400": { title: "Bad Request", message: "The request couldn't be understood. Check the link or try again.", icon: Ban, tone: "text-amber-500", actions: ["back", "home"] },
  "401": { title: "Sign In Required", message: "You need to sign in to view this page. Your session may have expired.", icon: ShieldOff, tone: "text-red-500", actions: ["login"] },
  "403": { title: "Access Denied", message: "You don't have permission to view this page. Ask an admin to add you to a group that grants it.", icon: ShieldAlert, tone: "text-red-500", actions: ["back", "home"] },
  "404": { title: "Page Not Found", message: "The page you're looking for doesn't exist or has been moved.", icon: FileQuestion, tone: "text-blue-500", actions: ["back", "home"] },
  "408": { title: "Request Timed Out", message: "The server took too long to respond. Please try again.", icon: Clock, tone: "text-amber-500", actions: ["retry", "home"] },
  "429": { title: "Too Many Requests", message: "You're doing that too often. Wait a minute, then try again.", icon: Clock, tone: "text-amber-500", actions: ["retry", "home"] },
  "500": { title: "Something Went Wrong", message: "An unexpected error occurred on our side. Please try again; if it keeps happening, contact an administrator.", icon: ServerCrash, tone: "text-red-500", actions: ["retry", "home"] },
  "502": { title: "Bad Gateway", message: "The server received an invalid response upstream. It's usually temporary.", icon: ServerOff, tone: "text-red-500", actions: ["retry"] },
  "503": { title: "Service Unavailable", message: "The server is temporarily unavailable — it may be restarting or overloaded.", icon: ServerOff, tone: "text-red-500", actions: ["retry"] },
  "504": { title: "Gateway Timeout", message: "The server didn't respond in time. It's usually temporary.", icon: Clock, tone: "text-red-500", actions: ["retry"] },
  offline: { title: "Can't Reach the Server", message: "The API isn't responding. Check your connection — the server may be restarting.", icon: WifiOff, tone: "text-red-500", actions: ["retry"] },
};

interface ErrorPageProps {
  code: ErrorCode | number | string;
  title?: string;
  message?: ReactNode;
  /** Full viewport (standalone) vs. embedded inside the dashboard layout. */
  fullScreen?: boolean;
  /** Overrides the default action buttons for this code. */
  actions?: Action[];
  onRetry?: () => void;
  /** Extra content under the message (e.g. a countdown). */
  children?: ReactNode;
}

const btn =
  "flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors";
const primary = `${btn} bg-blue-600 hover:bg-blue-700 text-white`;
const secondary = `${btn} bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200`;

/** One consistent screen for every HTTP / connectivity error. */
export default function ErrorPage({
  code,
  title,
  message,
  fullScreen = true,
  actions,
  onRetry,
  children,
}: ErrorPageProps) {
  const cfg = CONFIG[String(code)] ?? CONFIG["500"];
  const Icon = cfg.icon;
  const shownActions = actions ?? cfg.actions;
  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("access_token");

  const renderAction = (a: Action, i: number) => {
    const cls = i === 0 ? primary : secondary;
    switch (a) {
      case "home":
        return (
          <Link key={a} to={isLoggedIn ? "/home" : "/login"} className={cls}>
            <Home size={16} /> {isLoggedIn ? "Go to Dashboard" : "Go to Login"}
          </Link>
        );
      case "login":
        return (
          <Link key={a} to="/login" className={cls}>
            <LogIn size={16} /> Go to Login
          </Link>
        );
      case "back":
        return (
          <button key={a} onClick={() => window.history.back()} className={cls}>
            <ArrowLeft size={16} /> Go Back
          </button>
        );
      case "retry":
        return (
          <button key={a} onClick={onRetry ?? (() => window.location.reload())} className={cls}>
            <RefreshCw size={16} /> Try Again
          </button>
        );
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center text-center gap-4 p-8 ${
        fullScreen ? "min-h-screen bg-slate-50 dark:bg-slate-950" : "py-24"
      }`}
    >
      <Icon size={48} className={cfg.tone} />
      {typeof code === "number" && (
        <p className="text-6xl font-extrabold tracking-tight text-slate-300 dark:text-slate-700 select-none">
          {code}
        </p>
      )}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title ?? cfg.title}</h1>
      <div className="text-slate-500 dark:text-slate-400 max-w-md text-sm">{message ?? cfg.message}</div>
      {children}
      {shownActions.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 mt-2">{shownActions.map(renderAction)}</div>
      )}
    </div>
  );
}
