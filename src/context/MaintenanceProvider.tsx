import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MaintenanceService, type MaintenanceStatus } from "../api/services";
import { MaintenanceContext } from "./maintenance";

// Only poll while maintenance is ON (so the maintenance page notices when
// it ends, and the admin banner stays accurate). While it's off, the next
// API call that gets a 503 MAINTENANCE_MODE triggers a refresh instead.
const POLL_WHILE_ACTIVE_MS = 20_000;

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);

  const refresh = useCallback(
    () =>
      MaintenanceService.getStatus()
        .then(setStatus)
        // If the status endpoint itself fails, assume "not in maintenance" —
        // a real outage is handled by the backend-offline screen.
        .catch(() => setStatus((prev) => prev ?? { enabled: false, message: null, ends_at: null })),
    [],
  );

  // Initial check + react to 503 MAINTENANCE_MODE from any API call.
  useEffect(() => {
    refresh();
    const onMaintenance = () => {
      refresh();
    };
    window.addEventListener("MAINTENANCE_MODE", onMaintenance);
    return () => window.removeEventListener("MAINTENANCE_MODE", onMaintenance);
  }, [refresh]);

  const enabled = !!status?.enabled;
  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(refresh, POLL_WHILE_ACTIVE_MS);
    return () => window.clearInterval(timer);
  }, [enabled, refresh]);

  return (
    <MaintenanceContext.Provider value={{ status, refresh }}>{children}</MaintenanceContext.Provider>
  );
}
