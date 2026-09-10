import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { UserService, AuthService } from "../api/services";

const DEFAULT_APP_NAME = "App";

type CurrentUser = {
  id: string;
  username: string;
  permissions?: Record<string, string[]>;
  effective_permissions?: Record<string, string[]>;
  group_names?: string[];
  [key: string]: any;
};

interface AuthContextValue {
  currentUser: CurrentUser | null;
  loading: boolean;
  appName: string;
  hasPermission: (module: string, action: string) => boolean;
  hasAnyAccess: (user?: CurrentUser | null) => boolean;
  refreshCurrentUser: () => Promise<CurrentUser | null>;
  clearCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  appName: DEFAULT_APP_NAME,
  hasPermission: () => false,
  hasAnyAccess: () => false,
  refreshCurrentUser: async () => null,
  clearCurrentUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [appName, setAppName] = useState(DEFAULT_APP_NAME);

  const refreshCurrentUser = async (): Promise<CurrentUser | null> => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const data = await UserService.getMe();
      setCurrentUser(data);
      return data;
    } catch (err) {
      setCurrentUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentUser = () => setCurrentUser(null);

  useEffect(() => {
    refreshCurrentUser();

    // Public — fetched regardless of auth state, since it's needed on the
    // login/signup pages too. Falls back to DEFAULT_APP_NAME on failure.
    AuthService.getAppInfo()
      .then((data) => {
        if (data?.app_name) {
          setAppName(data.app_name);
          document.title = data.app_name;
        }
      })
      .catch(() => {});
  }, []);

  // Combines the user's own permissions with everything inherited from their groups.
  const hasPermission = (module: string, action: string) => {
    const perms =
      currentUser?.effective_permissions ?? currentUser?.permissions ?? {};
    return (perms[module] || []).includes(action);
  };

  // True as soon as the user can do ANYTHING at all — one action on one
  // module, direct or via a group. False for a brand-new self-registered
  // account that's still waiting on an admin to grant it a role.
  const hasAnyAccess = (user: CurrentUser | null = currentUser) => {
    const perms = user?.effective_permissions ?? user?.permissions ?? {};
    return Object.values(perms).some(
      (actions) => Array.isArray(actions) && actions.length > 0
    );
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, appName, hasPermission, hasAnyAccess, refreshCurrentUser, clearCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
