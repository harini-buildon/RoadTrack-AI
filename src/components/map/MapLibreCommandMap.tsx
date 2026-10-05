import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Camera,
  GlobalVehicleTrack,
  RoadNode,
  RoadEdge,
  AlertEvent,
  InfrastructurePOI
} from '../../types';
import {
  INDIA_ADMIN_GEOJSON,
  IndiaAdminRegionProperties,
  STRATEGIC_METRO_CORRIDORS,
  MetroCorridorConfig
} from '../../data/indiaAdminGeoJson';
import {
  Layers,
  MapPin,
  Camera as CameraIcon,
  Navigation,
  Compass,
  Activity,
  Maximize2,
  Minimize2,
  TrendingUp,
  Shield,
  Zap,
  Info,
  Sliders,
  Check,
  Eye,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  BarChart3,
  Globe2,
  Flame,
  Wind
} from 'lucide-react';

export type MapLibreBaseLayer = 'osm_standard' | 'carto_dark' | 'carto_voyager' | 'esri_satellite' | 'osm_hot';
export type AnalyticsChoroplethMetric = 'trafficDensity' | 'cctvCount' | 'congestion' | 'incidents' | 'aqi';

interface MapLibreCommandMapProps {
  cameras: Camera[];
  tracks: GlobalVehicleTrack[];
  nodes?: RoadNode[];
  edges?: RoadEdge[];
  alerts?: AlertEvent[];
  infrastructure?: InfrastructurePOI[];
  selectedVehicleId: string | null;
  onSelectVehicle: (trackId: string) => void;
  selectedCameraId: string | null;
  onSelectCamera: (camId: string) => void;
  activeRegion?: string;
  setActiveRegion?: (region: string) => void;
  isEcoTheme?: boolean;
  className?: string;
}

const TILE_SOURCES: Record<MapLibreBaseLayer, { name: string; url: string; attribution: string; maxZoom: number }> = {
  osm_standard: {
    name: 'OpenStreetMap (Standard OSM)',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  carto_dark: {
    name: 'CartoDB Dark Matter (High Contrast)',
    url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}@2x.png',
    attribution: '© <a href="https://carto.com/">CARTO</a> © OpenStreetMap contributors',
    maxZoom: 20
  },
  carto_voyager: {
    name: 'CartoDB Voyager (High-DPI Arterials)',
    url: 'https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
    attribution: '© <a href="https://carto.com/">CARTO</a> © OpenStreetMap contributors',
    maxZoom: 20
  },
  esri_satellite: {
    name: 'Esri World Imagery (High-Res Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 19
  },
  osm_hot: {
    name: 'Humanitarian OSM (Transit Focus)',
    url: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, Humanitarian OSM Team',
    maxZoom: 19
  }
};

