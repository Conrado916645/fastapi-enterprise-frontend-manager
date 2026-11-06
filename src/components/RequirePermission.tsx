import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ErrorPage from "./ErrorPage";

interface RequirePermissionProps {
  module: string;
  action: string;
  children: ReactNode;
}

export default function RequirePermission({ module, action, children }: RequirePermissionProps) {
  const { hasPermission, hasAnyAccess, loading, currentUser } = useAuth();

  if (loading) {
    return (
      <div className="p-10 text-center text-slate-500 animate-pulse">
        Checking permissions...
      </div>
    );
  }

  // Not logged in at all (no/expired session) — distinct from being logged
  // in but lacking this specific permission, handled below.
  if (!currentUser) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Logged in but an admin hasn't granted any role/permission at all yet —
  // send them to the friendlier "waiting on approval" screen instead of a
  // generic per-page denial.
  if (!hasAnyAccess(currentUser)) {
    return <Navigate to="/pending-approval" replace />;
  }

  if (!hasPermission(module, action)) {
    // 403, embedded in the dashboard layout (sidebar stays visible).
    return (
      <ErrorPage
        code={403}
        fullScreen={false}
        message={
          <>
            You need the <code className="font-mono">{action}</code> permission on{" "}
            <code className="font-mono">{module}</code> to view this page. Ask an admin to add you to a group that
            grants it.
          </>
        }
      />
    );
  }

  return <>{children}</>;
}
