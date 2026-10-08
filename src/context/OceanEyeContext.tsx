import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import type {
  MonitoringZone,
  SatelliteCapture,
  PollutionAnalysis,
  Incident,
  IncidentStatus,
  ViewTab,
  ReMonitoringPass,
} from '@/types';
import {
  defaultZones,
  defaultCaptures,
  defaultAnalyses,
  defaultIncidents,
  generateCaptureForZone,
  generateFallbackAnalysis,
  pollutionImages,
  cleanImages,
} from '@/data/fallbackData';
import { analyzeCaptureWithGemini } from '@/services/gemini';

interface OceanEyeContextValue {
  zones: MonitoringZone[];
  captures: SatelliteCapture[];
  analyses: PollutionAnalysis[];
  incidents: Incident[];
  activeTab: ViewTab;
  autoPolling: boolean;
  pollingInterval: number;
  lastPollAt: string | null;
  setActiveTab: (tab: ViewTab) => void;
  togglePolling: () => void;
  setPollingInterval: (ms: number) => void;
  toggleZone: (zoneId: string) => void;
  addZone: (zone: Omit<MonitoringZone, 'id' | 'createdAt' | 'lastCaptureAt' | 'captureCount'>) => void;
  triggerManualCapture: (zoneId: string) => void;
  updateIncidentStatus: (incidentId: string, status: IncidentStatus) => void;
  sendAlert: (incidentId: string) => void;
  triggerReMonitoring: (incidentId: string) => void;
  geminiConfigured: boolean;
  isAnalyzing: boolean;
}

const OceanEyeContext = createContext<OceanEyeContextValue | null>(null);

export function useOceanEye() {
  const ctx = useContext(OceanEyeContext);
  if (!ctx) throw new Error('useOceanEye must be used within OceanEyeProvider');
  return ctx;
}