export const MapLibreCommandMap: React.FC<MapLibreCommandMapProps> = ({
  cameras,
  tracks,
  nodes = [],
  edges = [],
  alerts = [],
  infrastructure = [],
  selectedVehicleId,
  onSelectVehicle,
  selectedCameraId,
  onSelectCamera,
  activeRegion = 'chennai',
  setActiveRegion,
  isEcoTheme = true,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  const [baseLayer, setBaseLayer] = useState<MapLibreBaseLayer>('carto_dark');
  const [selectedCorridor, setSelectedCorridor] = useState<string>(activeRegion || 'chennai');
  const [activeMetric, setActiveMetric] = useState<AnalyticsChoroplethMetric>('trafficDensity');
  const [selectedStateProps, setSelectedStateProps] = useState<IndiaAdminRegionProperties | null>(
    INDIA_ADMIN_GEOJSON.features[0].properties
  );
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [showAnalyticsDrawer, setShowAnalyticsDrawer] = useState<boolean>(true);

  // Layer Visibility Controls
  const [layersVisibility, setLayersVisibility] = useState({
    adminChoropleth: true,
    adminBorders: true,
    cameras: true,
    vehicles: true,
    trajectories: true,
    signals: true,
    police: true,
    hospitals: true,
    fuel: true
  });

  // 1. Initialize MapLibre GL Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCorridor = STRATEGIC_METRO_CORRIDORS.find((c) => c.id === selectedCorridor) || STRATEGIC_METRO_CORRIDORS[0];

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: [TILE_SOURCES[baseLayer].url],
            tileSize: 256,
            attribution: TILE_SOURCES[baseLayer].attribution,
            maxzoom: TILE_SOURCES[baseLayer].maxZoom
          }
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      },
      center: initialCorridor.center,
      zoom: initialCorridor.zoom,
      pitch: is3DMode ? initialCorridor.pitch : 0,
      bearing: is3DMode ? initialCorridor.bearing : 0
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 120, unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      // Add India Administrative GeoJSON Source
      map.addSource('india-admin', {
        type: 'geojson',
        data: INDIA_ADMIN_GEOJSON as any
      });

      // 1. Regional Choropleth Fill Layer
      map.addLayer({
        id: 'india-admin-fills',
        type: 'fill',
        source: 'india-admin',
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', 'trafficDensityIndex'],
            50, '#10b981', // Free flow green
            70, '#06b6d4', // Moderate cyan
            80, '#f59e0b', // High amber
            90, '#ef4444', // Critical red
            100, '#9333ea' // Severe purple
          ],
          'fill-opacity': 0.32
        }
      });

      // 2. Regional Administrative Borders with Neon Glow
      map.addLayer({
        id: 'india-admin-borders',
        type: 'line',
        source: 'india-admin',
        paint: {
          'line-color': '#38bdf8',
          'line-width': 2.5,
          'line-dasharray': [2, 1],
          'line-opacity': 0.85
        }
      });

      // 3. Regional Glow Casing Layer
      map.addLayer({
        id: 'india-admin-borders-glow',
        type: 'line',
        source: 'india-admin',
        paint: {
          'line-color': '#0284c7',
          'line-width': 6,
          'line-blur': 4,
          'line-opacity': 0.45
        }
      });

      // Hover / Click handler for administrative regions
      map.on('click', 'india-admin-fills', (e) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties as IndiaAdminRegionProperties;
          setSelectedStateProps(props);
          setShowAnalyticsDrawer(true);
        }
      });

      map.on('mouseenter', 'india-admin-fills', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'india-admin-fills', () => {
        map.getCanvas().style.cursor = '';
      });

      // Add Predicted Trajectory Line Source & Layer (Section 7 of Spec)
      const primaryTrack = tracks.find((t) => t.globalTrackId === selectedVehicleId) || tracks[0];
      const startLat = primaryTrack ? primaryTrack.currentLocationEstimate.lat : 13.0827;
      const startLng = primaryTrack ? primaryTrack.currentLocationEstimate.lng : 80.2707;

      const trajectoryGeoJSON: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: [
          // Route 1 (Primary - 62% Confidence)
          {
            type: 'Feature',
            properties: { routeId: 'R1', name: 'Primary Route (Anna Salai / EVR Corridor)', color: '#00E5FF', confidence: 0.62 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [startLng - 0.015, startLat - 0.008],
                [startLng, startLat],
                [startLng + 0.006, startLat + 0.003],
                [startLng + 0.014, startLat + 0.008],
                [startLng + 0.022, startLat + 0.016]
              ]
            }
          },
          // Route 2 (Alternate - 25% Confidence)
          {
            type: 'Feature',
            properties: { routeId: 'R2', name: 'Alternate Route (Egmore - Poonamallee Link)', color: '#00F59B', confidence: 0.25 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [startLng, startLat],
                [startLng - 0.004, startLat + 0.006],
                [startLng + 0.002, startLat + 0.015],
                [startLng + 0.018, startLat + 0.021]
              ]
            }
          },
          // Route 3 (Contingent - 13% Confidence)
          {
            type: 'Feature',
            properties: { routeId: 'R3', name: 'Contingent Route (Marina Coastal Bypass)', color: '#818CF8', confidence: 0.13 },
            geometry: {
              type: 'LineString',
              coordinates: [
                [startLng, startLat],
                [startLng + 0.008, startLat - 0.004],
                [startLng + 0.015, startLat - 0.007],
                [startLng + 0.024, startLat + 0.002]
              ]
            }
          }
        ]
      };

      map.addSource('predicted-trajectories', {
        type: 'geojson',
        data: trajectoryGeoJSON
      });

      // Trajectory Glow Layer
      map.addLayer({
        id: 'trajectories-glow',
        type: 'line',
        source: 'predicted-trajectories',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 8,
          'line-blur': 4,
          'line-opacity': 0.5
        }
      });

      // Trajectory Core Layer
      map.addLayer({
        id: 'trajectories-core',
        type: 'line',
        source: 'predicted-trajectories',
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3.5,
          'line-dasharray': [3, 1]
        }
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // 2. Switch MapLibre Base Raster Layer (OpenStreetMap / CartoDB / Satellite / HOT)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getSource('osm-tiles')) {
      const source = map.getSource('osm-tiles') as any;
      if (source && source.tiles) {
        // Remove layer and source and re-add with new tile URL
        if (map.getLayer('osm-tiles-layer')) {
          map.removeLayer('osm-tiles-layer');
        }
        map.removeSource('osm-tiles');

        map.addSource('osm-tiles', {
          type: 'raster',
          tiles: [TILE_SOURCES[baseLayer].url],
          tileSize: 256,
          attribution: TILE_SOURCES[baseLayer].attribution,
          maxzoom: TILE_SOURCES[baseLayer].maxZoom
        });

        // Insert behind vector layers
        const firstLayerId = map.getLayer('india-admin-fills') ? 'india-admin-fills' : undefined;
        map.addLayer(
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 22
          },
          firstLayerId
        );
      }
    }
  }, [baseLayer]);

  // 3. Update Choropleth Dynamic Coloring based on active metric
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.getLayer('india-admin-fills')) return;

    let paintProperty: any = [];

    switch (activeMetric) {
      case 'trafficDensity':
        paintProperty = [
          'interpolate',
          ['linear'],
          ['get', 'trafficDensityIndex'],
          50, '#10b981', // Free flow
          70, '#06b6d4', // Moderate
          80, '#f59e0b', // Heavy
          90, '#ef4444', // Critical
          100, '#9333ea' // Severe
        ];
        break;
      case 'cctvCount':
        paintProperty = [
          'interpolate',
          ['linear'],
          ['get', 'activeCctvCount'],
          500, '#3b82f6',
          1500, '#06b6d4',
          2500, '#10b981',
          3500, '#f59e0b'
        ];
        break;
      case 'congestion':
        paintProperty = [
          'match',
          ['get', 'congestionLevel'],
          'LOW', '#10b981',
          'MODERATE', '#06b6d4',
          'HEAVY', '#f59e0b',
          'CRITICAL', '#ef4444',
          '#64748b'
        ];
        break;
      case 'incidents':
        paintProperty = [
          'interpolate',
          ['linear'],
          ['get', 'incidentHotspots'],
          5, '#10b981',
          15, '#f59e0b',
          30, '#ef4444',
          45, '#991b1b'
        ];
        break;
      case 'aqi':
        paintProperty = [
          'interpolate',
          ['linear'],
          ['get', 'airQualityAqi'],
          50, '#10b981',
          100, '#f59e0b',
          150, '#f97316',
          200, '#ef4444',
          300, '#7f1d1d'
        ];
        break;
    }

    map.setPaintProperty('india-admin-fills', 'fill-color', paintProperty);
  }, [activeMetric]);

  // 4. Update Layer Visibilities
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer('india-admin-fills')) {
      map.setLayoutProperty('india-admin-fills', 'visibility', layersVisibility.adminChoropleth ? 'visible' : 'none');
    }
    if (map.getLayer('india-admin-borders')) {
      map.setLayoutProperty('india-admin-borders', 'visibility', layersVisibility.adminBorders ? 'visible' : 'none');
    }
    if (map.getLayer('india-admin-borders-glow')) {
      map.setLayoutProperty('india-admin-borders-glow', 'visibility', layersVisibility.adminBorders ? 'visible' : 'none');
    }
    if (map.getLayer('trajectories-core')) {
      map.setLayoutProperty('trajectories-core', 'visibility', layersVisibility.trajectories ? 'visible' : 'none');
    }
    if (map.getLayer('trajectories-glow')) {
      map.setLayoutProperty('trajectories-glow', 'visibility', layersVisibility.trajectories ? 'visible' : 'none');
    }
  }, [layersVisibility]);

  // 5. Render HTML DOM Markers for Cameras, Vehicles, and Infrastructure POIs
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // A. Render CCTV Camera Markers
    if (layersVisibility.cameras) {
      cameras.forEach((cam) => {
        const isSelected = cam.id === selectedCameraId;
        const el = document.createElement('div');
        el.className = 'group cursor-pointer';
        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <div style="
              width: 28px;
              height: 28px;
              border-radius: 8px;
              background: ${isSelected ? '#10B981' : '#0F172A'};
              border: 2px solid ${isSelected ? '#34D399' : '#38BDF8'};
              display: flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              font-size: 13px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.6);
              transition: transform 0.2s;
            ">
              📹
            </div>
            <div style="
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid #334155;
              padding: 2px 6px;
              border-radius: 4px;
              font-family: monospace;
              font-size: 9px;
              font-weight: bold;
              color: #e2e8f0;
              margin-top: 3px;
              white-space: nowrap;
            ">
              ${cam.name.split('-')[0] || cam.id}
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectCamera(cam.id);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([cam.longitude, cam.latitude])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // B. Render Live Vehicle Markers (Anonymized Privacy ID: V-042, V-108)
    if (layersVisibility.vehicles) {
      tracks.forEach((track) => {
        const isSelected = track.globalTrackId === selectedVehicleId;
        const el = document.createElement('div');
        el.className = 'group cursor-pointer';

        const anonId = track.anonymousVehicleId || track.primaryPlateText || 'V-042';
        const heading = track.currentLocationEstimate.headingDegrees || 0;
        const speed = track.currentLocationEstimate.speedKmh || 45;

        el.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <div style="
              display: flex;
              align-items: center;
              gap: 5px;
              padding: 3px 8px;
              border-radius: 12px;
              background: ${isSelected ? '#10B981' : '#0F172A'};
              border: 2px solid ${isSelected ? '#ffffff' : '#F59E0B'};
              color: #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.7);
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: transform 0.2s;
            ">
              <span style="display: inline-block; transform: rotate(${heading}deg); font-size: 11px;">▲</span>
              <span style="font-family: monospace; font-size: 11px; font-weight: 800; letter-spacing: 0.5px;">${anonId}</span>
              <span style="font-size: 9px; opacity: 0.85; font-family: monospace;">${speed}km/h</span>
            </div>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectVehicle(track.globalTrackId);
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([track.currentLocationEstimate.lng, track.currentLocationEstimate.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    }

    // C. Render Infrastructure POIs (Signals, Police, Hospital, EV Chargers)
    const currentCorridor = STRATEGIC_METRO_CORRIDORS.find((c) => c.id === selectedCorridor) || STRATEGIC_METRO_CORRIDORS[0];
    const cLat = currentCorridor.center[1];
    const cLng = currentCorridor.center[0];

    const poiList: InfrastructurePOI[] = infrastructure.length > 0 ? infrastructure : [
      { id: 'SIG-01', name: 'Smart Traffic Signal Hub #14', type: 'traffic_signal', latitude: cLat + 0.005, longitude: cLng + 0.007, details: 'Adaptive Cycle 90s' },
      { id: 'POL-01', name: 'Traffic Police Post Sector 4', type: 'police_station', latitude: cLat - 0.008, longitude: cLng + 0.012, details: 'Patrol Active' },
      { id: 'HOS-01', name: 'Government General Hospital & Trauma', type: 'hospital', latitude: cLat + 0.014, longitude: cLng - 0.006, details: '24/7 Trauma Care' },
      { id: 'PET-01', name: 'IndianOil EV Fast Charger & Fuel', type: 'petrol_station', latitude: cLat - 0.011, longitude: cLng - 0.009, details: '150kW CCS2 Active' }
    ];

    poiList.forEach((poi) => {
      if (poi.type === 'traffic_signal' && !layersVisibility.signals) return;
      if (poi.type === 'police_station' && !layersVisibility.police) return;
      if (poi.type === 'hospital' && !layersVisibility.hospitals) return;
      if (poi.type === 'petrol_station' && !layersVisibility.fuel) return;

      const pLat = poi.latitude && Math.abs(poi.latitude - cLat) < 1.0 ? poi.latitude : cLat + 0.005;
      const pLng = poi.longitude && Math.abs(poi.longitude - cLng) < 1.0 ? poi.longitude : cLng + 0.007;

      let icon = '🚦';
      let bg = '#10B981';

      if (poi.type === 'police_station') {
        icon = '👮';
        bg = '#3B82F6';
      } else if (poi.type === 'hospital') {
        icon = '🏥';
        bg = '#EF4444';
      } else if (poi.type === 'petrol_station') {
        icon = '⚡';
        bg = '#F59E0B';
      }

      const el = document.createElement('div');
      el.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
          <div style="
            width: 22px;
            height: 22px;
            border-radius: 6px;
            background: ${bg};
            border: 1.5px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          ">
            ${icon}
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pLng, pLat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [cameras, tracks, infrastructure, selectedCameraId, selectedVehicleId, layersVisibility, selectedCorridor]);

  // 6. Fly to Selected Metro Corridor
  const handleSelectCorridor = (corridorId: string) => {
    setSelectedCorridor(corridorId);
    if (setActiveRegion) setActiveRegion(corridorId);

    const corridor = STRATEGIC_METRO_CORRIDORS.find((c) => c.id === corridorId);
    if (!corridor || !mapRef.current) return;

    mapRef.current.flyTo({
      center: corridor.center,
      zoom: corridor.zoom,
      pitch: is3DMode ? corridor.pitch : 0,
      bearing: is3DMode ? corridor.bearing : 0,
      essential: true,
      duration: 1800
    });

    // Update state selection based on corridor
    const stateFeature = INDIA_ADMIN_GEOJSON.features.find((f) => f.properties.code === corridor.stateCode);
    if (stateFeature) {
      setSelectedStateProps(stateFeature.properties);
    }
  };

  // Toggle 3D Pitch / 2D Top-Down
  const toggle3D = () => {
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);
    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: nextMode ? 45 : 0,
        bearing: nextMode ? -15 : 0,
        duration: 800
      });
    }
  };

  return (
    <div className={`relative flex flex-col w-full h-full min-h-[550px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 font-mono select-none ${className}`}>
      {/* 1. TOP HEADER: MAPLIBRE ENGINE CONTROLS & INDIA REGION SELECTOR */}
      <div className="px-4 py-2.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-30">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Engine Badge */}
          <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black flex items-center gap-1.5 shadow-sm">
            <Globe2 className="w-3.5 h-3.5" />
            <span>MapLibre GL Vector Engine</span>
          </div>

          {/* Strategic Indian Metro Corridor Dropdown */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-xl border border-slate-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={selectedCorridor}
              onChange={(e) => handleSelectCorridor(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              {STRATEGIC_METRO_CORRIDORS.map((corridor) => (
                <option key={corridor.id} value={corridor.id} className="bg-slate-900 text-white">
                  🇮🇳 {corridor.name} ({corridor.city})
                </option>
              ))}
            </select>
          </div>

          {/* 3D Command Pitch Toggle */}
          <button
            onClick={toggle3D}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 border ${
              is3DMode
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle 3D Aerial Perspective Pitch and Vector Casing"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3D Perspective</span>
          </button>
        </div>

        {/* Right Action Controls: Base Layer & Metric Selector */}
        <div className="flex items-center gap-2">
          {/* Base Layer Switcher Button */}
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showLayerMenu
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Base Layers & Tiles</span>
          </button>

          {/* Regional Analytics Drawer Toggle */}
          <button
            onClick={() => setShowAnalyticsDrawer(!showAnalyticsDrawer)}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              showAnalyticsDrawer
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>India Geo Analytics</span>
          </button>
        </div>
      </div>

      {/* 2. BASE LAYER & OVERLAY MENU POPOVER */}
      {showLayerMenu && (
        <div className="absolute top-14 left-4 z-40 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 shadow-2xl w-80 space-y-3.5 text-xs text-white">
          <div className="flex items-center justify-between border-b pb-2 border-slate-800">
            <span className="font-extrabold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              HIGH-RESOLUTION BASE LAYERS
            </span>
            <button
              onClick={() => setShowLayerMenu(false)}
              className="text-slate-500 hover:text-white text-sm font-bold"
            >
              ✕
            </button>
          </div>

          {/* Base Layer Radio Options */}
          <div className="space-y-1.5">
            {(Object.keys(TILE_SOURCES) as MapLibreBaseLayer[]).map((key) => (
              <button
                key={key}
                onClick={() => setBaseLayer(key)}
                className={`w-full p-2 rounded-xl text-left font-bold transition-all flex items-center justify-between ${
                  baseLayer === key
                    ? 'bg-emerald-600/20 border border-emerald-500 text-emerald-300'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <span>{TILE_SOURCES[key].name}</span>
                {baseLayer === key && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            ))}
          </div>

          {/* Choropleth Metric Switcher */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[11px] font-extrabold text-slate-400">CHOROPLETH ANALYTICS METRIC</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'trafficDensity', label: '🚗 Traffic Density' },
                { id: 'cctvCount', label: '📹 CCTV Coverage' },
                { id: 'congestion', label: '🚦 Congestion' },
                { id: 'incidents', label: '⚠️ Hotspots' },
                { id: 'aqi', label: '🍃 Air Quality' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id as AnalyticsChoroplethMetric)}
                  className={`p-1.5 rounded-lg text-[10px] font-bold text-center border transition-all ${
                    activeMetric === m.id
                      ? 'bg-cyan-600 text-white border-cyan-400 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Feature Layer Visibility Toggles */}
          <div className="pt-2 border-t border-slate-800 space-y-1.5">
            <span className="text-[11px] font-extrabold text-slate-400">SURVEILLANCE & GIS LAYERS</span>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={layersVisibility.adminChoropleth}
                  onChange={(e) => setLayersVisibility({ ...layersVisibility, adminChoropleth: e.target.checked })}
                  className="rounded"
                />
                <span>GeoJSON Choropleth</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={layersVisibility.cameras}
                  onChange={(e) => setLayersVisibility({ ...layersVisibility, cameras: e.target.checked })}
                  className="rounded"
                />
                <span>📹 CCTV Nodes</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={layersVisibility.vehicles}
                  onChange={(e) => setLayersVisibility({ ...layersVisibility, vehicles: e.target.checked })}
                  className="rounded"
                />
                <span>🚗 Live Tracks</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer bg-slate-900/60 p-1.5 rounded-lg border border-slate-800">
                <input
                  type="checkbox"
                  checked={layersVisibility.trajectories}
                  onChange={(e) => setLayersVisibility({ ...layersVisibility, trajectories: e.target.checked })}
                  className="rounded"
                />
                <span>🛣️ Yen's Trajectory</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN MAPLIBRE GL CANVAS CONTAINER */}
      <div className="relative flex-1 w-full h-full min-h-[460px]">
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Dynamic Trajectory Legend (Top-Right Floating) */}
        <div className="absolute top-4 right-4 z-20 p-3 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-slate-800 text-white font-mono text-[10px] space-y-2 shadow-2xl max-w-[230px]">
          <div className="font-extrabold text-[11px] text-slate-300 flex items-center justify-between border-b pb-1.5 border-slate-800">
            <span>SPATIAL ENSEMBLE K=3</span>
            <span className="text-emerald-400">YEN'S PATHS</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 bg-[#00E5FF] rounded shadow-[0_0_8px_#00E5FF]" />
                <span className="font-bold">Primary Path</span>
              </div>
              <span className="font-black text-[#00E5FF]">62% Conf</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 bg-[#00F59B] rounded shadow-[0_0_8px_#00F59B]" />
                <span>Alternate Path</span>
              </div>
              <span className="font-black text-[#00F59B]">25% Conf</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-1.5 bg-[#818CF8] rounded shadow-[0_0_8px_#818CF8]" />
                <span>Contingent Path</span>
              </div>
              <span className="font-black text-[#818CF8]">13% Conf</span>
            </div>
          </div>
        </div>

        {/* 4. INDIA ADMINISTRATIVE REGIONAL ANALYTICS DRAWER (Bottom-Left Floating) */}
        {showAnalyticsDrawer && selectedStateProps && (
          <div className="absolute bottom-4 left-4 z-20 p-4 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-slate-800 text-white shadow-2xl max-w-sm w-full space-y-3">
            <div className="flex items-center justify-between border-b pb-2 border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-white line-clamp-1">{selectedStateProps.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Jurisdiction Code: <span className="text-cyan-400 font-bold">{selectedStateProps.code}</span> | Hub: {selectedStateProps.capitalOrHub}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAnalyticsDrawer(false)}
                className="text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Metric Overview Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400">TRAFFIC DENSITY</div>
                <div className="text-emerald-400 font-black text-sm flex items-center justify-between">
                  <span>{selectedStateProps.trafficDensityIndex} / 100</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    {selectedStateProps.congestionLevel}
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400">ACTIVE CCTV NODES</div>
                <div className="text-cyan-400 font-black text-sm">
                  {selectedStateProps.activeCctvCount.toLocaleString()} Online
                </div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400">DAILY VEHICLE FLOW</div>
                <div className="text-amber-400 font-black text-sm">
                  {(selectedStateProps.dailyVehicleFlow / 1000000).toFixed(2)}M / day
                </div>
              </div>

              <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                <div className="text-[9px] text-slate-400">EMERGENCY RESPONSE</div>
                <div className="text-purple-400 font-black text-sm">
                  {selectedStateProps.emergencyResponseTimeMin} mins avg
                </div>
              </div>
            </div>

            {/* Highway Infrastructure & AQI Footer */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>🛣️ {selectedStateProps.totalHighwayKms.toLocaleString()} km High-Speed Highway</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                🍃 AQI: {selectedStateProps.airQualityAqi}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
