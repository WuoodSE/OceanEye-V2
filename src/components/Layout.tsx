import { useOceanEye } from '@/context/OceanEyeContext';
import { useAuth } from '@/context/AuthContext';
import type { ViewTab } from '@/types';
import {
  LayoutDashboard,
  Satellite,
  Map as MapIcon,
  ClipboardList,
  Bell,
  GitCompareArrows,
  Waves,
  Activity,
  CircleDot,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

const tabs: { id: ViewTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'map', label: 'Live Map', icon: MapIcon },
  { id: 'satellite', label: 'Satellite Feed', icon: Satellite },
  { id: 'tracking', label: 'Incident & Request Tracking', icon: ClipboardList },
  { id: 'alerts', label: 'Incident Alerts', icon: Bell },
  { id: 'analytics', label: 'Reports & Analytics', icon: GitCompareArrows },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab, autoPolling, togglePolling, incidents, isAnalyzing, lastPollAt } = useOceanEye();
  const { user, signOut } = useAuth();

  const activeIncidents = incidents.filter(
    (i) => i.status !== 'Resolved'
  ).length;
  const criticalCount = incidents.filter(
    (i) => (i.severity === 'Critical' || i.severity === 'High') && i.status !== 'Resolved'
  ).length;

  return (
    <div className="ocean-bg min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/50 print:hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-cyan-500/10 border border-sky-500/30 flex items-center justify-center">
              <Waves className="w-5 h-5 text-sky-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 pulse-dot" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">OceanEye</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">Satellite Pollution Detection</p>
            </div>
          </div>

          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <CircleDot className={`w-3.5 h-3.5 ${autoPolling ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-xs text-slate-300">{autoPolling ? 'Auto-Polling Active' : 'Polling Paused'}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <Activity className={`w-3.5 h-3.5 ${isAnalyzing ? 'text-sky-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-xs text-slate-300">{isAnalyzing ? 'AI Analyzing...' : 'AI Idle'}</span>
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30">
                <Bell className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400 font-medium">{criticalCount} Critical/High</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={togglePolling}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                autoPolling
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-700'
              }`}
            >
              {autoPolling ? 'Pause Polling' : 'Resume Polling'}
            </button>

            {/* User profile */}
            {user && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500/30 to-cyan-500/20 border border-sky-500/30 flex items-center justify-center">
                    <UserIcon className="w-3.5 h-3.5 text-sky-400" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-xs font-medium text-slate-200">{user.displayName}</p>
                    <p className="text-[10px] text-slate-500">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="max-w-[1600px] mx-auto px-4 sm:px-6 pb-2 flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const badge = tab.id === 'alerts' && activeIncidents > 0 ? activeIncidents : null;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {badge && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400 text-[10px] font-bold">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-4 sm:px-6 py-6 print:block">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-700/50 py-3 px-6 print:hidden">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>OceanEye v2.0 — Autonomous Marine Pollution Detection</span>
          <span>
            {lastPollAt ? `Last satellite pass: ${new Date(lastPollAt).toLocaleTimeString()}` : 'No passes yet'}
          </span>
        </div>
      </footer>
    </div>
  );
}
