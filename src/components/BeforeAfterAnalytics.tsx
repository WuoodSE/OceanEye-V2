import { useState, useRef } from 'react';
import type { Incident } from '@/types';
import { useOceanEye } from '@/context/OceanEyeContext';
import {
  severityBgClass,
  statusBgClass,
  pollutionTypeIcon,
  formatDate,
  confidenceClass,
} from '@/utils/ui';
import {
  GitCompareArrows,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Image as ImageIcon,
  Ruler,
  Clock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export function BeforeAfterAnalytics() {
  const { incidents, triggerReMonitoring, isAnalyzing } = useOceanEye();
  const monitoredIncidents = incidents.filter((i) => i.reMonitoringPasses.length > 0);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    monitoredIncidents[0]?.id ?? null
  );

  const selectedIncident = monitoredIncidents.find((i) => i.id === selectedIncidentId);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <GitCompareArrows className="w-5 h-5 text-emerald-400" />
          Before/After Comparison Engine
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Re-monitoring passes with dual-panel satellite imagery comparison and improvement tracking
        </p>
      </div>

      {monitoredIncidents.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <GitCompareArrows className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-2">No re-monitoring passes yet</p>
          <p className="text-sm text-slate-500">
            Trigger a re-monitoring pass from the Incident Alerts tab to generate before/after comparisons
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Incident selector sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Monitored Incidents</h3>
            {monitoredIncidents.map((inc) => {
              const isEscalation = inc.improvementPercentage !== null && inc.improvementPercentage < 0;
              return (
                <button
                  key={inc.id}
                  onClick={() => setSelectedIncidentId(inc.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedIncidentId === inc.id
                      ? 'bg-sky-500/15 border-sky-500/30'
                      : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{pollutionTypeIcon(inc.pollutionType)}</span>
                    <span className="text-sm font-medium text-slate-200 truncate">{inc.pollutionType}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{inc.zoneName}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${severityBgClass(inc.severity)}`}>
                      {inc.severity}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] border ${statusBgClass(inc.status)}`}>
                      {inc.status}
                    </span>
                    <span className="text-[10px] text-slate-500">{inc.reMonitoringPasses.length} passes</span>
                  </div>
                  {inc.improvementPercentage !== null && (
                    <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                      isEscalation ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {isEscalation ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Pollution Escalation
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3.5 h-3.5" />
                          +{inc.improvementPercentage}% improvement
                        </>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Comparison view */}
          <div className="lg:col-span-2 space-y-4">
            {selectedIncident && (
              <>
                <BeforeAfterSlider incident={selectedIncident} />

                {/* Pass timeline */}
                <div className="glass-panel rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    Re-Monitoring Timeline
                  </h3>
                  <div className="space-y-3">
                    {/* Original detection */}
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                      <div className="flex-1 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-300">Initial Detection</span>
                          <span className="text-[10px] text-slate-500">{formatDate(selectedIncident.detectedAt)}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400">
                          <span>Area: {selectedIncident.reMonitoringPasses[0]?.previousAreaSqKm ?? selectedIncident.areaSqKm} km²</span>
                          <span className={`px-1.5 py-0.5 rounded border ${severityBgClass(selectedIncident.severity)}`}>
                            {selectedIncident.severity}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Each re-monitoring pass */}
                    {selectedIncident.reMonitoringPasses.map((pass, i) => {
                      const isEscalation = pass.improvementPercentage < 0;
                      return (
                        <div key={pass.id} className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            isEscalation ? 'bg-red-400' : 'bg-emerald-400'
                          }`} />
                          <div className="flex-1 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-slate-300">Pass #{i + 1}</span>
                              <span className="text-[10px] text-slate-500">{formatDate(pass.timestamp)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-2">
                              <span>Prev: {pass.previousAreaSqKm} km²</span>
                              <span>→</span>
                              <span>Current: {pass.currentAreaSqKm} km²</span>
                              {isEscalation ? (
                                <span className="flex items-center gap-1 font-medium text-red-400">
                                  <AlertTriangle className="w-3 h-3" />
                                  Escalation
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 font-medium text-emerald-400">
                                  <TrendingDown className="w-3 h-3" />
                                  +{pass.improvementPercentage}%
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${severityBgClass(pass.severity)}`}>
                                {pass.severity}
                              </span>
                              <span className={`text-[10px] ${confidenceClass(pass.confidenceScore)}`}>
                                {pass.confidenceScore}% confidence
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Trigger new pass */}
                <button
                  onClick={() => triggerReMonitoring(selectedIncident.id)}
                  disabled={isAnalyzing || selectedIncident.status === 'Resolved'}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm font-medium"
                >
                  {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Trigger New Re-Monitoring Pass
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function BeforeAfterSlider({ incident }: { incident: Incident }) {
  const [sliderPos, setSliderPos] = useState(50);
  const [selectedPassIdx, setSelectedPassIdx] = useState(incident.reMonitoringPasses.length - 1);
  const containerRef = useRef<HTMLDivElement>(null);

  const pass = incident.reMonitoringPasses[selectedPassIdx];
  if (!pass) return null;

  const beforeUrl = pass.previousImageUrl;
  const afterUrl = pass.imageUrl;
  const isEscalation = pass.improvementPercentage < 0;

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pct)));
  };

  return (
    <div className="space-y-4">
      {/* Pass selector */}
      {incident.reMonitoringPasses.length > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPassIdx(Math.max(0, selectedPassIdx - 1))}
            disabled={selectedPassIdx === 0}
            className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-300">
            Pass {selectedPassIdx + 1} of {incident.reMonitoringPasses.length}
          </span>
          <button
            onClick={() => setSelectedPassIdx(Math.min(incident.reMonitoringPasses.length - 1, selectedPassIdx + 1))}
            disabled={selectedPassIdx === incident.reMonitoringPasses.length - 1}
            className="p-1.5 rounded-lg bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Comparison slider */}
      <div
        ref={containerRef}
        className="relative rounded-2xl overflow-hidden glass-panel select-none"
        style={{ height: '400px' }}
        onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* After image (full) — shows clean water if improved, polluted if escalated */}
        <img
          src={afterUrl}
          alt="After"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* After-side tint overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute right-0 top-0 w-1/2 h-full ${
            isEscalation
              ? 'bg-gradient-to-l from-red-500/10 to-transparent'
              : 'bg-gradient-to-l from-emerald-500/8 to-transparent'
          }`} />
        </div>

        {/* Before image (clipped) — shows polluted water */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src={beforeUrl}
            alt="Before"
            className="absolute inset-0 h-full object-cover"
            style={{ width: containerRef.current?.clientWidth ?? '100%' }}
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent pointer-events-none" />
        </div>

        {/* Labels */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-medium border border-amber-500/30 backdrop-blur-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          BEFORE — Pollution Visible
        </div>
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-medium border backdrop-blur-sm flex items-center gap-1.5 ${
          isEscalation
            ? 'bg-red-500/20 text-red-300 border-red-500/30'
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isEscalation ? 'bg-red-400' : 'bg-emerald-400'}`} />
          AFTER — {isEscalation ? 'Escalated' : 'Remediated'}
        </div>

        {/* Slider handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-sky-400 pointer-events-none"
          style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center backdrop-blur-sm">
            <Maximize2 className="w-4 h-4 text-sky-400" />
          </div>
        </div>

        {/* Click overlay */}
        <div
          className="absolute inset-0 cursor-ew-resize"
          onClick={(e) => handleMove(e.clientX)}
        />
      </div>

      {/* Metrics comparison */}
      <div className="grid grid-cols-2 gap-4">
        {/* Before */}
        <div className="glass-panel rounded-xl p-4 border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-slate-200">Before</span>
            <span className="text-xs text-slate-500">{formatDate(pass.timestamp)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Area
              </span>
              <span className="text-sm text-slate-200 font-mono">{pass.previousAreaSqKm} km²</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Severity</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${severityBgClass(incident.severity)}`}>
                {incident.severity}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400/80">
              <AlertTriangle className="w-3 h-3" />
              Pollution detected in satellite imagery
            </div>
          </div>
        </div>

        {/* After */}
        <div className={`glass-panel rounded-xl p-4 ${isEscalation ? 'border-red-500/20' : 'border-emerald-500/20'}`}>
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className={`w-4 h-4 ${isEscalation ? 'text-red-400' : 'text-emerald-400'}`} />
            <span className="text-sm font-medium text-slate-200">After</span>
            <span className="text-xs text-slate-500">{formatDate(pass.timestamp)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Area
              </span>
              <span className="text-sm text-slate-200 font-mono">{pass.currentAreaSqKm} km²</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Severity</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] border ${severityBgClass(pass.severity)}`}>
                {pass.severity}
              </span>
            </div>
            <div className={`flex items-center gap-1.5 text-[10px] ${isEscalation ? 'text-red-400/80' : 'text-emerald-400/80'}`}>
              {isEscalation ? <AlertTriangle className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isEscalation ? 'Coverage increased — escalation detected' : 'Reduced coverage — remediation progress'}
            </div>
          </div>
        </div>
      </div>

      {/* Improvement / Escalation metric */}
      <div className={`glass-panel rounded-xl p-4 ${isEscalation ? 'border-red-500/20' : ''}`}>
        {isEscalation ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-sm font-bold border border-red-500/30 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Pollution Escalation / Coverage Increased
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Area grew from {pass.previousAreaSqKm} km² to {pass.currentAreaSqKm} km²
                &nbsp;(+{Math.abs(pass.improvementPercentage).toFixed(2)}% increase)
              </p>
            </div>
            <div className="p-4 rounded-xl bg-red-500/10">
              <TrendingUp className="w-10 h-10 text-red-400" />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Improvement Percentage</p>
              <p className="text-3xl font-bold text-slate-100">
                <span className="text-emerald-400">
                  +{pass.improvementPercentage}%
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-1">
                (({pass.previousAreaSqKm} - {pass.currentAreaSqKm}) / {pass.previousAreaSqKm}) × 100
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-500/10">
              <TrendingDown className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
