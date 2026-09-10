import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AuthService, PasswordResetService } from "../api/services";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { appName } = useAuth();
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    AuthService.getEmailStatus()
      .then((res) => setEmailEnabled(!!res.enabled))
      .catch(() => setEmailEnabled(false))
      .finally(() => setCheckingStatus(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await PasswordResetService.forgotPassword(email);
      // Always shown regardless of whether the email is registered —
      // the backend deliberately doesn't reveal that, to avoid account enumeration.
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!emailEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8 bg-slate-50 dark:bg-slate-950">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Password Reset Unavailable</h1>
        <p className="text-slate-500 max-w-sm">
          This server doesn't have email set up yet, so a reset link couldn't be delivered. Ask an
          administrator to reset your password instead.
        </p>
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 p-10 lg:p-12 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Forgot Password</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Enter your account email and we'll send you a reset link for {appName}.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-3 p-4 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
              <span>If that email is registered, a reset link has been sent. Check your inbox.</span>
            </div>
            <Link
              to="/login"
              className="text-center text-blue-600 hover:underline font-medium"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="flex items-center gap-3 p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
                <AlertCircle size={18} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Remembered your password?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
