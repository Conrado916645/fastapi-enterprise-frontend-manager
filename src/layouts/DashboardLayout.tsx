import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UsersRound, LogOut, Sun, Moon, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export default function DashboardLayout({ isDarkMode, toggleTheme }: LayoutProps) {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const handleLogout = () => {
    // In a real app, you would clear auth tokens here
    navigate('/login');
  };

  // NavLink automatically applies an "active" class when the route matches
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-fluid-sm py-2 rounded-fluid-md transition-colors font-medium text-fluid-sm ${
      isActive 
        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 p-fluid-md">
      
      {/* Responsive Navigation Header */}
      <header className="w-full max-w-6xl mx-auto mb-fluid-lg flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-fluid-sm rounded-fluid-lg shadow-sm border border-slate-200 dark:border-slate-800">
        
        {/* Logo / Brand */}
        <div className="flex items-center px-2">
          <span className="font-extrabold text-fluid-lg text-blue-600 dark:text-blue-400 tracking-tight">
            FluidApp
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <NavLink to="/home" className={navLinkClass}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          
          {hasPermission('system', 'read') && (
            <NavLink to="/users" className={navLinkClass}>
              <Users size={18} />
              <span>User List</span>
            </NavLink>
          )}

          {hasPermission('groups', 'read') && (
            <NavLink to="/groups" className={navLinkClass}>
              <UsersRound size={18} />
              <span>Groups</span>
            </NavLink>
          )}

          <NavLink to="/me" className={navLinkClass}>
            <UserCircle size={18} />
            <span>Profile</span>
          </NavLink>

        </nav>

        {/* Actions (Theme Toggle & Logout) */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-700">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 p-2 px-4 rounded-fluid-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium text-fluid-sm"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>

      </header>

      {/* Main Content Area (Pages get injected here) */}
      <main className="flex-1 flex flex-col w-full max-w-6xl mx-auto">
        <Outlet />
      </main>

    </div>
  );
}