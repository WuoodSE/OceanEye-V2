import { useState } from 'react';
import { useOceanEye } from '@/context/OceanEyeContext';
import { useAuth } from '@/context/AuthContext';
import {
  severityBgClass,
  statusBgClass,
  priorityBgClass,
  pollutionTypeIcon,
  formatDate,
  formatRelative,
  confidenceClass,
} from '@/utils/ui';
import type { IncidentStatus, PollutionType } from '@/types';
import {
  ClipboardList,
  Plus,
  Search,
  MapPin,
  Ruler,
  Clock,
  CheckCircle2,
  Circle,
  Loader2,
  AlertTriangle,
  Send,
  FileText,
  Filter,
} from 'lucide-react';

const pipelineSteps: IncidentStatus[] = ['Detected', 'Under Investigation', 'In Cleanup', 'Resolved'];

const stepIcons: Record<IncidentStatus, typeof Circle> = {
  'Detected': AlertTriangle,
  'Under Investigation': Search,
  'In Cleanup': Loader2,
  'Resolved': CheckCircle2,
};

export function IncidentTracking() {
  const { incidents, updateIncidentStatus, sendAlert, zones } = useOceanEye();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<IncidentStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  const filtered = incidents.filter((inc) => {
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inc.pollutionType.toLowerCase().includes(q) ||
        inc.zoneName.toLowerCase().includes(q) ||
        inc.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId);

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-sky-400" />
            Requests & Incident Tracking
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track cleanup progress, submit new requests, and monitor real-time status
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Submit New Request
        </button>
      </div>

      {/* Pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {pipelineSteps.map((step) => {
          const count = incidents.filter((i) => i.status === step).length;
          const Icon = stepIcons[step];
          return (
            <div key={step} className="glass-panel rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${step === 'Resolved' ? 'text-emerald-400' : step === 'In Cleanup' ? 'text-orange-400' : step === 'Under Investigation' ? 'text-sky-400' : 'text-amber-400'}`} />
                <span className="text-xs text-slate-400">{step}</span>
              </div>
              <p className="text-2xl font-bold text-slate-100">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incidents, zones, or IDs..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-800/40 border border-slate-700/40">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === 'all' ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
          >
            All
          </button>
          {pipelineSteps.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${filterStatus === s ? 'bg-sky-500/15 text-sky-400' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Incident list with pipeline */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 text-center">
            <ClipboardList className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No incidents matching your filters</p>
          </div>
        ) : (
          filtered.map((inc) => {
            const stepIdx = pipelineSteps.indexOf(inc.status);
            return (
              <div key={inc.id} className="glass-panel rounded-2xl overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-slate-800/30 transition-all"
                  onClick={() => setSelectedIncidentId(selectedIncidentId === inc.id ? null : inc.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-2xl flex-shrink-0">{pollutionTypeIcon(inc.pollutionType)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-sm font-semibold text-slate-200">{inc.pollutionType}</h3>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${severityBgClass(inc.severity)}`}>{inc.severity}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${statusBgClass(inc.status)}`}>{inc.status}</span>
                          <span className="text-[10px] text-slate-600 font-mono">{inc.id}</span>
                        </div>
                        <p className="text-xs text-slate-400">{inc.zoneName}</p>
                        <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />{inc.areaSqKm} km²</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{inc.coordinates.lat.toFixed(4)}, {inc.coordinates.lng.toFixed(4)}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelative(inc.detectedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pipeline progress bar */}
                  <div className="flex items-center gap-1 mt-4">
                    {pipelineSteps.map((step, i) => {
                      const Icon = stepIcons[step];
                      const isComplete = i <= stepIdx;
                      const isCurrent = i === stepIdx;
                      return (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                          <button
                            onClick={(e) => { e.stopPropagation(); updateIncidentStatus(inc.id, step); }}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-all ${
                              isCurrent
                                ? `${statusBgClass(step)} border-2`
                                : isComplete
                                  ? 'bg-slate-700/30 text-slate-300 border-slate-600/40'
                                  : 'bg-slate-800/40 text-slate-600 border-slate-700/30 hover:bg-slate-800/60'
                            }`}
                          >
                            <Icon className={`w-3 h-3 ${isCurrent ? '' : isComplete ? 'text-emerald-400' : ''}`} />
                            {step}
                          </button>
                          {i < pipelineSteps.length - 1 && (
                            <div className={`h-0.5 w-4 ${i < stepIdx ? 'bg-emerald-500/40' : 'bg-slate-700/40'}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Expanded details */}
                {selectedIncidentId === inc.id && (
                  <div className="border-t border-slate-700/40 p-4 space-y-4 fade-in">
                    {/* Status log */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Status Timeline</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                          <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                          <span className="text-xs text-slate-300">Reported / Detected</span>
                          <span className="text-[10px] text-slate-500 ml-auto">{formatDate(inc.detectedAt)}</span>
                        </div>
                        {pipelineSteps.indexOf(inc.status) >= 1 && (
                          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                            <div className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300">Assigned for Investigation</span>
                            <span className="text-[10px] text-slate-500 ml-auto">{formatDate(inc.updatedAt)}</span>
                          </div>
                        )}
                        {pipelineSteps.indexOf(inc.status) >= 2 && (
                          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/40">
                            <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                            <span className="text-xs text-slate-300">Cleanup in Progress</span>
                            <span className="text-[10px] text-slate-500 ml-auto">{formatDate(inc.updatedAt)}</span>
                          </div>
                        )}
                        {inc.status === 'Resolved' && (
                          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="text-xs text-emerald-300">Resolved</span>
                            <span className="text-[10px] text-slate-500 ml-auto">{formatDate(inc.updatedAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {!inc.alertSent && (
                        <button
                          onClick={() => sendAlert(inc.id)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-400 border border-orange-500/30 hover:bg-orange-500/25 transition-all text-xs font-medium"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Send Alert
                        </button>
                      )}
                      {inc.alertSent && (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Alert sent {formatRelative(inc.alertSentAt!)}
                        </span>
                      )}
                    </div>

                    {/* Environmental impact */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-300 mb-2">Environmental Impact</h4>
                      <p className="text-sm text-slate-400 leading-relaxed">{inc.environmentalImpactSummary}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New request form modal */}
      {showForm && (
        <NewRequestForm
          zones={zones}
          onClose={() => setShowForm(false)}
          user={user?.displayName ?? 'Unknown'}
        />
      )}
    </div>
  );
}

function NewRequestForm({ zones, onClose, user: _user }: {
  zones: { id: string; name: string }[];
  onClose: () => void;
  user: string;
}) {
  const { triggerManualCapture, incidents } = useOceanEye();
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? '');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerManualCapture(zoneId);
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel rounded-2xl w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400" />
            Submit New Incident Request
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300">✕</button>
        </div>

        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="text-slate-300 text-sm">Request submitted! A satellite capture has been triggered for the selected zone.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Monitoring Zone</label>
              <select
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm focus:outline-none focus:border-sky-500/50"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1.5 block">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe the suspected pollution or observation..."
                className="w-full px-3 py-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-sky-500/50 resize-none"
              />
            </div>
            <div className="text-xs text-slate-500 bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
              Submitting a request triggers an immediate satellite capture for the selected zone. The AI analysis pipeline will process the imagery and create an incident if pollution is detected.
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 transition-all text-sm font-medium"
            >
              Submit Request & Trigger Capture
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
