import { useOceanEye } from '@/context/OceanEyeContext';
import { severityBgClass, statusBgClass, priorityBgClass, formatRelative, confidenceClass, pollutionTypeIcon } from '@/utils/ui';
import {
  Satellite,
  AlertTriangle,
  MapPin,
  TrendingDown,
  Activity,
  Gauge,
  Clock,
  ArrowRight,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export function Dashboard() {
  const { zones, captures, incidents, analyses, setActiveTab, autoPolling, isAnalyzing } = useOceanEye();

  const activeZones = zones.filter((z) => z.active).length;
  const totalCaptures = captures.length;
  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved').length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'Resolved').length;
  const criticalIncidents = incidents.filter((i) => i.severity === 'Critical' && i.status !== 'Resolved');
  const totalAreaAffected = incidents
    .filter((i) => i.status !== 'Resolved')
    .reduce((sum, i) => sum + i.areaSqKm, 0);
  const avgConfidence = analyses.length > 0
    ? Math.round(analyses.reduce((sum, a) => sum + a.confidenceScore, 0) / analyses.length)
    : 0;
  const improvingIncidents = incidents.filter((i) => i.improvementPercentage !== null && i.improvementPercentage > 0);

  const stats = [
    {
      label: 'Active Zones',
      value: activeZones,
      total: zones.length,
      icon: MapPin,
      color: 'sky',
    },
    {
      label: 'Satellite Captures',
      value: totalCaptures,
      icon: Satellite,
      color: 'cyan',
    },
    {
      label: 'Active Incidents',
      value: activeIncidents,
      icon: AlertTriangle,
      color: 'orange',
    },
    {
      label: 'Avg AI Confidence',
      value: `${avgConfidence}%`,
      icon: Gauge,
      color: 'emerald',
    },
    {
      label: 'Area Affected',
      value: `${totalAreaAffected.toFixed(2)} km²`,
      icon: Activity,
      color: 'red',
    },
    {
      label: 'Resolved',
      value: resolvedIncidents,
      icon: CheckCircle2,
      color: 'emerald',
    },
  ];

  const colorMap: Record<string, string> = {
    sky: 'from-sky-500/20 to-sky-500/5 text-sky-400 border-sky-500/20',
    cyan: 'from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20',
    orange: 'from-orange-500/20 to-orange-500/5 text-orange-400 border-orange-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    red: 'from-red-500/20 to-red-500/5 text-red-400 border-red-500/20',
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/30 via-transparent to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-dot" />
                System Online
              </span>
              {isAnalyzing && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/15 text-sky-400 text-xs font-medium border border-sky-500/30">
                  <Activity className="w-3 h-3 animate-pulse" />
                  AI Analysis In Progress
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">OceanEye Platform Overview</h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              AI-Powered Autonomous Satellite Platform for Real-Time Coastal Marine Pollution Detection, Incident Tracking, and Environmental Mitigation Recommendations.
            </p>
            <p className="text-xs text-slate-500 mt-2">
              Monitoring {activeZones} active coastal zones across the Red Sea and Arabian Gulf with autonomous AI analysis
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('satellite')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-sm font-medium"
            >
              <Satellite className="w-4 h-4" />
              View Feed
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50 transition-all text-sm font-medium"
            >
              <MapPin className="w-4 h-4" />
              Open Map
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-xl p-4 glass-panel glass-panel-hover border bg-gradient-to-br ${colorMap[stat.color]}`}
            >
              <Icon className="w-5 h-5 mb-2 opacity-80" />
              <div className="text-2xl font-bold text-slate-100">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical incidents */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Critical & High Severity
            </h3>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {criticalIncidents.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No critical incidents active</p>
            ) : (
              criticalIncidents.map((inc) => (
                <div
                  key={inc.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/60 transition-all"
                >
                  <div className="text-2xl">{pollutionTypeIcon(inc.pollutionType)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-200">{inc.pollutionType}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${severityBgClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{inc.zoneName}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                      <span>{inc.areaSqKm} km²</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelative(inc.detectedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent captures */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Satellite className="w-4 h-4 text-sky-400" />
              Recent Satellite Captures
            </h3>
            <button
              onClick={() => setActiveTab('satellite')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {captures.slice(0, 5).map((cap) => (
              <div
                key={cap.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600/60 transition-all"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={cap.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-200 truncate">{cap.zoneName}</p>
                  <p className="text-xs text-slate-500">{cap.source}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                    cap.status === 'analyzed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                    cap.status === 'analyzing' ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' :
                    cap.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                    'bg-red-500/15 text-red-400 border-red-500/30'
                  }`}>
                    {cap.status}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1">{formatRelative(cap.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Improvement tracking */}
      {improvingIncidents.length > 0 && (
        <div className="glass-panel rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            Cleanup Progress (Re-Monitoring)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {improvingIncidents.map((inc) => (
              <div key={inc.id} className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-200">{inc.zoneName}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusBgClass(inc.status)}`}>
                    {inc.status}
                  </span>
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-2xl font-bold text-emerald-400">
                    +{inc.improvementPercentage}%
                  </span>
                  <span className="text-xs text-slate-500 mb-1">improvement</span>
                </div>
                <div className="text-xs text-slate-400">
                  {inc.reMonitoringPasses.length} re-monitoring pass{inc.reMonitoringPasses.length > 1 ? 'es' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