export function OceanEyeProvider({ children }: { children: ReactNode }) {
  const [zones, setZones] = useState<MonitoringZone[]>(defaultZones);
  const [captures, setCaptures] = useState<SatelliteCapture[]>(defaultCaptures);
  const [analyses, setAnalyses] = useState<PollutionAnalysis[]>(defaultAnalyses);
  const [incidents, setIncidents] = useState<Incident[]>(defaultIncidents);
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [autoPolling, setAutoPolling] = useState(true);
  const [pollingInterval, setPollingInterval] = useState(30000);
  const [lastPollAt, setLastPollAt] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const processCapture = useCallback(async (capture: SatelliteCapture) => {
    setIsAnalyzing(true);

    setCaptures((prev) =>
      prev.map((c) => (c.id === capture.id ? { ...c, status: 'analyzing' } : c))
    );

    // Check if there's an existing incident for this zone that isn't resolved
    const existingIncident = incidents.find(
      (inc) => inc.zoneId === capture.zoneId && inc.status !== 'Resolved'
    );

    const analysis = await analyzeCaptureWithGemini(capture);

    setAnalyses((prev) => [analysis, ...prev]);

    setCaptures((prev) =>
      prev.map((c) =>
        c.id === capture.id
          ? { ...c, status: 'analyzed', analysisId: analysis.id }
          : c
      )
    );

    if (analysis.pollutionDetected) {
      if (existingIncident) {
        // Re-monitoring pass: link to existing incident
        const previousArea = existingIncident.areaSqKm;
        const currentArea = analysis.areaSqKm;
        const improvement =
          previousArea > 0
            ? +(((previousArea - currentArea) / previousArea) * 100).toFixed(2)
            : 0;

        const reMonitoringPass: ReMonitoringPass = {
          id: `rmp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          incidentId: existingIncident.id,
          captureId: capture.id,
          timestamp: new Date().toISOString(),
          previousAreaSqKm: previousArea,
          currentAreaSqKm: currentArea,
          improvementPercentage: improvement,
          analysisId: analysis.id,
          imageUrl: improvement >= 0
            ? cleanImages[Math.floor(Math.random() * cleanImages.length)]
            : pollutionImages[Math.floor(Math.random() * pollutionImages.length)],
          previousImageUrl:
            existingIncident.reMonitoringPasses.length > 0
              ? existingIncident.reMonitoringPasses[existingIncident.reMonitoringPasses.length - 1].imageUrl
              : pollutionImages[Math.floor(Math.random() * pollutionImages.length)],
          pollutionDetected: true,
          pollutionType: analysis.pollutionType,
          severity: analysis.severity,
          confidenceScore: analysis.confidenceScore,
        };

        setIncidents((prev) =>
          prev.map((inc) =>
            inc.id === existingIncident.id
              ? {
                  ...inc,
                  areaSqKm: currentArea,
                  severity: analysis.severity,
                  responsePriority: analysis.responsePriority,
                  confidenceScore: analysis.confidenceScore,
                  environmentalImpactSummary: analysis.environmentalImpactSummary,
                  aiRecommendations: analysis.aiRecommendations,
                  updatedAt: new Date().toISOString(),
                  reMonitoringPasses: [...inc.reMonitoringPasses, reMonitoringPass],
                  improvementPercentage: improvement,
                }
              : inc
          )
        );

        setCaptures((prev) =>
          prev.map((c) =>
            c.id === capture.id
              ? { ...c, linkedIncidentId: existingIncident.id, previousCaptureId: existingIncident.captureId }
              : c
          )
        );
      } else {
        // New incident
        const newIncident: Incident = {
          id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          analysisId: analysis.id,
          captureId: capture.id,
          zoneId: capture.zoneId,
          zoneName: capture.zoneName,
          pollutionType: analysis.pollutionType!,
          areaSqKm: analysis.areaSqKm,
          coordinates: analysis.coordinates,
          boundingBox: analysis.boundingBox,
          geojsonPolygon: analysis.geojsonPolygon,
          severity: analysis.severity,
          responsePriority: analysis.responsePriority,
          confidenceScore: analysis.confidenceScore,
          environmentalImpactSummary: analysis.environmentalImpactSummary,
          aiRecommendations: analysis.aiRecommendations,
          status: 'Detected',
          detectedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          alertSent: false,
          alertSentAt: null,
          reMonitoringPasses: [],
          improvementPercentage: null,
          isFallback: analysis.isFallback,
        };

        setIncidents((prev) => [newIncident, ...prev]);

        setCaptures((prev) =>
          prev.map((c) =>
            c.id === capture.id ? { ...c, linkedIncidentId: newIncident.id } : c
          )
        );

        // Auto-trigger alert for High/Critical
        if (analysis.severity === 'High' || analysis.severity === 'Critical') {
          setTimeout(() => {
            setIncidents((prev) =>
              prev.map((inc) =>
                inc.id === newIncident.id
                  ? {
                      ...inc,
                      alertSent: true,
                      alertSentAt: new Date().toISOString(),
                    }
                  : inc
              )
            );
          }, 500);
        }
      }
    }

    setIsAnalyzing(false);
  }, [incidents, captures]);

  const pollAndProcess = useCallback(() => {
    const activeZones = zones.filter((z) => z.active);
    if (activeZones.length === 0) return;

    // Pick a random active zone for this poll cycle
    const zone = activeZones[Math.floor(Math.random() * activeZones.length)];
    const newCapture = generateCaptureForZone(zone);

    setCaptures((prev) => [newCapture, ...prev]);
    setZones((prev) =>
      prev.map((z) =>
        z.id === zone.id
          ? {
              ...z,
              lastCaptureAt: newCapture.timestamp,
              captureCount: z.captureCount + 1,
            }
          : z
      )
    );
    setLastPollAt(newCapture.timestamp);

    // Process through AI pipeline
    processCapture(newCapture);
  }, [zones, processCapture]);

  // Auto-polling scheduler
  useEffect(() => {
    if (!autoPolling) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }

    pollingRef.current = setInterval(() => {
      pollAndProcess();
    }, pollingInterval);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [autoPolling, pollingInterval, pollAndProcess]);

  const togglePolling = () => setAutoPolling((p) => !p);

  const toggleZone = (zoneId: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, active: !z.active } : z))
    );
  };

  const addZone = (zone: Omit<MonitoringZone, 'id' | 'createdAt' | 'lastCaptureAt' | 'captureCount'>) => {
    const newZone: MonitoringZone = {
      ...zone,
      id: `zone-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      lastCaptureAt: null,
      captureCount: 0,
    };
    setZones((prev) => [...prev, newZone]);
  };

  const triggerManualCapture = (zoneId: string) => {
    const zone = zones.find((z) => z.id === zoneId);
    if (!zone) return;
    const newCapture = generateCaptureForZone(zone);
    setCaptures((prev) => [newCapture, ...prev]);
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId
          ? { ...z, lastCaptureAt: newCapture.timestamp, captureCount: z.captureCount + 1 }
          : z
      )
    );
    setLastPollAt(newCapture.timestamp);
    processCapture(newCapture);
  };

  const updateIncidentStatus = (incidentId: string, status: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, status, updatedAt: new Date().toISOString() }
          : inc
      )
    );
  };

  const sendAlert = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? { ...inc, alertSent: true, alertSentAt: new Date().toISOString() }
          : inc
      )
    );
  };

  const triggerReMonitoring = (incidentId: string) => {
    const incident = incidents.find((i) => i.id === incidentId);
    if (!incident) return;
    const zone = zones.find((z) => z.id === incident.zoneId);
    if (!zone) return;

    const newCapture = generateCaptureForZone(zone);
    // Mark as re-monitoring capture linked to the incident
    newCapture.previousCaptureId = incident.captureId;
    newCapture.linkedIncidentId = incidentId;

    setCaptures((prev) => [newCapture, ...prev]);
    setZones((prev) =>
      prev.map((z) =>
        z.id === zone.id
          ? { ...z, lastCaptureAt: newCapture.timestamp, captureCount: z.captureCount + 1 }
          : z
      )
    );
    setLastPollAt(newCapture.timestamp);
    processCapture(newCapture);
  };

  const value: OceanEyeContextValue = {
    zones,
    captures,
    analyses,
    incidents,
    activeTab,
    autoPolling,
    pollingInterval,
    lastPollAt,
    setActiveTab,
    togglePolling,
    setPollingInterval,
    toggleZone,
    addZone,
    triggerManualCapture,
    updateIncidentStatus,
    sendAlert,
    triggerReMonitoring,
    geminiConfigured: true,
    isAnalyzing,
  };

  return <OceanEyeContext.Provider value={value}>{children}</OceanEyeContext.Provider>;
}
