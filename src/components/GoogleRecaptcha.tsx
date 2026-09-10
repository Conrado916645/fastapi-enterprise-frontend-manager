import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";

export interface GoogleRecaptchaHandle {
  /** Resets the widget so the user can solve it again, e.g. after a failed submit. */
  reset: () => void;
}

interface GoogleRecaptchaProps {
  siteKey: string;
  onChange: (token: string) => void;
}

declare global {
  interface Window {
    grecaptcha?: any;
  }
}

let scriptLoadingPromise: Promise<void> | null = null;

function loadGoogleRecaptchaScript(): Promise<void> {
  if (window.grecaptcha) return Promise.resolve();
  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google reCAPTCHA script"));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

/**
 * Renders Google's actual reCAPTCHA widget — the one external-service option
 * alongside the local (self-hosted) challenge. Only used when an admin has
 * configured a site key and switched the provider to "google".
 */
const GoogleRecaptcha = forwardRef<GoogleRecaptchaHandle, GoogleRecaptchaProps>(
  ({ siteKey, onChange }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<number | null>(null);
    const [loadError, setLoadError] = useState(false);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (window.grecaptcha && widgetIdRef.current !== null) {
          window.grecaptcha.reset(widgetIdRef.current);
        }
      },
    }));

    useEffect(() => {
      let cancelled = false;

      loadGoogleRecaptchaScript()
        .then(() => {
          if (cancelled) return;
          window.grecaptcha.ready(() => {
            if (cancelled || !containerRef.current || widgetIdRef.current !== null) return;
            widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
              sitekey: siteKey,
              callback: (token: string) => onChange(token),
              "expired-callback": () => onChange(""),
            });
          });
        })
        .catch((err) => {
          console.error(err);
          setLoadError(true);
        });

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [siteKey]);

    if (loadError) {
      return (
        <p className="text-sm text-red-500">
          Couldn't load Google reCAPTCHA. Check your connection and try again.
        </p>
      );
    }

    return <div ref={containerRef} />;
  }
);

export default GoogleRecaptcha;
