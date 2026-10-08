import { useState } from 'react';
import { useOceanEye } from '@/context/OceanEyeContext';
import { IncidentReport } from '@/components/IncidentReport';
import {
  severityBgClass,
  statusBgClass,
  priorityBgClass,
  confidenceClass,
  pollutionTypeIcon,
  formatRelative,
  formatDate,
} from '@/utils/ui';
import type { Incident, IncidentStatus } from '@/types';
import {
  Bell,
  Send,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Bot,
  Clock,
  MapPin,
  Ruler,
  TrendingUp,
  TrendingDown,
  FileText,
} from 'lucide-react';

const statusOrder: IncidentStatus[] = ['Detected', 'Under Investigation', 'In Cleanup', 'Resolved'];

export function IncidentAlerts() {
  const { incidents, updateIncidentStatus, sendAlert, triggerReMonitoring, isAnalyzing } = useOceanEye();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('all');
  const [reportIncident, setReportIncident] = useState<Incident | null>(null);

  const filtered = incidents.filter((inc) => {
    if (filter === 'active') return inc.status !== 'Resolved';
    if (filter === 'critical') return inc.severity === 'Critical' || inc.severity === 'High';
    return true;
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            Incident Alerts & Response Workflow
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {incidents.filter((i) => i.status !== 'Resolved').length} active incidents requiring response
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'critical'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                filter === f
                  ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/40 hover:bg-slate-800/60'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'High/Critical'}
            </button>
          ))}
        </div>
      </div>

      {/* Incident cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-400">No incidents matching this filter</p>
          </div>
        ) : (
          filtered.map((inc) => (
            <IncidentCard
              key={inc.id}
              incident={inc}
              isExpanded={expandedId === inc.id}
              onToggle={() => setExpandedId(expandedId === inc.id ? null : inc.id)}
              onStatusChange={(status) => updateIncidentStatus(inc.id, status)}
              onSendAlert={() => sendAlert(inc.id)}
              onReMonitor={() => triggerReMonitoring(inc.id)}
              onGenerateReport={() => setReportIncident(inc)}
              isAnalyzing={isAnalyzing}
            />
          ))
        )}
      </div>

      {reportIncident && (
        <IncidentReport incident={reportIncident} onClose={() => setReportIncident(null)} />
      )}
    </div>
  );
}

function IncidentCard({
  incident,
  isExpanded,
  onToggle,
  onStatusChange,
  onSendAlert,
  onReMonitor,
  onGenerateReport,
  isAnalyzing,
}: {
  incident: Incident;
  isExpanded: boolean;
  onToggle: () => void;
  onStatusChange: (status: IncidentStatus) => void;
  onSendAlert: () => void;
  onReMonitor: () => void;
  onGenerateReport: () => void;
  isAnalyzing: boolean;
}) {
  const isHighSeverity = incident.severity === 'High' || incident.severity === 'Critical';

  return (
    <div className={`glass-panel rounded-2xl overflow-hidden transition-all ${
      isHighSeverity && incident.status !== 'Resolved' ? 'border-red-500/20' : ''
    }`}>
      {/* Card header */}
      <div
        className="p-4 cursor-pointer hover:bg-slate-800/30 transition-all"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="text-2xl flex-shrink-0">{pollutionTypeIcon(incident.pollutionType)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="text-sm font-semibold text-slate-200">{incident.pollutionType}</h3>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${severityBgClass(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${priorityBgClass(incident.responsePriority)}`}>
                  {incident.responsePriority} Priority
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${statusBgClass(incident.status)}`}>
                  {incident.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{incident.zoneName}</p>
              <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {incident.areaSqKm} km²
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {incident.coordinates.lat.toFixed(4)}, {incident.coordinates.lng.toFixed(4)}
                </span>
                <span className={`flex items-center gap-1 ${confidenceClass(incident.confidenceScore)}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  {incident.confidenceScore}% confidence
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelative(incident.detectedAt)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Alert status */}
            {incident.alertSent ? (
              <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                <Send className="w-3 h-3" />
                Alert Sent
              </span>
            ) : isHighSeverity ? (
              <button
                onClick={(e) => { e.stopPropagation(); onSendAlert(); }}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/15 text-red-400 text-[10px] border border-red-500/30 hover:bg-red-500/25 transition-all"
              >
                <Bell className="w-3 h-3" />
                Send Alert
              </button>
            ) : null}
            {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-slate-700/40 p-4 space-y-4 fade-in">
          {/* Environmental impact */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Environmental Impact Summary
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">{incident.environmentalImpactSummary}</p>
          </div>

          {/* AI Recommendations */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-sky-400" />
              AI-Generated Recommendations
              <span className="ml-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[9px] border border-sky-500/20">
                AI
              </span>
            </h4>
            <ul className="space-y-1.5">
              {incident.aiRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                  <span className="text-sky-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* GPS & Bounding Box */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Latitude</p>
              <p className="text-sm text-slate-300 font-mono">{incident.coordinates.lat.toFixed(6)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Longitude</p>
              <p className="text-sm text-slate-300 font-mono">{incident.coordinates.lng.toFixed(6)}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Area</p>
              <p className="text-sm text-slate-300 font-mono">{incident.areaSqKm} km²</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Detected</p>
              <p className="text-sm text-slate-300">{formatDate(incident.detectedAt)}</p>
            </div>
          </div>

          {/* Bounding box */}
          <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Bounding Box</p>
            <p className="text-xs text-slate-400 font-mono">
              N: {incident.boundingBox.north.toFixed(4)} | S: {incident.boundingBox.south.toFixed(4)} | E: {incident.boundingBox.east.toFixed(4)} | W: {incident.boundingBox.west.toFixed(4)}
            </p>
          </div>

          {/* Status lifecycle management */}
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Status Lifecycle Management</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {statusOrder.map((status, i) => {
                const currentIndex = statusOrder.indexOf(incident.status);
                const isActive = incident.status === status;
                const isPast = i < currentIndex;
                return (
                  <div key={status} className="flex items-center gap-2">
                    <button
                      onClick={() => onStatusChange(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isActive
                          ? statusBgClass(status)
                          : isPast
                            ? 'bg-slate-700/30 text-slate-500 border-slate-600/30'
                            : 'bg-slate-800/40 text-slate-500 border-slate-700/40 hover:bg-slate-800/60'
                      }`}
                    >
                      {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 pulse-dot" />}
                      {status}
                    </button>
                    {i < statusOrder.length - 1 && (
                      <span className="text-slate-600 text-xs">→</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Re-monitoring passes */}
          {incident.reMonitoringPasses.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                Re-Monitoring Passes ({incident.reMonitoringPasses.length})
              </h4>
              <div className="space-y-2">
                {incident.reMonitoringPasses.map((pass) => (
                  <div key={pass.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-slate-300">{formatDate(pass.timestamp)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${severityBgClass(pass.severity)}`}>
                          {pass.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <span>Prev: {pass.previousAreaSqKm} km²</span>
                        <span>→</span>
                        <span>Current: {pass.currentAreaSqKm} km²</span>
                        {pass.improvementPercentage < 0 ? (
                          <span className="flex items-center gap-1 text-red-400 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Escalation
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <TrendingDown className="w-3 h-3" />
                            +{pass.improvementPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-700/40">
            <button
              onClick={onReMonitor}
              disabled={isAnalyzing || incident.status === 'Resolved'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-xs font-medium"
            >
              {isAnalyzing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Trigger Re-Monitoring Pass
            </button>
            {!incident.alertSent && (
              <button
                onClick={onSendAlert}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-all text-xs font-medium"
              >
                <Send className="w-3.5 h-3.5" />
                Send Alert to Authority
              </button>
            )}
            {incident.alertSent && incident.alertSentAt && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                Alert sent to environmental authority {formatRelative(incident.alertSentAt)}
              </span>
            )}
            <button
              onClick={onGenerateReport}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-xs font-medium"
            >
              <FileText className="w-3.5 h-3.5" />
              Generate Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
