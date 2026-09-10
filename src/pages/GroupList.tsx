import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, RefreshCw, UsersRound } from "lucide-react";
import { GroupService } from "../api/services";
import { notify } from "../utils/toast";
import GroupFormModal from "../components/Groups/GroupFormModal";
import GroupMembersModal from "../components/Groups/GroupMembersModal";
import { useAuth } from "../context/AuthContext";

type ApiGroup = {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, string[]>;
  member_count: number;
  created_at: string;
};

export default function GroupList() {
  const { hasPermission } = useAuth();
  const [groups, setGroups] = useState<ApiGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingGroup, setEditingGroup] = useState<ApiGroup | null | undefined>(undefined);
  const [membersGroup, setMembersGroup] = useState<ApiGroup | null>(null);
  const [groupToDelete, setGroupToDelete] = useState<ApiGroup | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await GroupService.getGroupList();
      setGroups(data || []);
    } catch (err) {
      notify.error("Failed to load groups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleFormSaved = () => {
    setEditingGroup(undefined);
    loadGroups();
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    setDeleting(true);
    try {
      await GroupService.deleteGroup(groupToDelete.id);
      notify.success("Group deleted.");
      setGroupToDelete(null);
      loadGroups();
    } catch (err: any) {
      notify.error(err.response?.data?.detail || "Failed to delete group.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-fluid-lg w-full animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-fluid-h1 font-extrabold text-slate-900 dark:text-white">
            Group Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Assign a permission set to a group, then add users to it — everyone in the group inherits its permissions.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadGroups} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <RefreshCw size={20} />
          </button>
          {hasPermission("groups", "create") && (
            <button
              onClick={() => setEditingGroup(null)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={18} /> Add Group
            </button>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <section className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-700"
          />
        </div>
      </section>

      {/* Table */}
      <section className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No groups found.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4 hidden md:table-cell">Description</th>
                <th className="p-4 hidden md:table-cell">Permissions</th>
                <th className="p-4">Members</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-semibold dark:text-white">{group.name}</td>
                  <td className="p-4 hidden md:table-cell text-slate-500 max-w-xs truncate">
                    {group.description || "—"}
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {Object.keys(group.permissions || {}).length === 0 ? (
                        <span className="text-slate-400 text-xs">No permissions</span>
                      ) : (
                        Object.entries(group.permissions).map(([app, actions]) => (
                          <span
                            key={app}
                            className="px-2 py-0.5 text-[11px] rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                            title={actions.join(", ")}
                          >
                            {app} ({actions.length})
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {hasPermission("groups", "update") ? (
                      <button
                        onClick={() => setMembersGroup(group)}
                        className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors text-sm"
                      >
                        <UsersRound size={16} /> {group.member_count}
                      </button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                        <UsersRound size={16} /> {group.member_count}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      {hasPermission("groups", "update") && (
                        <button
                          onClick={() => setEditingGroup(group)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                      {hasPermission("groups", "delete") && (
                        <button
                          onClick={() => setGroupToDelete(group)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {editingGroup !== undefined && (
        <GroupFormModal
          group={editingGroup}
          onClose={() => setEditingGroup(undefined)}
          onSaved={handleFormSaved}
        />
      )}

      {membersGroup && (
        <GroupMembersModal
          group={membersGroup}
          onClose={() => setMembersGroup(null)}
          onChanged={loadGroups}
        />
      )}

      {groupToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-lg p-6 border dark:border-slate-800">
            <h2 className="text-lg font-bold mb-2 dark:text-white">Delete Group</h2>
            <p className="text-sm text-slate-500 mb-6">
              Delete <span className="font-semibold text-slate-800 dark:text-white">{groupToDelete.name}</span>?
              Members will lose the permissions this group granted them.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setGroupToDelete(null)}
                className="flex-1 py-2.5 rounded-lg border dark:border-slate-700 dark:text-white font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
