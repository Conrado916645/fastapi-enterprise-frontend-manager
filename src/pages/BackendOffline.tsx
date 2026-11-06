import { useCallback, useEffect, useState } from "react";
import ErrorPage from "../components/ErrorPage";
import { API_BASE_URL } from "../api/urls";

const CHECK_EVERY_SECONDS = 10;

// /healthz lives at the API's origin root (outside /api/v1) and needs no auth.
const HEALTH_URL = `${API_BASE_URL.replace(/\/api\/v\d+\/?$/, "")}/healthz`;

interface BackendOfflineProps {
  /** HTTP status that triggered this screen (502/503/504), or none for a network failure. */
  status?: number;
  onRecovered: () => void;
}

/**
 * Shown when the API can't be reached (network error) or a gateway reports
 * it down (502/503/504). Pings /healthz every few seconds and recovers on
 * its own as soon as the server answers — no need for the user to refresh.
 */
export default function BackendOffline({ status, onRecovered }: BackendOfflineProps) {
  const [secondsLeft, setSecondsLeft] = useState(CHECK_EVERY_SECONDS);
  const [checking, setChecking] = useState(false);

  const checkNow = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch(HEALTH_URL, { cache: "no-store" });
      if (res.ok) {
        onRecovered();
        return;
      }
    } catch {
      // still down
    } finally {
      setChecking(false);
      setSecondsLeft(CHECK_EVERY_SECONDS);
    }
  }, [onRecovered]);

  // Two timers: the health check itself, and a 1s tick for the countdown
  // text. (Calling checkNow from inside a state updater would be a side
  // effect — StrictMode runs updaters twice.)
  useEffect(() => {
    const check = window.setInterval(checkNow, CHECK_EVERY_SECONDS * 1000);
    const tick = window.setInterval(() => setSecondsLeft((s) => (s > 1 ? s - 1 : CHECK_EVERY_SECONDS)), 1000);
    return () => {
      window.clearInterval(check);
      window.clearInterval(tick);
    };
  }, [checkNow]);

  const code = status === 502 || status === 503 || status === 504 ? status : "offline";

  return (
    <ErrorPage code={code} onRetry={checkNow}>
      <p className="text-xs text-slate-400">
        {checking ? "Checking..." : `Checking again in ${secondsLeft}s`}
      </p>
    </ErrorPage>
  );
}
