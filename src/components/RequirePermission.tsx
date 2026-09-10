import type { ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
    return (
      <div className="flex flex-col items-center justify-center text-center gap-3 py-24">
        <ShieldAlert size={40} className="text-red-500" />
        <h1 className="text-xl font-bold dark:text-white">Access Denied</h1>
        <p className="text-slate-500 text-sm max-w-sm">
          You need the <code className="font-mono">{action}</code> permission on{" "}
          <code className="font-mono">{module}</code> to view this page. Ask an
          admin to add you to a group that grants it.
        </p>
        <Link to="/home" className="text-blue-600 hover:underline text-sm font-medium">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
