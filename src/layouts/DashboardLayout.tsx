import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UsersRound,
  Settings,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function DashboardLayout({ isDarkMode, toggleTheme }: LayoutProps) {
  const navigate = useNavigate();
  const { hasPermission, clearCurrentUser, appName } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    clearCurrentUser();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  // Every object/section in the app, gated the same way the routes are.
  const navItems = [
    { to: '/home', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/users', label: 'User List', icon: Users, show: hasPermission('system', 'read') },
    { to: '/groups', label: 'Groups', icon: UsersRound, show: hasPermission('groups', 'read') },
    { to: '/settings', label: 'Settings', icon: Settings, show: hasPermission('system', 'read') },
    { to: '/me', label: 'Profile', icon: UserCircle, show: true },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 h-screen flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2 px-6 h-16 shrink-0 border-b border-slate-200 dark:border-slate-800">
          <Server className="text-blue-600" size={22} />
          <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight truncate">
            {appName}
          </span>
        </div>

        <nav className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                <item.icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 shrink-0">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Pages get injected here) */}
      <main className="flex-1 h-screen overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
