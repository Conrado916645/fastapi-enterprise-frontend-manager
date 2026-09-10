import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PasswordResetService } from "../api/services";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  // The token is one-time-use server-side, so a duplicate call (React 19
  // StrictMode double-invokes effects in dev; a fast remount could too)
  // would legitimately 400 on the second attempt and clobber the real
  // success from the first. Guard so the request only ever fires once.
  const requestedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("This link is missing its verification token.");
      return;
    }

    if (requestedRef.current === token) return;
    requestedRef.current = token;

    PasswordResetService.verifyEmail(token)
      .then((data) => {
        setStatus("success");
        setMessage(data?.message || "Email verified successfully.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.detail || "That verification link is invalid or has expired.");
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 lg:p-12 rounded-lg border border-slate-200 dark:border-slate-800 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Email Verification</h1>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span>Verifying your email...</span>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 size={40} className="text-emerald-500" />
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle size={40} className="text-red-500" />
            <p className="text-slate-600 dark:text-slate-300">{message}</p>
          </div>
        )}

        <Link
          to="/login"
          className="mt-8 inline-block text-blue-600 hover:underline font-medium"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
