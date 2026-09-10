import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { Calculator, Type, RefreshCw } from "lucide-react";
import { AuthService } from "../api/services";

export interface CaptchaChallengeHandle {
  /** Fetches a fresh challenge, e.g. after a failed submit. */
  refresh: () => Promise<void>;
}

interface CaptchaChallengeProps {
  captchaId: string;
  answer: string;
  onChange: (captchaId: string, answer: string) => void;
}

/**
 * A local, self-hosted challenge — no external service (no Google/hCaptcha
 * calls). The admin can configure it to always be a math problem, always a
 * "type this code" text challenge, or randomly one or the other each time.
 * Fetches a fresh challenge from /auth/captcha and reports the current
 * captcha_id + typed answer back to the parent form via onChange.
 */
const CaptchaChallenge = forwardRef<CaptchaChallengeHandle, CaptchaChallengeProps>(
  ({ captchaId, answer, onChange }, ref) => {
    const [question, setQuestion] = useState("");
    const [type, setType] = useState<"math" | "text">("math");
    const [loading, setLoading] = useState(true);

    const fetchChallenge = async () => {
      setLoading(true);
      try {
        const data = await AuthService.getCaptcha();
        setQuestion(data.question);
        setType(data.type === "text" ? "text" : "math");
        onChange(data.captcha_id, "");
      } catch (err) {
        console.error("Failed to load captcha:", err);
        setQuestion("");
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({ refresh: fetchChallenge }));

    useEffect(() => {
      fetchChallenge();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isText = type === "text";

    return (
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-slate-600 dark:text-slate-500 uppercase tracking-wider">
          {isText ? "Type the code shown" : "Verify you're human"}
        </label>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm text-slate-900 dark:text-white min-w-[120px] justify-center ${
              isText ? "tracking-[0.3em] select-none" : ""
            }`}
          >
            {isText ? <Type size={16} className="text-slate-400 shrink-0" /> : <Calculator size={16} className="text-slate-400 shrink-0" />}
            {loading ? "..." : isText ? question : `${question} =`}
          </div>
          <input
            type="text"
            inputMode={isText ? "text" : "numeric"}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            required
            value={answer}
            onChange={(e) => onChange(captchaId, e.target.value)}
            placeholder="?"
            className="flex-1 min-w-0 pl-4 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white transition-all"
          />
          <button
            type="button"
            onClick={fetchChallenge}
            disabled={loading}
            title="Get a new challenge"
            className="p-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>
    );
  }
);

export default CaptchaChallenge;
