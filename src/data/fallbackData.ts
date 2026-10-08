import type {
  MonitoringZone,
  SatelliteCapture,
  PollutionAnalysis,
  Incident,
  SatelliteSource,
  PollutionType,
  Severity,
  ResponsePriority,
  GeoPoint,
  BoundingBox,
  GeoPolygon,
} from '@/types';

const now = () => new Date().toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString();

export const defaultZones: MonitoringZone[] = [
  {
    id: 'zone-redsea',
    name: 'Red Sea - KAUST Coast',
    description: 'Coastal monitoring zone covering the KAUST reef and surrounding Red Sea waters.',
    center: { lat: 22.3085, lng: 39.1037 },
    boundingBox: { north: 22.45, south: 22.15, east: 39.25, west: 38.95 },
    active: true,
    createdAt: daysAgo(30),
    lastCaptureAt: hoursAgo(6),
    captureCount: 12,
  },
  {
    id: 'zone-yanbu',
    name: 'Yanbu Industrial Coast',
    description: 'Industrial zone near Yanbu refinery and port facilities.',
    center: { lat: 24.0893, lng: 38.0618 },
    boundingBox: { north: 24.25, south: 23.95, east: 38.20, west: 37.95 },
    active: true,
    createdAt: daysAgo(25),
    lastCaptureAt: hoursAgo(12),
    captureCount: 8,
  },
  {
    id: 'zone-jubail',
    name: 'Jubail Petrochemical Hub',
    description: 'Heavy industrial petrochemical coastline near Jubail.',
    center: { lat: 27.0099, lng: 49.6608 },
    boundingBox: { north: 27.20, south: 26.85, east: 49.80, west: 49.50 },
    active: true,
    createdAt: daysAgo(20),
    lastCaptureAt: hoursAgo(18),
    captureCount: 6,
  },
  {
    id: 'zone-gulf',
    name: 'Arabian Gulf - Eastern Province',
    description: 'Eastern Saudi coastline along the Arabian Gulf.',
    center: { lat: 26.4478, lng: 50.0667 },
    boundingBox: { north: 26.65, south: 26.25, east: 50.25, west: 49.90 },
    active: true,
    createdAt: daysAgo(15),
    lastCaptureAt: hoursAgo(24),
    captureCount: 4,
  },
  {
    id: 'zone-jeddah',
    name: 'Jeddah Coastal Waters',
    description: 'Urban coastal zone near Jeddah port and corniche.',
    center: { lat: 21.5434, lng: 39.1728 },
    boundingBox: { north: 21.70, south: 21.40, east: 39.30, west: 39.05 },
    active: false,
    createdAt: daysAgo(10),
    lastCaptureAt: null,
    captureCount: 0,
  },
];

const sources: SatelliteSource[] = ['Sentinel-2', 'Copernicus', 'Landsat-9', 'MODIS-Aqua'];

function makePolygon(center: GeoPoint, radiusDeg: number): GeoPolygon {
  const r = radiusDeg;
  const c = center;
  return {
    type: 'Polygon',
    coordinates: [
      { lat: c.lat + r, lng: c.lng - r },
      { lat: c.lat + r, lng: c.lng + r },
      { lat: c.lat - r, lng: c.lng + r },
      { lat: c.lat - r, lng: c.lng - r },
      { lat: c.lat + r, lng: c.lng - r },
    ],
  };
}

function makeBBox(center: GeoPoint, radiusDeg: number): BoundingBox {
  return {
    north: center.lat + radiusDeg,
    south: center.lat - radiusDeg,
    east: center.lng + radiusDeg,
    west: center.lng - radiusDeg,
  };
}

