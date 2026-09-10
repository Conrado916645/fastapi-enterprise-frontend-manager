import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Edit2, Lock as LockIcon, RefreshCw } from 'lucide-react';
import { SystemService, UserService } from '../api/services';
import { useAuth } from '../context/AuthContext';

type ApiUser = {
  id: string;
  username: string;
  permissions: Record<string, any>;
  is_active: boolean;
  last_login_at: string;
  requires_password_change: boolean;
  locked_until: string | null;
  group_names?: string[];
  effective_permissions?: Record<string, string[]>;
};

export default function UserList() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<{ id: string; username: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await SystemService.getUserList();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const confirmDelete = async () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-fluid-lg w-full animate-fade-in">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-fluid-h1 font-extrabold text-slate-900 dark:text-white">User Management</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={loadUsers} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
            <RefreshCw size={20} />
          </button>
          {hasPermission('system', 'create') && (
            <button
              onClick={() => navigate('/users/register')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700"
            >
              <UserPlus size={18} /> Add User
            </button>
          )}
        </div>
      </header>

      {/* Toolbar */}
      <section className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-950 dark:border-slate-700"
          />
        </div>
      </section>

      {/* Table */}
      <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 animate-pulse">Syncing User Directory...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Username</th>
                <th className="p-4 hidden md:table-cell">Groups</th>
                <th className="p-4 hidden md:table-cell">Last Login</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="p-4 font-semibold">@{user.username}</td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(user.group_names || []).length === 0 ? (
                        <span className="text-slate-400 text-xs">—</span>
                      ) : (
                        user.group_names!.map((name) => (
                          <span
                            key={name}
                            className="px-2 py-0.5 text-[11px] rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                          >
                            {name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-slate-500">{user.last_login_at || 'Never'}</td>
                  <td className="p-4">
                    {user.locked_until ? (
                      <span className="text-red-500 text-xs flex items-center gap-1"><LockIcon size={12} /> Locked</span>
                    ) : user.is_active ? (
                      <span className="text-emerald-500 text-xs">Active</span>
                    ) : (
                      <span className="text-slate-500 text-xs">Inactive</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => navigate(`/users/edit/${user.id}`, { state: { user } })} 
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}