export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ResponsePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type PollutionType =
  | 'Oil Spill'
  | 'Plastic Debris'
  | 'Chemical Runoff'
  | 'Algal Bloom'
  | 'Sediment Plume'
  | 'Thermal Discharge';
export type IncidentStatus = 'Detected' | 'Under Investigation' | 'In Cleanup' | 'Resolved';
export type SatelliteSource = 'Sentinel-2' | 'Copernicus' | 'Landsat-9' | 'MODIS-Aqua';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface GeoPolygon {
  type: 'Polygon';
  coordinates: GeoPoint[];
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MonitoringZone {
  id: string;
  name: string;
  description: string;
  center: GeoPoint;
  boundingBox: BoundingBox;
  active: boolean;
  createdAt: string;
  lastCaptureAt: string | null;
  captureCount: number;
}

export interface SatelliteCapture {
  id: string;
  zoneId: string;
  zoneName: string;
  timestamp: string;
  source: SatelliteSource;
  coordinates: GeoPoint;
  boundingBox: BoundingBox;
  acquisitionLog: string;
  status: 'pending' | 'analyzing' | 'analyzed' | 'failed';
  analysisId: string | null;
  linkedIncidentId: string | null;
  previousCaptureId: string | null;
  imageUrl: string;
}

export interface PollutionAnalysis {
  id: string;
  captureId: string;
  timestamp: string;
  pollutionDetected: boolean;
  pollutionType: PollutionType | null;
  areaSqKm: number;
  coordinates: GeoPoint;
  boundingBox: BoundingBox;
  geojsonPolygon: GeoPolygon | null;
  severity: Severity;
  responsePriority: ResponsePriority;
  confidenceScore: number;
  environmentalImpactSummary: string;
  aiRecommendations: string[];
  isFallback: boolean;
}

export interface Incident {
  id: string;
  analysisId: string;
  captureId: string;
  zoneId: string;
  zoneName: string;
  pollutionType: PollutionType;
  areaSqKm: number;
  coordinates: GeoPoint;
  boundingBox: BoundingBox;
  geojsonPolygon: GeoPolygon | null;
  severity: Severity;
  responsePriority: ResponsePriority;
  confidenceScore: number;
  environmentalImpactSummary: string;
  aiRecommendations: string[];
  status: IncidentStatus;
  detectedAt: string;
  updatedAt: string;
  alertSent: boolean;
  alertSentAt: string | null;
  reMonitoringPasses: ReMonitoringPass[];
  improvementPercentage: number | null;
  isFallback: boolean;
}

export interface ReMonitoringPass {
  id: string;
  incidentId: string;
  captureId: string;
  timestamp: string;
  previousAreaSqKm: number;
  currentAreaSqKm: number;
  improvementPercentage: number;
  analysisId: string;
  imageUrl: string;
  previousImageUrl: string;
  pollutionDetected: boolean;
  pollutionType: PollutionType | null;
  severity: Severity;
  confidenceScore: number;
}

export type ViewTab = 'dashboard' | 'map' | 'satellite' | 'tracking' | 'alerts' | 'analytics';

export interface AppState {
  zones: MonitoringZone[];
  captures: SatelliteCapture[];
  analyses: PollutionAnalysis[];
  incidents: Incident[];
  activeTab: ViewTab;
  autoPolling: boolean;
  pollingInterval: number;
  lastPollAt: string | null;
}
