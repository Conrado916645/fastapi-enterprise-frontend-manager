import { useEffect, useMemo, useState } from "react";
import { X, Search, Loader2, UserMinus, UserPlus } from "lucide-react";
import { GroupService, SystemService } from "../../api/services";
import { notify } from "../../utils/toast";

type ApiUser = {
  id: string;
  username: string;
  group_names?: string[];
};

interface GroupMembersModalProps {
  group: { id: string; name: string };
  onClose: () => void;
  onChanged: () => void;
}

export default function GroupMembersModal({ group, onClose, onChanged }: GroupMembersModalProps) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [candidateSearch, setCandidateSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await SystemService.getUserList();
      setUsers(data || []);
    } catch (err) {
      notify.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const members = useMemo(
    () =>
      users
        .filter((u) => (u.group_names || []).includes(group.name))
        .filter((u) => u.username.toLowerCase().includes(memberSearch.toLowerCase())),
    [users, group.name, memberSearch],
  );

  const candidates = useMemo(
    () =>
      users
        .filter((u) => !(u.group_names || []).includes(group.name))
        .filter((u) => u.username.toLowerCase().includes(candidateSearch.toLowerCase())),
    [users, group.name, candidateSearch],
  );

  const handleAdd = async (userId: string) => {
    setBusyUserId(userId);
    try {
      await GroupService.addMembers(group.id, [userId]);
      notify.success("User added to group.");
      await loadUsers();
      onChanged();
    } catch (err: any) {
      notify.error(err.response?.data?.detail || "Failed to add user.");
    } finally {
      setBusyUserId(null);
    }
  };

  const handleRemove = async (userId: string) => {
    setBusyUserId(userId);
    try {
      await GroupService.removeMember(group.id, userId);
      notify.success("User removed from group.");
      await loadUsers();
      onChanged();
    } catch (err: any) {
      notify.error(err.response?.data?.detail || "Failed to remove user.");
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl p-6 shadow-2xl border dark:border-slate-800 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl font-bold dark:text-white">
            Manage Members — <span className="text-blue-600">{group.name}</span>
          </h2>
          <button onClick={onClose}>
            <X size={20} className="dark:text-white" />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">
            Loading users...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 overflow-hidden flex-grow">
            {/* Current members */}
            <div className="flex flex-col overflow-hidden">
              <h3 className="font-bold text-sm mb-2 dark:text-white">
                Members ({members.length})
              </h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-9 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 dark:text-white"
                />
              </div>
              <div className="overflow-y-auto custom-scrollbar space-y-2 flex-grow">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    No members yet.
                  </p>
                ) : (
                  members.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <span className="text-sm font-medium dark:text-white">@{u.username}</span>
                      <button
                        onClick={() => handleRemove(u.id)}
                        disabled={busyUserId === u.id}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                        title="Remove from group"
                      >
                        {busyUserId === u.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <UserMinus size={16} />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Candidates to add */}
            <div className="flex flex-col overflow-hidden">
              <h3 className="font-bold text-sm mb-2 dark:text-white">Add Users</h3>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-9 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 dark:text-white"
                />
              </div>
              <div className="overflow-y-auto custom-scrollbar space-y-2 flex-grow">
                {candidates.length === 0 ? (
                  <p className="text-sm text-slate-500 py-6 text-center">
                    No more users to add.
                  </p>
                ) : (
                  candidates.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                    >
                      <span className="text-sm font-medium dark:text-white">@{u.username}</span>
                      <button
                        onClick={() => handleAdd(u.id)}
                        disabled={busyUserId === u.id}
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        title="Add to group"
                      >
                        {busyUserId === u.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <UserPlus size={16} />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