// Satellite image placeholder URLs using Pexels ocean/coast imagery
const captureImages = [
  'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/2480744/pexels-photo-2480744.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/189349/pexels-photo-189349.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/210186/pexels-photo-210186.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1438111/pexels-photo-1438111.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

// "Before" images: polluted / contaminated coastal water (visible pollution)
const pollutionImages = [
  'https://images.pexels.com/photos/15304868/pexels-photo-15304868.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/36759207/pexels-photo-36759207.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/36552442/pexels-photo-36552442.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/27798146/pexels-photo-27798146.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

// "After" images: clean / remediated coastal water (clear water after cleanup)
const cleanImages = [
  'https://images.pexels.com/photos/11975542/pexels-photo-11975542.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/27651151/pexels-photo-27651151.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/4604963/pexels-photo-4604963.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/6156390/pexels-photo-6156390.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export const defaultCaptures: SatelliteCapture[] = [
  {
    id: 'cap-001',
    zoneId: 'zone-redsea',
    zoneName: 'Red Sea - KAUST Coast',
    timestamp: hoursAgo(6),
    source: 'Sentinel-2',
    coordinates: { lat: 22.3085, lng: 39.1037 },
    boundingBox: makeBBox({ lat: 22.3085, lng: 39.1037 }, 0.05),
    acquisitionLog: 'Sentinel-2 pass acquired via Copernicus Open Access Hub. Cloud cover: 8%. Resolution: 10m.',
    status: 'analyzed',
    analysisId: 'ana-001',
    linkedIncidentId: 'inc-001',
    previousCaptureId: null,
    imageUrl: captureImages[0],
  },
  {
    id: 'cap-002',
    zoneId: 'zone-yanbu',
    zoneName: 'Yanbu Industrial Coast',
    timestamp: hoursAgo(12),
    source: 'Copernicus',
    coordinates: { lat: 24.0893, lng: 38.0618 },
    boundingBox: makeBBox({ lat: 24.0893, lng: 38.0618 }, 0.05),
    acquisitionLog: 'Copernicus Sentinel-2 L2A product. Cloud cover: 3%. Resolution: 10m.',
    status: 'analyzed',
    analysisId: 'ana-002',
    linkedIncidentId: 'inc-002',
    previousCaptureId: null,
    imageUrl: captureImages[1],
  },
  {
    id: 'cap-003',
    zoneId: 'zone-jubail',
    zoneName: 'Jubail Petrochemical Hub',
    timestamp: hoursAgo(18),
    source: 'Landsat-9',
    coordinates: { lat: 27.0099, lng: 49.6608 },
    boundingBox: makeBBox({ lat: 27.0099, lng: 49.6608 }, 0.05),
    acquisitionLog: 'Landsat-9 OLI-2 acquisition. Cloud cover: 12%. Resolution: 30m.',
    status: 'analyzed',
    analysisId: 'ana-003',
    linkedIncidentId: 'inc-003',
    previousCaptureId: null,
    imageUrl: captureImages[2],
  },
  {
    id: 'cap-004',
    zoneId: 'zone-gulf',
    zoneName: 'Arabian Gulf - Eastern Province',
    timestamp: hoursAgo(24),
    source: 'MODIS-Aqua',
    coordinates: { lat: 26.4478, lng: 50.0667 },
    boundingBox: makeBBox({ lat: 26.4478, lng: 50.0667 }, 0.05),
    acquisitionLog: 'MODIS-Aqua daily pass. Cloud cover: 5%. Resolution: 250m.',
    status: 'analyzed',
    analysisId: 'ana-004',
    linkedIncidentId: 'inc-004',
    previousCaptureId: null,
    imageUrl: captureImages[3],
  },
];

export const defaultAnalyses: PollutionAnalysis[] = [
  {
    id: 'ana-001',
    captureId: 'cap-001',
    timestamp: hoursAgo(5),
    pollutionDetected: true,
    pollutionType: 'Oil Spill',
    areaSqKm: 3.45,
    coordinates: { lat: 22.3085, lng: 39.1037 },
    boundingBox: makeBBox({ lat: 22.3085, lng: 39.1037 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 22.3085, lng: 39.1037 }, 0.04),
    severity: 'High',
    responsePriority: 'High',
    confidenceScore: 92,
    environmentalImpactSummary:
      'Oil slick detected near reef ecosystem. High risk of shoreline contamination affecting coral colonies and marine biodiversity. Immediate containment recommended.',
    aiRecommendations: [
      'Deploy containment booms within 2 hours to prevent shoreline impact.',
      'Notify KAUST Marine Research Center for ecological impact assessment.',
      'Dispatch aerial surveillance drone for real-time slick tracking.',
      'Coordinate with Saudi Coast Guard for source vessel identification.',
    ],
    isFallback: true,
  },
  {
    id: 'ana-002',
    captureId: 'cap-002',
    timestamp: hoursAgo(11),
    pollutionDetected: true,
    pollutionType: 'Chemical Runoff',
    areaSqKm: 1.82,
    coordinates: { lat: 24.0893, lng: 38.0618 },
    boundingBox: makeBBox({ lat: 24.0893, lng: 38.0618 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 24.0893, lng: 38.0618 }, 0.03),
    severity: 'Medium',
    responsePriority: 'Medium',
    confidenceScore: 85,
    environmentalImpactSummary:
      'Chemical discharge plume detected near Yanbu refinery outfall. Moderate risk to nearby fishing grounds and coastal water quality.',
    aiRecommendations: [
      'Sample water quality at discharge point and surrounding area.',
      'Notify Yanbu Aramco Refinery environmental compliance team.',
      'Monitor dissolved oxygen levels in affected zone.',
      'Issue advisory to local fishing operations within 5km radius.',
    ],
    isFallback: true,
  },
  {
    id: 'ana-003',
    captureId: 'cap-003',
    timestamp: hoursAgo(17),
    pollutionDetected: true,
    pollutionType: 'Algal Bloom',
    areaSqKm: 8.75,
    coordinates: { lat: 27.0099, lng: 49.6608 },
    boundingBox: makeBBox({ lat: 27.0099, lng: 49.6608 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 27.0099, lng: 49.6608 }, 0.06),
    severity: 'Critical',
    responsePriority: 'Urgent',
    confidenceScore: 96,
    environmentalImpactSummary:
      'Extensive harmful algal bloom (HAB) detected across Jubail coastal waters. Critical threat to desalination intake, aquaculture facilities, and marine life. Potential toxin exposure risk.',
    aiRecommendations: [
      'IMMEDIATE: Alert Jubail desalination plant operations center.',
      'Suspend aquaculture harvesting in affected zone pending toxin analysis.',
      'Deploy rapid response team for water sampling and phytoplankton identification.',
      'Coordinate with Ministry of Environment for public health advisory.',
      'Monitor bloom trajectory using ocean current models every 6 hours.',
    ],
    isFallback: true,
  },
  {
    id: 'ana-004',
    captureId: 'cap-004',
    timestamp: hoursAgo(23),
    pollutionDetected: true,
    pollutionType: 'Plastic Debris',
    areaSqKm: 0.95,
    coordinates: { lat: 26.4478, lng: 50.0667 },
    boundingBox: makeBBox({ lat: 26.4478, lng: 50.0667 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 26.4478, lng: 50.0667 }, 0.02),
    severity: 'Low',
    responsePriority: 'Low',
    confidenceScore: 78,
    environmentalImpactSummary:
      'Localized plastic debris accumulation detected near coastal current convergence zone. Low immediate threat but contributes to long-term microplastic contamination.',
    aiRecommendations: [
      'Schedule volunteer cleanup operation within 7 days.',
      'Log debris pattern for seasonal accumulation trend analysis.',
      'Notify local municipality for shoreline cleanup coordination.',
    ],
    isFallback: true,
  },
];

export const defaultIncidents: Incident[] = [
  {
    id: 'inc-001',
    analysisId: 'ana-001',
    captureId: 'cap-001',
    zoneId: 'zone-redsea',
    zoneName: 'Red Sea - KAUST Coast',
    pollutionType: 'Oil Spill',
    areaSqKm: 3.45,
    coordinates: { lat: 22.3085, lng: 39.1037 },
    boundingBox: makeBBox({ lat: 22.3085, lng: 39.1037 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 22.3085, lng: 39.1037 }, 0.04),
    severity: 'High',
    responsePriority: 'High',
    confidenceScore: 92,
    environmentalImpactSummary:
      'Oil slick detected near reef ecosystem. High risk of shoreline contamination affecting coral colonies and marine biodiversity.',
    aiRecommendations: [
      'Deploy containment booms within 2 hours to prevent shoreline impact.',
      'Notify KAUST Marine Research Center for ecological impact assessment.',
      'Dispatch aerial surveillance drone for real-time slick tracking.',
      'Coordinate with Saudi Coast Guard for source vessel identification.',
    ],
    status: 'Under Investigation',
    detectedAt: hoursAgo(5),
    updatedAt: hoursAgo(3),
    alertSent: true,
    alertSentAt: hoursAgo(5),
    reMonitoringPasses: [],
    improvementPercentage: null,
    isFallback: true,
  },
  {
    id: 'inc-002',
    analysisId: 'ana-002',
    captureId: 'cap-002',
    zoneId: 'zone-yanbu',
    zoneName: 'Yanbu Industrial Coast',
    pollutionType: 'Chemical Runoff',
    areaSqKm: 1.82,
    coordinates: { lat: 24.0893, lng: 38.0618 },
    boundingBox: makeBBox({ lat: 24.0893, lng: 38.0618 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 24.0893, lng: 38.0618 }, 0.03),
    severity: 'Medium',
    responsePriority: 'Medium',
    confidenceScore: 85,
    environmentalImpactSummary:
      'Chemical discharge plume detected near Yanbu refinery outfall. Moderate risk to nearby fishing grounds.',
    aiRecommendations: [
      'Sample water quality at discharge point and surrounding area.',
      'Notify Yanbu Aramco Refinery environmental compliance team.',
      'Monitor dissolved oxygen levels in affected zone.',
      'Issue advisory to local fishing operations within 5km radius.',
    ],
    status: 'Detected',
    detectedAt: hoursAgo(11),
    updatedAt: hoursAgo(11),
    alertSent: false,
    alertSentAt: null,
    reMonitoringPasses: [],
    improvementPercentage: null,
    isFallback: true,
  },
  {
    id: 'inc-003',
    analysisId: 'ana-003',
    captureId: 'cap-003',
    zoneId: 'zone-jubail',
    zoneName: 'Jubail Petrochemical Hub',
    pollutionType: 'Algal Bloom',
    areaSqKm: 8.75,
    coordinates: { lat: 27.0099, lng: 49.6608 },
    boundingBox: makeBBox({ lat: 27.0099, lng: 49.6608 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 27.0099, lng: 49.6608 }, 0.06),
    severity: 'Critical',
    responsePriority: 'Urgent',
    confidenceScore: 96,
    environmentalImpactSummary:
      'Extensive harmful algal bloom (HAB) detected across Jubail coastal waters. Critical threat to desalination intake and aquaculture.',
    aiRecommendations: [
      'IMMEDIATE: Alert Jubail desalination plant operations center.',
      'Suspend aquaculture harvesting in affected zone pending toxin analysis.',
      'Deploy rapid response team for water sampling and phytoplankton identification.',
      'Coordinate with Ministry of Environment for public health advisory.',
      'Monitor bloom trajectory using ocean current models every 6 hours.',
    ],
    status: 'In Cleanup',
    detectedAt: hoursAgo(17),
    updatedAt: hoursAgo(2),
    alertSent: true,
    alertSentAt: hoursAgo(17),
    reMonitoringPasses: [
      {
        id: 'rmp-003-1',
        incidentId: 'inc-003',
        captureId: 'cap-003b',
        timestamp: hoursAgo(2),
        previousAreaSqKm: 12.3,
        currentAreaSqKm: 8.75,
        improvementPercentage: 28.86,
        analysisId: 'ana-003b',
        imageUrl: cleanImages[0],
        previousImageUrl: pollutionImages[2],
        pollutionDetected: true,
        pollutionType: 'Algal Bloom',
        severity: 'Critical',
        confidenceScore: 96,
      },
    ],
    improvementPercentage: 28.86,
    isFallback: true,
  },
  {
    id: 'inc-004',
    analysisId: 'ana-004',
    captureId: 'cap-004',
    zoneId: 'zone-gulf',
    zoneName: 'Arabian Gulf - Eastern Province',
    pollutionType: 'Plastic Debris',
    areaSqKm: 0.95,
    coordinates: { lat: 26.4478, lng: 50.0667 },
    boundingBox: makeBBox({ lat: 26.4478, lng: 50.0667 }, 0.05),
    geojsonPolygon: makePolygon({ lat: 26.4478, lng: 50.0667 }, 0.02),
    severity: 'Low',
    responsePriority: 'Low',
    confidenceScore: 78,
    environmentalImpactSummary:
      'Localized plastic debris accumulation detected near coastal current convergence zone.',
    aiRecommendations: [
      'Schedule volunteer cleanup operation within 7 days.',
      'Log debris pattern for seasonal accumulation trend analysis.',
      'Notify local municipality for shoreline cleanup coordination.',
    ],
    status: 'Detected',
    detectedAt: hoursAgo(23),
    updatedAt: hoursAgo(23),
    alertSent: false,
    alertSentAt: null,
    reMonitoringPasses: [],
    improvementPercentage: null,
    isFallback: true,
  },
];

export function generateCaptureForZone(zone: MonitoringZone): SatelliteCapture {
  const source = sources[Math.floor(Math.random() * sources.length)];
  const jitterLat = (Math.random() - 0.5) * 0.04;
  const jitterLng = (Math.random() - 0.5) * 0.04;
  const coords = { lat: zone.center.lat + jitterLat, lng: zone.center.lng + jitterLng };
  const radius = 0.03 + Math.random() * 0.03;
  return {
    id: `cap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    zoneId: zone.id,
    zoneName: zone.name,
    timestamp: new Date().toISOString(),
    source,
    coordinates: coords,
    boundingBox: makeBBox(coords, radius),
    acquisitionLog: `${source} pass acquired via automated Copernicus polling. Cloud cover: ${Math.floor(Math.random() * 15)}%. Resolution: ${source.includes('Sentinel') ? '10m' : source.includes('Landsat') ? '30m' : '250m'}.`,
    status: 'pending',
    analysisId: null,
    linkedIncidentId: null,
    previousCaptureId: null,
    imageUrl: captureImages[Math.floor(Math.random() * captureImages.length)],
  };
}

const pollutionTypes: PollutionType[] = ['Oil Spill', 'Plastic Debris', 'Chemical Runoff', 'Algal Bloom', 'Sediment Plume', 'Thermal Discharge'];
const severities: Severity[] = ['Low', 'Medium', 'High', 'Critical'];
const priorities: ResponsePriority[] = ['Low', 'Medium', 'High', 'Urgent'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateFallbackAnalysis(capture: SatelliteCapture): PollutionAnalysis {
  const detected = Math.random() > 0.15;
  const pollutionType = detected ? pickRandom(pollutionTypes) : null;
  const area = detected ? +(Math.random() * 8 + 0.3).toFixed(2) : 0;
  const severity = detected ? pickRandom(severities) : 'Low';
  const priority = detected ? pickRandom(priorities) : 'Low';
  const confidence = detected ? Math.floor(Math.random() * 25 + 70) : 99;
  const radius = 0.02 + Math.random() * 0.04;

  const impactSummaries: Record<string, string> = {
    'Oil Spill': 'Hydrocarbon slick detected on surface waters. Risk of shoreline contamination and marine toxicity.',
    'Plastic Debris': 'Floating plastic accumulation detected. Long-term microplastic contamination risk.',
    'Chemical Runoff': 'Chemical discharge plume from coastal outfall. Water quality degradation risk.',
    'Algal Bloom': 'Harmful algal bloom detected. Threat to aquaculture and desalination operations.',
    'Sediment Plume': 'Suspended sediment plume from coastal construction. Reduced water clarity affecting marine life.',
    'Thermal Discharge': 'Thermal anomaly detected from industrial cooling outfall. Temperature stress on marine ecosystem.',
  };

  const recs: Record<string, string[]> = {
    'Oil Spill': [
      'Deploy containment booms within 2 hours.',
      'Notify regional coast guard for source identification.',
      'Dispatch surveillance drone for slick tracking.',
      'Assess shoreline impact risk using current models.',
    ],
    'Plastic Debris': [
      'Schedule cleanup operation within 7 days.',
      'Log debris pattern for trend analysis.',
      'Notify municipality for shoreline coordination.',
    ],
    'Chemical Runoff': [
      'Sample water quality at discharge point.',
      'Notify facility environmental compliance team.',
      'Monitor dissolved oxygen and pH levels.',
      'Issue fishing advisory within 5km radius.',
    ],
    'Algal Bloom': [
      'Alert desalination plant operations center.',
      'Suspend aquaculture harvesting pending toxin analysis.',
      'Deploy rapid response team for phytoplankton ID.',
      'Monitor bloom trajectory every 6 hours.',
    ],
    'Sediment Plume': [
      'Inspect coastal construction site for compliance.',
      'Monitor turbidity levels at nearby reef sites.',
      'Notify environmental regulator if exceedance detected.',
    ],
    'Thermal Discharge': [
      'Verify industrial cooling system compliance.',
      'Monitor temperature delta at discharge point.',
      'Assess impact on nearby benthic communities.',
    ],
  };

  return {
    id: `ana-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    captureId: capture.id,
    timestamp: new Date().toISOString(),
    pollutionDetected: detected,
    pollutionType,
    areaSqKm: area,
    coordinates: capture.coordinates,
    boundingBox: capture.boundingBox,
    geojsonPolygon: detected ? makePolygon(capture.coordinates, radius) : null,
    severity,
    responsePriority: priority,
    confidenceScore: confidence,
    environmentalImpactSummary: detected
      ? impactSummaries[pollutionType as string] ?? 'Pollution detected. Environmental impact assessment recommended.'
      : 'No pollution detected in this capture. Water quality appears within normal parameters.',
    aiRecommendations: detected ? recs[pollutionType as string] ?? ['Monitor zone for changes.'] : ['No action required. Continue routine monitoring.'],
    isFallback: true,
  };
}

export { captureImages, pollutionImages, cleanImages, sources, makePolygon, makeBBox };
