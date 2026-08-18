import { useEffect, useMemo, useState } from "react";
import { X, Search, Loader2, Save } from "lucide-react";
import { GroupService, InstalledAppsService } from "../../api/services";
import { notify } from "../../utils/toast";

type ApiGroup = {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, string[]>;
};

interface GroupFormModalProps {
  group: ApiGroup | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function GroupFormModal({ group, onClose, onSaved }: GroupFormModalProps) {
  const isEditing = !!group;

  const [name, setName] = useState(group?.name || "");
  const [description, setDescription] = useState(group?.description || "");
  const [permissions, setPermissions] = useState<Record<string, string[]>>(
    group?.permissions || {},
  );
  const [availableApps, setAvailableApps] = useState<Record<string, string[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingApps, setLoadingApps] = useState(true);

  useEffect(() => {
    InstalledAppsService.getInstalledApps()
      .then((apps: any) => setAvailableApps(apps || {}))
      .catch(() => notify.error("Could not load the permission registry."))
      .finally(() => setLoadingApps(false));
  }, []);

  const filteredApps = useMemo(() => {
    return Object.entries(availableApps).filter(([app]) =>
      app.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, availableApps]);

  const togglePermission = (app: string, action: string) => {
    setPermissions((prev) => {
      const current = prev[app] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];

      const next = { ...prev, [app]: updated };
      if (updated.length === 0) delete next[app];
      return next;
    });
  };

  const isInvalid = !name.trim();

  const handleSave = async () => {
    if (isInvalid) return;
    setLoading(true);

    try {
      if (isEditing) {
        await GroupService.updateGroup(group!.id, {
          name,
          description,
          permissions,
        });
        notify.success("Group updated successfully.");
      } else {
        await GroupService.createGroup({ name, description, permissions });
        notify.success("Group created successfully.");
      }
      onSaved();
    } catch (err: any) {
      notify.error(err.response?.data?.detail || "Failed to save group.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl p-6 shadow-2xl border dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold dark:text-white">
            {isEditing ? "Edit Group" : "New Group"}
          </h2>
          <button onClick={onClose}>
            <X size={20} className="dark:text-white" />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar flex-grow">
          <div className="grid grid-cols-1 gap-4 mb-6">
            <input
              placeholder="Group name (e.g. Editors)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors dark:text-white"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 transition-colors dark:text-white resize-none"
            />
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search applications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors dark:text-white"
            />
          </div>

          {/* Permissions List */}
          <div className="space-y-3">
            {loadingApps ? (
              <div className="text-center text-slate-500 py-8 text-sm">
                Loading permission registry...
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="text-center text-slate-500 py-8 text-sm">
                No applications match your search.
              </div>
            ) : (
              filteredApps.map(([app, actions]) => (
                <div
                  key={app}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <h4 className="font-bold text-slate-800 dark:text-white capitalize w-32 shrink-0">
                    {app}
                  </h4>
                  <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                    {actions.map((action: string) => {
                      const isSelected = (permissions[app] || []).includes(action);
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => togglePermission(app, action)}
                          className={`px-3 py-1 text-xs rounded-full border transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {action}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading || isInvalid}
          className="w-full mt-6 shrink-0 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Save size={18} /> {isEditing ? "Save Changes" : "Create Group"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
