import { useEffect, useRef, useState } from 'react';
import { useOceanEye } from '@/context/OceanEyeContext';
import { severityColor, pollutionTypeIcon, formatRelative, formatDate, severityBgClass, confidenceClass } from '@/utils/ui';
import type { Incident } from '@/types';
import { MapPin, Layers, Radio } from 'lucide-react';

function getL(): typeof import('leaflet') {
  const l = (window as unknown as { L?: typeof import('leaflet') }).L;
  if (!l) throw new Error('Leaflet not loaded');
  return l;
}

function createSeverityIcon(severity: string) {
  const L = getL();
  const color = severityColor(severity as Parameters<typeof severityColor>[0]);
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 18px; height: 18px; border-radius: 50%;
      background: ${color}; border: 2px solid rgba(255,255,255,0.6);
      box-shadow: 0 0 12px ${color}88, 0 2px 4px rgba(0,0,0,0.4);
      cursor: pointer;
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function LiveMap() {
  const { incidents, zones, setActiveTab } = useOceanEye();
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<import('leaflet').Layer[]>([]);
  const polygonsRef = useRef<import('leaflet').Layer[]>([]);
  const zoneRectsRef = useRef<import('leaflet').Layer[]>([]);
  const [ready, setReady] = useState(false);

  // Wait for Leaflet CDN script to load, then set up icon defaults
  useEffect(() => {
    function checkLeaflet() {
      if ((window as unknown as { L?: unknown }).L) {
        const L = getL();
        delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
        setReady(true);
      } else {
        setTimeout(checkLeaflet, 100);
      }
    }
    checkLeaflet();
  }, []);

  // Initialize map once Leaflet is ready
  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;

    const L = getL();

    const map = L.map(containerRef.current, {
      center: [24.0, 39.5],
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });

    // Esri World Imagery — free, no API key required
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    }).addTo(map);

    // Add a dark overlay to match the theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
      opacity: 0.6,
    }).addTo(map);

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [ready]);

  // Update markers when incidents change
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (!map) return;
    const L = getL();

    markersRef.current.forEach((m) => map.removeLayer(m));
    polygonsRef.current.forEach((p) => map.removeLayer(p));
    markersRef.current = [];
    polygonsRef.current = [];

    const activeIncidents = incidents.filter((i) => i.status !== 'Resolved' || i.reMonitoringPasses.length > 0);

    activeIncidents.forEach((inc: Incident) => {
      const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], {
        icon: createSeverityIcon(inc.severity),
      });

      const popupHtml = `
        <div style="min-width: 240px; max-width: 300px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span style="font-size:20px;">${pollutionTypeIcon(inc.pollutionType)}</span>
            <div>
              <div style="font-weight:600; font-size:14px; color:#f1f5f9;">${inc.pollutionType}</div>
              <div style="font-size:11px; color:#94a3b8;">${inc.zoneName}</div>
            </div>
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
            <span style="padding:2px 8px; border-radius:4px; font-size:10px; font-weight:500; border:1px solid; background:rgba(239,68,68,0.15); color:#f87171; border-color:rgba(239,68,68,0.3);">${inc.severity}</span>
            <span style="padding:2px 8px; border-radius:4px; font-size:10px; font-weight:500; border:1px solid; background:rgba(249,115,22,0.15); color:#fb923c; border-color:rgba(249,115,22,0.3);">${inc.responsePriority} Priority</span>
            <span style="padding:2px 8px; border-radius:4px; font-size:10px; font-weight:500; border:1px solid; background:rgba(34,197,94,0.15); color:#4ade80; border-color:rgba(34,197,94,0.3);">${inc.confidenceScore}% conf.</span>
          </div>
          <div style="font-size:12px; color:#cbd5e1; margin-bottom:6px;">
            <strong>Area:</strong> ${inc.areaSqKm} km² &nbsp;|&nbsp;
            <strong>GPS:</strong> ${inc.coordinates.lat.toFixed(4)}, ${inc.coordinates.lng.toFixed(4)}
          </div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:8px;">
            <strong>Discovered:</strong> ${formatDate(inc.detectedAt)}<br/>
            <strong>Status:</strong> ${inc.status}
          </div>
          <div style="font-size:11px; color:#cbd5e1; margin-bottom:8px; padding:6px; background:rgba(30,41,59,0.5); border-radius:6px; border:1px solid rgba(51,65,85,0.3);">
            ${inc.environmentalImpactSummary}
          </div>
          ${inc.improvementPercentage !== null ? `
            <div style="font-size:11px; color:#4ade80; margin-bottom:6px;">
              <strong>Improvement:</strong> +${inc.improvementPercentage}% (${inc.reMonitoringPasses.length} re-monitoring passes)
            </div>
          ` : ''}
          <button onclick="document.dispatchEvent(new CustomEvent('oceaneye:view-incident', {detail:'${inc.id}'}))"
            style="width:100%; padding:6px 12px; border-radius:6px; background:rgba(56,189,248,0.15); color:#38bdf8; border:1px solid rgba(56,189,248,0.3); font-size:12px; font-weight:500; cursor:pointer;">
            View Full Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 320 });
      marker.addTo(map);
      markersRef.current.push(marker);

      if (inc.geojsonPolygon && inc.geojsonPolygon.coordinates.length > 0) {
        const latlngs: import('leaflet').LatLngExpression[] = inc.geojsonPolygon.coordinates.map(
          (c) => [c.lat, c.lng] as [number, number]
        );
        const polygon = L.polygon(latlngs, {
          color: severityColor(inc.severity),
          weight: 2,
          opacity: 0.6,
          fillColor: severityColor(inc.severity),
          fillOpacity: 0.15,
          dashArray: '4 4',
        });
        polygon.addTo(map);
        polygonsRef.current.push(polygon);
      }
    });

    zoneRectsRef.current.forEach((r) => map.removeLayer(r));
    zoneRectsRef.current = [];
    zones.filter((z) => z.active).forEach((zone) => {
      const rect = L.rectangle(
        [
          [zone.boundingBox.north, zone.boundingBox.west],
          [zone.boundingBox.south, zone.boundingBox.east],
        ],
        {
          color: '#38bdf8',
          weight: 1,
          opacity: 0.3,
          fillColor: '#38bdf8',
          fillOpacity: 0.03,
          dashArray: '2 6',
        }
      );
      rect.bindTooltip(zone.name, { permanent: false, direction: 'center', className: 'zone-tooltip' });
      rect.addTo(map);
      zoneRectsRef.current.push(rect);
    });
  }, [incidents, zones, ready]);

  // Listen for view-incident events from popup buttons
  useEffect(() => {
    const handler = () => setActiveTab('alerts');
    document.addEventListener('oceaneye:view-incident', handler);
    return () => document.removeEventListener('oceaneye:view-incident', handler);
  }, [setActiveTab]);

  // Invalidate size on tab switch
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current;
    if (map) setTimeout(() => map.invalidateSize(), 200);
  });

  const activeIncidents = incidents.filter((i) => i.status !== 'Resolved');
  const lowCount = activeIncidents.filter((i) => i.severity === 'Low').length;
  const medCount = activeIncidents.filter((i) => i.severity === 'Medium').length;
  const highCount = activeIncidents.filter((i) => i.severity === 'High' || i.severity === 'Critical').length;

  return (
    <div className="space-y-4 fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            Live Pollution Monitoring Map
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time incident coordinates with severity-coded markers and zone overlays
          </p>
        </div>
        <div className="flex items-center gap-4 glass-panel rounded-xl px-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-400">Low ({lowCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-slate-400">Medium ({medCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-slate-400">High/Critical ({highCount})</span>
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden glass-panel" style={{ height: '600px' }}>
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              Loading map...
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
        <div className="absolute top-4 left-4 z-[1000] glass-panel rounded-lg px-3 py-2 flex items-center gap-2 pointer-events-none">
          <Layers className="w-4 h-4 text-sky-400" />
          <span className="text-xs text-slate-300">{activeIncidents.length} active incidents</span>
          <span className="text-slate-600">|</span>
          <Radio className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs text-slate-300">{zones.filter((z) => z.active).length} zones</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeIncidents.slice(0, 6).map((inc) => (
          <div key={inc.id} className="glass-panel glass-panel-hover rounded-xl p-3 cursor-pointer"
            onClick={() => {
              if (mapRef.current) {
                mapRef.current.setView([inc.coordinates.lat, inc.coordinates.lng], 10, { animate: true });
              }
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">{pollutionTypeIcon(inc.pollutionType)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-slate-200 truncate">{inc.pollutionType}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${severityBgClass(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{inc.zoneName}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] ${confidenceClass(inc.confidenceScore)}`}>{inc.confidenceScore}% conf</span>
                  <span className="text-[10px] text-slate-600">{formatRelative(inc.detectedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
