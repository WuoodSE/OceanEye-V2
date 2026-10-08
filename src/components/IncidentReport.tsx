import { useOceanEye } from '@/context/OceanEyeContext';
import {
  severityBgClass,
  statusBgClass,
  priorityBgClass,
  confidenceClass,
  pollutionTypeIcon,
  formatDate,
} from '@/utils/ui';
import type { Incident } from '@/types';
import {
  X,
  FileText,
  Printer,
  Download,
  MapPin,
  Ruler,
  Clock,
  Bot,
  AlertTriangle,
  Satellite,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';

export function IncidentReport({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const { captures, analyses } = useOceanEye();

  const capture = captures.find((c) => c.id === incident.captureId);
  const analysis = analyses.find((a) => a.id === incident.analysisId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const rows: string[] = [];
    rows.push('Field,Value');
    rows.push(`Report ID,${reportId}`);
    rows.push(`Incident ID,${incident.id}`);
    rows.push(`Generated,${formatDate(new Date().toISOString())}`);
    rows.push(`Pollution Type,${incident.pollutionType}`);
    rows.push(`Severity,${incident.severity}`);
    rows.push(`Status,${incident.status}`);
    rows.push(`Priority,${incident.responsePriority}`);
    rows.push(`Area (km²),${incident.areaSqKm}`);
    rows.push(`Confidence Score,${incident.confidenceScore}%`);
    rows.push(`Zone,${incident.zoneName}`);
    rows.push(`Latitude,${incident.coordinates.lat.toFixed(6)}`);
    rows.push(`Longitude,${incident.coordinates.lng.toFixed(6)}`);
    rows.push(`Detected At,${formatDate(incident.detectedAt)}`);
    rows.push(`Updated At,${formatDate(incident.updatedAt)}`);
    rows.push(`Alert Sent,${incident.alertSent ? 'Yes' : 'No'}`);
    if (incident.alertSentAt) rows.push(`Alert Sent At,${formatDate(incident.alertSentAt)}`);
    rows.push(`AI Source,${incident.isFallback ? 'Fallback Model' : 'Gemini AI'}`);
    rows.push(`Environmental Impact,${incident.environmentalImpactSummary.replace(/,/g, ';')}`);
    rows.push('');
    rows.push('Recommendations');
    incident.aiRecommendations.forEach((rec, i) => {
      rows.push(`${i + 1},${rec.replace(/,/g, ';')}`);
    });
    if (incident.reMonitoringPasses.length > 0) {
      rows.push('');
      rows.push('Re-Monitoring Passes');
      rows.push('Pass #,Timestamp,Previous Area (km²),Current Area (km²),Improvement %,Severity,Confidence');
      incident.reMonitoringPasses.forEach((pass, i) => {
        rows.push(`${i + 1},${formatDate(pass.timestamp)},${pass.previousAreaSqKm},${pass.currentAreaSqKm},${pass.improvementPercentage}%,${pass.severity},${pass.confidenceScore}%`);
      });
    }
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reportId = `OEYE-RPT-${incident.id.slice(-8).toUpperCase()}`;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:bg-white print:p-0 print:block print:static" onClick={onClose}>
      <div
        className="glass-panel rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-h-none print:max-w-none print:rounded-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar (non-printable) */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/90 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-semibold text-slate-200">Incident Analysis Report</h3>
            <span className="px-2 py-0.5 rounded-lg bg-slate-800/60 text-slate-400 text-[10px] font-mono border border-slate-700/40">
              {reportId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition-all text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Download CSV
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 hover:bg-sky-500/25 transition-all text-xs font-medium"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 border border-slate-700/40 hover:text-slate-200 hover:bg-slate-700/60 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Report content (printable) */}
        <div className="print-area p-6 space-y-6 print:p-8">
          {/* Report title */}
          <div className="print:border-b-2 print:border-slate-300 print:pb-4">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-6 h-6 text-sky-400 print:hidden" />
                  <h1 className="text-xl font-bold text-slate-100 print:text-2xl print:text-black">
                    OceanEye Marine Pollution Analysis Report
                  </h1>
                </div>
                <p className="text-xs text-slate-500 font-mono">Report ID: {reportId}</p>
                <p className="text-xs text-slate-500 font-mono">Incident ID: {incident.id}</p>
                <p className="text-xs text-slate-500 font-mono">Generated: {formatDate(new Date().toISOString())}</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${severityBgClass(incident.severity)} print:border-2`}>
                  Severity: {incident.severity}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${statusBgClass(incident.status)} print:border-2`}>
                  Status: {incident.status}
                </span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityBgClass(incident.responsePriority)} print:border-2`}>
                  Priority: {incident.responsePriority}
                </span>
              </div>
            </div>
          </div>

          {/* Satellite imagery */}
          {capture && (
            <div>
              <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2 print:text-black">
                <ImageIcon className="w-4 h-4 text-sky-400 print:hidden" />
                Satellite Capture
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-xl overflow-hidden border border-slate-700/40">
                  <img src={capture.imageUrl} alt="Satellite capture" className="w-full h-48 object-cover" />
                  <div className="p-2 bg-slate-800/40">
                    <p className="text-[10px] text-slate-500">{capture.source} | {formatDate(capture.timestamp)}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Satellite className="w-3 h-3" /> Source
                    </p>
                    <p className="text-sm text-slate-300">{capture.source}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Capture Time
                    </p>
                    <p className="text-sm text-slate-300">{formatDate(capture.timestamp)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Acquisition Log</p>
                    <p className="text-xs text-slate-400">{capture.acquisitionLog}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Core pollution data */}
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2 print:text-black">
              <AlertTriangle className="w-4 h-4 text-amber-400 print:hidden" />
              Pollution Analysis Results
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Pollution Type</p>
                <p className="text-sm text-slate-200 flex items-center gap-1.5">
                  <span>{pollutionTypeIcon(incident.pollutionType)}</span>
                  {incident.pollutionType}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Ruler className="w-3 h-3" /> Affected Area
                </p>
                <p className="text-sm text-slate-200 font-mono">{incident.areaSqKm} km²</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Confidence Score</p>
                <p className={`text-sm font-mono ${confidenceClass(incident.confidenceScore)}`}>
                  {incident.confidenceScore}%
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">AI Source</p>
                <p className="text-sm text-slate-300">
                  {incident.isFallback ? 'Fallback Model' : 'Gemini AI'}
                </p>
              </div>
            </div>
          </div>

          {/* Location data */}
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2 print:text-black">
              <MapPin className="w-4 h-4 text-sky-400 print:hidden" />
              Geographic Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Monitoring Zone</p>
                <p className="text-sm text-slate-200">{incident.zoneName}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">GPS Coordinates</p>
                <p className="text-sm text-slate-300 font-mono">
                  {incident.coordinates.lat.toFixed(6)}, {incident.coordinates.lng.toFixed(6)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Bounding Box</p>
                <p className="text-xs text-slate-400 font-mono">
                  N: {incident.boundingBox.north.toFixed(4)} | S: {incident.boundingBox.south.toFixed(4)}
                  <br />
                  E: {incident.boundingBox.east.toFixed(4)} | W: {incident.boundingBox.west.toFixed(4)}
                </p>
              </div>
              {incident.geojsonPolygon && (
                <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Affected Polygon</p>
                  <p className="text-xs text-slate-400">
                    {incident.geojsonPolygon.coordinates.length} coordinate points defining the affected zone
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Environmental impact */}
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2 print:text-black">
              <AlertTriangle className="w-4 h-4 text-amber-400 print:hidden" />
              Environmental Impact Assessment
            </h2>
            <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/40">
              <p className="text-sm text-slate-300 leading-relaxed">{incident.environmentalImpactSummary}</p>
            </div>
          </div>

          {/* AI Recommendations */}
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2 print:text-black">
              <Bot className="w-4 h-4 text-sky-400 print:hidden" />
              AI-Generated Response Recommendations
              <span className="ml-1 px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[9px] border border-sky-500/20 print:hidden">
                AI
              </span>
            </h2>
            <ol className="space-y-2">
              {incident.aiRecommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                  <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-sky-500/15 text-sky-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-300">{rec}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Alert & timeline */}
          <div>
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2 print:text-black">
              <Clock className="w-4 h-4 text-sky-400 print:hidden" />
              Incident Timeline & Alert Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-slate-300">Detected</span>
                  <span className="text-xs text-slate-500 ml-2">{formatDate(incident.detectedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                <div className="w-2 h-2 rounded-full bg-slate-500 flex-shrink-0" />
                <div className="flex-1">
                  <span className="text-sm text-slate-300">Last Updated</span>
                  <span className="text-xs text-slate-500 ml-2">{formatDate(incident.updatedAt)}</span>
                </div>
              </div>
              <div className={`flex items-center gap-3 p-3 rounded-lg border ${incident.alertSent ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-slate-800/40 border-slate-700/40'}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${incident.alertSent ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <div className="flex-1">
                  <span className="text-sm text-slate-300">
                    Alert {incident.alertSent ? 'Sent to Environmental Authority' : 'Not Sent'}
                  </span>
                  {incident.alertSentAt && (
                    <span className="text-xs text-slate-500 ml-2">{formatDate(incident.alertSentAt)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Re-monitoring history */}
          {incident.reMonitoringPasses.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2 print:text-black">
                <RefreshCw className="w-4 h-4 text-emerald-400 print:hidden" />
                Re-Monitoring Pass History
              </h2>
              <div className="space-y-2">
                {incident.reMonitoringPasses.map((pass, i) => (
                  <div key={pass.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/40">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      pass.improvementPercentage > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-slate-300">Pass #{i + 1}</span>
                        <span className="text-xs text-slate-500">{formatDate(pass.timestamp)}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] border ${severityBgClass(pass.severity)}`}>
                          {pass.severity}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Prev: {pass.previousAreaSqKm} km²</span>
                        <span>Current: {pass.currentAreaSqKm} km²</span>
                        {pass.improvementPercentage < 0 ? (
                          <span className="flex items-center gap-1 font-medium text-red-400">
                            <AlertTriangle className="w-3 h-3" />
                            Pollution Escalation (+{Math.abs(pass.improvementPercentage).toFixed(2)}%)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-medium text-emerald-400">
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

          {/* Analysis metadata */}
          {analysis && (
            <div>
              <h2 className="text-sm font-semibold text-slate-200 mb-3 print:text-black">Analysis Metadata</h2>
              <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/40 font-mono text-xs text-slate-400 space-y-1">
                <div>Analysis ID: {analysis.id}</div>
                <div>Capture ID: {incident.captureId}</div>
                <div>Analysis Timestamp: {formatDate(analysis.timestamp)}</div>
                <div>Pollution Detected: {analysis.pollutionDetected ? 'true' : 'false'}</div>
                <div>Analysis Engine: {incident.isFallback ? 'Fallback (structured mock data)' : 'Google Gemini AI'}</div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-slate-700/40 print:border-slate-300">
            <p className="text-[10px] text-slate-500 text-center">
              This report was generated by OceanEye Autonomous Satellite Marine Pollution Detection System.
              <br />
              AI-Generated Recommendations are automated suggestions and should be validated by environmental authorities before action.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
