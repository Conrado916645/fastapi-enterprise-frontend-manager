import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, currentUser, hasAnyAccess } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 animate-pulse">
        Checking session...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Logged in, but an admin hasn't granted this account any role/permission
  // yet (e.g. fresh self-registration) — nothing in the app is usable yet.
  if (!hasAnyAccess(currentUser)) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}
