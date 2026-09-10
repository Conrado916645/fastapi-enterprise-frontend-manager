import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search, Loader2, AlertCircle, UsersRound } from "lucide-react";
import {
  UserRegistrationService,
  InstalledAppsService,
  GroupService,
} from "../api/services";
import { notify } from "../utils/toast";

type ApiGroup = {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, string[]>;
};

export default function Register() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [availableApps, setAvailableApps] = useState<
    Record<string, string[]>
  >({});

  const [permissions, setPermissions] = useState<
    Record<string, string[]>
  >({});

  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirm_password: "",
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      InstalledAppsService.getInstalledApps(),
      GroupService.getGroupList().catch(() => []),
    ])
      .then(([appsRes, groupsRes]: [any, any]) => {
        const apps = appsRes?.installed_apps ?? appsRes ?? {};
        setAvailableApps(apps);
        setGroups(groupsRes || []);
      })
      .catch((err) => {
        console.error("Failed to load apps:", err);
        setError("Could not load application registry.");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const filteredApps = useMemo(() => {
    return Object.entries(availableApps).filter(([app]) =>
      app.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, availableApps]);

  const togglePermission = (app: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[app] || [];

      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      const newState = { ...prev, [app]: updated };

      if (updated.length === 0) {
        delete newState[app];
      }

      return newState;
    });
  };

  const isInvalid =
    !formData.username ||
    !formData.password ||
    !formData.confirm_password ||
    formData.password !== formData.confirm_password;

  const handleRegister = async () => {
    setError(null);

    if (!formData.username || !formData.password || !formData.confirm_password) {
      setError("All fields are required.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await UserRegistrationService.registerUser({
        username: formData.username,
        password: formData.password,
        confirm_password: formData.confirm_password,
        permissions,
        group_ids: selectedGroupIds,
      });
      notify.success("User has been registered.")
      navigate("/users");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed.");
      notify.error("Registration failed.")
    }
  };


  if (loading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );

  return (
    <div className="h-full flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 p-12 rounded-lg border border-slate-200 dark:border-slate-800">

        <h1 className="text-3xl font-bold text-center mb-2">
          Account Registration
        </h1>

        <p className="text-center text-slate-500 mb-8">
          Provision new infrastructure access.
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* INPUTS */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <input
            placeholder="Username"
            className="col-span-2 p-3 bg-slate-50 dark:bg-slate-950 border rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Confirm"
            className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-lg"
            onChange={(e) =>
              setFormData({ ...formData, confirm_password: e.target.value })
            }
          />
        </div>

        {/* GROUPS */}
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <UsersRound size={16} /> Assign to Groups
          </h3>
          {groups.length === 0 ? (
            <p className="text-xs text-slate-500">
              No groups exist yet. Create one from the Groups page to make role assignment easier.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => {
                const isSelected = selectedGroupIds.includes(group.id);
                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    title={group.description || undefined}
                    className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {group.name}
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-xs text-slate-500 mt-2">
            The user inherits whatever permissions each group grants. Use the per-app checkboxes
            below only for one-off overrides.
          </p>
        </div>

        {/* ASSIGNED ACCESS PREVIEW */}
        {Object.keys(permissions).length > 0 && (
          <div className="mb-6 p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
            <h3 className="text-sm font-bold mb-2 text-blue-500">
              Assigned App Access
            </h3>

            {Object.entries(permissions).map(([app, actions]) => (
              <div key={app} className="text-xs">
                <span className="font-bold capitalize">{app}:</span>{" "}
                <span className="text-slate-400">
                  {actions.join(", ")}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-slate-400" size={16} />
          <input
            placeholder="Search apps..."
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 p-2.5 border rounded-lg text-sm"
          />
        </div>

        {/* APPS LIST */}
        <div className="h-[320px] overflow-y-auto space-y-3 pr-2">
          {filteredApps.map(([app, actions]) => (
            <div
              key={app}
              className={`p-4 rounded-lg border ${
                permissions[app]
                  ? "bg-blue-500/5 border-blue-500/30"
                  : "bg-slate-50 dark:bg-slate-950 border-slate-200"
              }`}
            >
              <h4 className="font-bold capitalize text-sm mb-3">{app}</h4>

              <div className="flex gap-2 flex-wrap">
                {actions.map((action) => (
                  <button
                    key={action}
                    type="button"
                    onClick={() => togglePermission(app, action)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${
                      permissions[app]?.includes(action)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-slate-700 text-slate-500"
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleRegister}
          disabled={isInvalid}
          className={`w-full mt-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
            isInvalid
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Create Account <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}