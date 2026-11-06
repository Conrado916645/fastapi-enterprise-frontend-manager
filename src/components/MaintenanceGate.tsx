import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useMaintenance } from "../context/maintenance";
import Maintenance from "../pages/Maintenance";

/**
 * While maintenance is on, everyone except admins (system:update) sees the
 * maintenance page. /login stays reachable so an admin can sign in; the
 * backend refuses non-admin sign-ins during maintenance anyway.
 */
export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const { status } = useMaintenance();
  const { loading, hasPermission } = useAuth();
  const { pathname } = useLocation();

  const blocked =
    !!status?.enabled && !loading && !hasPermission("system", "update") && pathname !== "/login";

  // When maintenance ends, reload so the session and every page start fresh
  // (requests that failed with 503 while blocked aren't retried otherwise).
  const wasBlocked = useRef(false);
  useEffect(() => {
    if (wasBlocked.current && !blocked && status && !status.enabled) {
      window.location.reload();
    }
    wasBlocked.current = blocked;
  }, [blocked, status]);

  return blocked ? <Maintenance /> : <>{children}</>;
}
