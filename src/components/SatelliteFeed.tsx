import { useState } from 'react';
import { useOceanEye } from '@/context/OceanEyeContext';
import { formatRelative, formatDate } from '@/utils/ui';
import type { MonitoringZone } from '@/types';
import {
  Satellite,
  MapPin,
  Plus,
  Power,
  Radio,
  Clock,
  Image as ImageIcon,
  History,
  ScanLine,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

export function SatelliteFeed() {
  const { zones, captures, triggerManualCapture, toggleZone, addZone, isAnalyzing, autoPolling } = useOceanEye();
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZone, setNewZone] = useState({ name: '', description: '', lat: '', lng: '', radius: '0.15' });

  const handleAddZone = () => {
    const lat = parseFloat(newZone.lat);
    const lng = parseFloat(newZone.lng);
    const radius = parseFloat(newZone.radius);
    if (!newZone.name || isNaN(lat) || isNaN(lng)) return;

    addZone({
      name: newZone.name,
      description: newZone.description || `Custom monitoring zone at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      center: { lat, lng },
      boundingBox: { north: lat + radius, south: lat - radius, east: lng + radius, west: lng - radius },
      active: true,
    });

    setNewZone({ name: '', description: '', lat: '', lng: '', radius: '0.15' });
    setShowAddZone(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Satellite className="w-5 h-5 text-sky-400" />
            Satellite Ingestion & Monitoring Zones
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Automated Copernicus/Sentinel-2 polling across {zones.filter((z) => z.active).length} active zones
          </p>
        </div>
        <button
          onClick={() => setShowAddZone(!showAddZone)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Zone
        </button>
      </div>

      {/* Add zone form */}
      {showAddZone && (
        <div className="glass-panel rounded-2xl p-5 fade-in">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Define New Monitoring Zone</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Zone name (e.g. Dammam Coast)"
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newZone.description}
              onChange={(e) => setNewZone({ ...newZone, description: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Latitude (e.g. 26.42)"
              value={newZone.lat}
              onChange={(e) => setNewZone({ ...newZone, lat: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
            />
            <input
              type="number"
              step="0.0001"
              placeholder="Longitude (e.g. 50.07)"
              value={newZone.lng}
              onChange={(e) => setNewZone({ ...newZone, lng: e.target.value })}
              className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <input
              type="number"
              step="0.01"
              placeholder="Radius (degrees)"
              value={newZone.radius}
              onChange={(e) => setNewZone({ ...newZone, radius: e.target.value })}
              className="w-32 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 text-sm placeholder-slate-500 focus:border-sky-500/50 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddZone(false)}
                className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-400 border border-slate-600/50 text-sm hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddZone}
                className="px-4 py-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 text-sm font-medium hover:bg-sky-500/30"
              >
                Create Zone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zone cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {zones.map((zone) => {
          const zoneCaptures = captures.filter((c) => c.zoneId === zone.id);
          const isExpanded = expandedZone === zone.id;
          return (
            <div key={zone.id} className="glass-panel rounded-2xl overflow-hidden">
              {/* Zone header */}
              <div className="p-4 border-b border-slate-700/40">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      zone.active
                        ? 'bg-sky-500/15 border-sky-500/30 text-sky-400'
                        : 'bg-slate-700/30 border-slate-600/30 text-slate-500'
                    }`}>
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">{zone.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{zone.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Radio className="w-3 h-3" />
                          {zone.center.lat.toFixed(4)}, {zone.center.lng.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {zone.captureCount} captures
                        </span>
                        {zone.lastCaptureAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatRelative(zone.lastCaptureAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button
                      onClick={() => toggleZone(zone.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                        zone.active
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-700/30 text-slate-500 border-slate-600/30'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      {zone.active ? 'Active' : 'Inactive'}
                    </button>
                    <button
                      onClick={() => triggerManualCapture(zone.id)}
                      disabled={!zone.active || isAnalyzing}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      {isAnalyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ScanLine className="w-3 h-3" />}
                      Trigger Pass
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable capture history */}
              <button
                onClick={() => setExpandedZone(isExpanded ? null : zone.id)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-400 hover:bg-slate-800/30 transition-all"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Acquisition History ({zoneCaptures.length})
                </span>
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="max-h-80 overflow-y-auto px-4 pb-4 space-y-2 fade-in">
                  {zoneCaptures.length === 0 ? (
                    <p className="text-xs text-slate-500 py-4 text-center">No captures yet for this zone</p>
                  ) : (
                    zoneCaptures.map((cap) => (
                      <div key={cap.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/30 border border-slate-700/40">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={cap.imageUrl} alt="" className="w-full h-full object-cover" />
                          {cap.status === 'analyzing' && (
                            <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-300">{cap.source}</span>
                            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium border ${
                              cap.status === 'analyzed' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' :
                              cap.status === 'analyzing' ? 'bg-sky-500/15 text-sky-400 border-sky-500/30' :
                              cap.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                              'bg-red-500/15 text-red-400 border-red-500/30'
                            }`}>
                              {cap.status === 'analyzed' && <CheckCircle2 className="w-2.5 h-2.5" />}
                              {cap.status === 'failed' && <XCircle className="w-2.5 h-2.5" />}
                              {cap.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(cap.timestamp)}</p>
                          <p className="text-[10px] text-slate-600 mt-0.5 truncate">{cap.acquisitionLog}</p>
                          {cap.linkedIncidentId && (
                            <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 text-[9px] border border-orange-500/20">
                              Linked to incident
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-polling status banner */}
      <div className="glass-panel rounded-xl p-4 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${autoPolling ? 'bg-emerald-400 pulse-dot' : 'bg-slate-600'}`} />
        <div className="flex-1">
          <p className="text-sm text-slate-300">
            {autoPolling
              ? 'Automated satellite polling is active. New imagery is being acquired and piped to AI analysis automatically.'
              : 'Automated polling is paused. Use "Trigger Pass" on any active zone for manual capture.'}
          </p>
        </div>
      </div>
    </div>
  );
}
