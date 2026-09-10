import { useEffect, useState } from 'react';
import { Users, ShieldCheck, ShieldAlert, Server, Terminal, Cpu, MemoryStick, HardDrive, Activity, Monitor, Database } from 'lucide-react';
import { SystemService } from '../api/services';

// 🚨 Define the shape of your data for type safety
interface DashboardData {
  metrics: {
    total_users: number;
    human_users: number;
    service_accounts: number;
    total_apps: number;
  };
  resources: {
    cpu_percent: number;
    memory_percent: number;
    memory_used_mb: number;
    memory_free_mb: number;
    memory_total_mb: number;
    disk_percent: number;
    disk_used_gb: number;
    disk_free_gb: number;
    disk_total_gb: number;
  };
  installed_apps: string[];
  logs: string[];
}

function formatMb(mb: number) {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(0)} MB`;
}

function usageColor(percent: number) {
  if (percent >= 90) return { bar: 'bg-red-500', text: 'text-red-500' };
  if (percent >= 75) return { bar: 'bg-amber-500', text: 'text-amber-500' };
  return { bar: 'bg-emerald-500', text: 'text-emerald-500' };
}

function formatUptime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

interface BackendHealth {
  status: string;
  database: string;
  uptime_seconds: number;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [backendHealth, setBackendHealth] = useState<BackendHealth | null>(null);
  const [backendUnreachable, setBackendUnreachable] = useState(false);
  const [backendForbidden, setBackendForbidden] = useState(false);

  useEffect(() => {
    SystemService.getDashboardMetrics()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.error("Dashboard Load Error:", err);
        setLoadError(
          err.response?.status === 403
            ? "You don't have permission to view these metrics yet. Ask an admin to add you to a group that grants system access."
            : "Couldn't load the dashboard. Please try again shortly."
        );
      })
      .finally(() => setLoading(false));

    // Checked independently so a failed ping shows as "Offline" instead of
    // blocking the rest of the dashboard from rendering.
    SystemService.getBackendHealth()
      .then((res) => setBackendHealth(res))
      .catch((err) => {
        console.error("Backend Health Check Error:", err);
        // Only a real network failure means the backend is unreachable — a
        // 403 (no permission) or any other HTTP error means it's up and
        // responding, just declining this particular request.
        if (!err.response) {
          setBackendUnreachable(true);
        } else if (err.response.status === 403) {
          setBackendForbidden(true);
        }
      });
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center text-slate-400 animate-pulse font-mono">
      Initializing System Monitor...
    </div>
  );

  if (loadError || !data) return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3 max-w-md mx-auto">
      <ShieldAlert size={40} className="text-amber-500" />
      <h1 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Unavailable</h1>
      <p className="text-slate-500 text-sm">{loadError || "Something went wrong loading the dashboard."}</p>
    </div>
  );

  const stats = [
    { title: 'Total Users', value: data.metrics.total_users, icon: Users, color: 'bg-blue-500' },
    { title: 'Human Users', value: data.metrics.human_users, icon: Users, color: 'bg-indigo-500' },
    { title: 'Service Accounts', value: data.metrics.service_accounts, icon: ShieldCheck, color: 'bg-emerald-500' },
    { title: 'Total Apps', value: data.metrics.total_apps, icon: Server, color: 'bg-orange-500' },
  ];

  const resourceCards = [
    {
      title: 'CPU',
      icon: Cpu,
      percent: data.resources.cpu_percent,
      used: `${data.resources.cpu_percent.toFixed(1)}%`,
      free: `${(100 - data.resources.cpu_percent).toFixed(1)}%`,
      total: null as string | null,
    },
    {
      title: 'Memory',
      icon: MemoryStick,
      percent: data.resources.memory_percent,
      used: formatMb(data.resources.memory_used_mb),
      free: formatMb(data.resources.memory_free_mb),
      total: formatMb(data.resources.memory_total_mb),
    },
    {
      title: 'Storage',
      icon: HardDrive,
      percent: data.resources.disk_percent,
      used: `${data.resources.disk_used_gb.toFixed(1)} GB`,
      free: `${data.resources.disk_free_gb.toFixed(1)} GB`,
      total: `${data.resources.disk_total_gb.toFixed(1)} GB`,
    },
  ];

  return (
    <div className="w-full">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">System Overview</h1>
        <p className="text-slate-500 mt-2">Real-time health monitoring and audit trail.</p>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
          System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backend API */}
          <div className="rounded-lg bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Activity size={18} />
                <span className="text-sm font-medium uppercase tracking-widest">Backend API</span>
              </div>
              {backendUnreachable ? (
                <span className="flex items-center gap-1.5 text-sm font-bold text-red-500">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Offline
                </span>
              ) : backendForbidden ? (
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> No Access
                </span>
              ) : !backendHealth ? (
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" /> Checking...
                </span>
              ) : backendHealth.status === 'healthy' ? (
                <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm font-bold text-amber-500">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Degraded
                </span>
              )}
            </div>
            {backendHealth && (
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Database size={14} />
                  Database: {backendHealth.database}
                </span>
                <span>Uptime: {formatUptime(backendHealth.uptime_seconds)}</span>
              </div>
            )}
            {backendUnreachable && (
              <p className="text-sm text-slate-500">Could not reach the API.</p>
            )}
          </div>

          {/* Frontend App */}
          <div className="rounded-lg bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Monitor size={18} />
                <span className="text-sm font-medium uppercase tracking-widest">Frontend App</span>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Online
              </span>
            </div>
            <p className="text-sm text-slate-500">Rendering normally in this browser.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="relative overflow-hidden rounded-lg bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`}></div>
            <div className="text-slate-400">
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-medium text-slate-500 mt-4 uppercase tracking-widest">{stat.title}</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">
          Server Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {resourceCards.map((res) => {
            const colors = usageColor(res.percent);
            return (
              <div
                key={res.title}
                className="rounded-lg bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <res.icon size={18} />
                    <span className="text-sm font-medium uppercase tracking-widest">{res.title}</span>
                  </div>
                  <span className={`text-lg font-extrabold ${colors.text}`}>
                    {res.percent.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-4">
                  <div
                    className={`h-full rounded-full ${colors.bar}`}
                    style={{ width: `${Math.min(100, res.percent)}%` }}
                  />
                </div>
                <div className={`grid gap-2 ${res.total ? 'grid-cols-3' : 'grid-cols-2'}`}>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Used</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{res.used}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{res.free}</p>
                  </div>
                  {res.total && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{res.total}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

<section className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
    <div className="flex items-center gap-3">
      <Terminal size={16} className="text-emerald-500" />
      <h2 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Live Audit Stream</h2>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-emerald-500" />
      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
    </div>
  </div>

  {/* 2. Terminal Output */}
  <div className="p-6 font-mono text-[11px] bg-slate-950 overflow-x-auto max-h-[400px] overflow-y-auto">
    {data.logs.map((log, i) => {
      // Logic to color-code based on content
      const isError = log.includes("ERROR") || log.includes("403") || log.includes("422");
      const isWarning = log.includes("WARNING");
      
      return (
        <p key={i} className={`py-1 border-b border-white/5 transition-colors flex gap-3 ${
          isError ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-500/80"
        }`}>
          <span className="opacity-40 shrink-0">{(i + 1).toString().padStart(2, '0')}</span>
          <span className="font-bold shrink-0">{isError ? "[ERR]" : isWarning ? "[WRN]" : "[INF]"}</span>
          <span className="truncate">{log}</span>
        </p>
      );
    })}
  </div>
</section>
    </div>
  );
}