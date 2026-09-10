import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { AuthService } from "../api/services";
import CaptchaChallenge, { type CaptchaChallengeHandle } from "../components/CaptchaChallenge";
import GoogleRecaptcha, { type GoogleRecaptchaHandle } from "../components/GoogleRecaptcha";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const navigate = useNavigate();
  const { refreshCurrentUser } = useAuth();

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [signupEnabled, setSignupEnabled] = useState(false);
  const [captchaEnabled, setCaptchaEnabled] = useState(false);
  const [captchaProvider, setCaptchaProvider] = useState<'local' | 'google'>('local');
  const [googleSiteKey, setGoogleSiteKey] = useState('');
  const [captchaId, setCaptchaId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const captchaRef = useRef<CaptchaChallengeHandle>(null);
  const recaptchaRef = useRef<GoogleRecaptchaHandle>(null);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    AuthService.getRegistrationStatus()
      .then((res) => setSignupEnabled(!!res.allow_self_registration))
      .catch(() => setSignupEnabled(false))
      .finally(() => setCheckingStatus(false));

    AuthService.getCaptchaStatus()
      .then((res) => {
        setCaptchaEnabled(!!res.enabled);
        setCaptchaProvider(res.provider === 'google' ? 'google' : 'local');
        setGoogleSiteKey(res.google_site_key || '');
      })
      .catch(() => setCaptchaEnabled(false));
  }, []);

  const isGoogleCaptcha = captchaEnabled && captchaProvider === 'google';
  const isLocalCaptcha = captchaEnabled && captchaProvider === 'local';
  const captchaSatisfied = !captchaEnabled || (isGoogleCaptcha ? !!recaptchaToken : !!captchaAnswer);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const isInvalid =
    !formData.username ||
    !formData.password ||
    !formData.confirm_password ||
    formData.password !== formData.confirm_password ||
    !captchaSatisfied;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.selfRegister({
        ...formData,
        captcha_id: captchaId,
        captcha_answer: captchaAnswer,
        recaptcha_token: recaptchaToken,
      });
      await refreshCurrentUser();
      navigate("/home");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
      if (isLocalCaptcha) {
        setCaptchaAnswer('');
        captchaRef.current?.refresh();
      } else if (isGoogleCaptcha) {
        setRecaptchaToken('');
        recaptchaRef.current?.reset();
      }
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

  if (!signupEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center gap-4 p-8 bg-slate-50 dark:bg-slate-950">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign-Up Unavailable</h1>
        <p className="text-slate-500 max-w-sm">
          Self-registration is currently disabled. Ask an administrator to create an account for you.
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
          <h1 className="text-3xl font-bold tracking-tight mb-2">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400">Sign up to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && (
            <div className="flex items-center gap-3 p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="jane_doe"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="password"
                id="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm_password" className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
              <input
                type="password"
                id="confirm_password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
              />
            </div>
          </div>

          {isLocalCaptcha && (
            <CaptchaChallenge
              ref={captchaRef}
              captchaId={captchaId}
              answer={captchaAnswer}
              onChange={(id, answer) => {
                setCaptchaId(id);
                setCaptchaAnswer(answer);
              }}
            />
          )}

          {isGoogleCaptcha && googleSiteKey && (
            <GoogleRecaptcha ref={recaptchaRef} siteKey={googleSiteKey} onChange={setRecaptchaToken} />
          )}

          <button
            type="submit"
            disabled={loading || isInvalid}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
