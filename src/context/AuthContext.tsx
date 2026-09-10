import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { UserService } from "../api/services";

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
  hasPermission: (module: string, action: string) => boolean;
  refreshCurrentUser: () => Promise<void>;
  clearCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  currentUser: null,
  loading: true,
  hasPermission: () => false,
  refreshCurrentUser: async () => {},
  clearCurrentUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCurrentUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await UserService.getMe();
      setCurrentUser(data);
    } catch (err) {
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentUser = () => setCurrentUser(null);

  useEffect(() => {
    refreshCurrentUser();
  }, []);

  // Combines the user's own permissions with everything inherited from their groups.
  const hasPermission = (module: string, action: string) => {
    const perms =
      currentUser?.effective_permissions ?? currentUser?.permissions ?? {};
    return (perms[module] || []).includes(action);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, loading, hasPermission, refreshCurrentUser, clearCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
