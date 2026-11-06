import { createContext, useContext } from "react";
import type { MaintenanceStatus } from "../api/services";

export interface MaintenanceContextValue {
  /** null until the first status check completes. */
  status: MaintenanceStatus | null;
  refresh: () => Promise<void>;
}

export const MaintenanceContext = createContext<MaintenanceContextValue>({
  status: null,
  refresh: async () => {},
});

export function useMaintenance() {
  return useContext(MaintenanceContext);
}
