import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Camera,
  GlobalVehicleTrack,
  RoadNode,
  RoadEdge,
  AlertEvent,
  InfrastructurePOI
} from '../../types';
import {
  Layers,
  MapPin,
  Camera as CameraIcon,
  Navigation,
  Compass,
  Zap,
  Activity,
  Shield,
  Hospital,
  Fuel,
  Maximize2,
  Minimize2,
  RefreshCw,
  Eye,
  Sliders,
  Crosshair
} from 'lucide-react';

export interface IndiaRegionConfig {
  name: string;
  state: string;
  center: [number, number]; // [lat, lng]
  zoom: number;
  description: string;
  corridor: string;
}

export const INDIA_GEO_REGIONS: Record<string, IndiaRegionConfig> = {
  'Tamil Nadu': {
    name: 'Chennai Metropolitan & OMR IT Corridor',
    state: 'Tamil Nadu',
    center: [13.0475, 80.2425],
    zoom: 13,
    description: 'Anna Salai, Mount Road, OMR IT Expressway & Guindy Kathipara Jct',
    corridor: 'TN-NH45-OMR'
  },
  'Tamil Nadu - Ranipet/Vellore': {
    name: 'Ranipet - Arakkonam - Vellore Highway Corridor',
    state: 'Tamil Nadu',
    center: [12.9249, 79.3338],
    zoom: 13,
    description: 'Ramdev Hardware, Guruvarajapet, Walajah & Katpadi Junctions',
    corridor: 'TN-NH48'
  },
  'Karnataka': {
    name: 'Bengaluru Tech Corridor & Outer Ring Road',
    state: 'Karnataka',
    center: [12.9352, 77.6245],
    zoom: 13,
    description: 'Silk Board Jct, Electronic City Elevated Flyover, Marathahalli ORR',
    corridor: 'KA-ORR-NH44'
  },
  'Delhi NCR': {
    name: 'Delhi NCR Capital Transit Grid',
    state: 'Delhi',
    center: [28.6139, 77.2090],
    zoom: 13,
    description: 'Connaught Place, Ring Road, DND Flyway, India Gate Arterial',
    corridor: 'DL-RR-DND'
  },
  'Maharashtra': {
    name: 'Mumbai Coastal & Western Express Corridor',
    state: 'Maharashtra',
    center: [19.0596, 72.8406],
    zoom: 13,
    description: 'Bandra-Worli Sea Link, Western Express Highway, BKC Hub',
    corridor: 'MH-WEH-BWSL'
  },
  'Kerala': {
    name: 'Kochi Metro & Infopark Corridor',
    state: 'Kerala',
    center: [9.9816, 76.2999],
    zoom: 13,
    description: 'MG Road, Marine Drive, Infopark Kakkanad, Edappally Jct',
    corridor: 'KL-NH66'
  },
  'Telangana': {
    name: 'Hyderabad Cyberabad & Financial District',
    state: 'Telangana',
    center: [17.4435, 78.3772],
    zoom: 13,
    description: 'Hitec City Cyber Towers, Gachibowli Jct, Outer Ring Road',
    corridor: 'TS-ORR'
  }
};

export type TileLayerType = 'osm' | 'carto_dark' | 'carto_voyager' | 'satellite' | 'opentopo';

export interface TileLayerOption {
  id: TileLayerType;
  name: string;
  url: string;
  attribution: string;
  subdomains?: string[];
  maxZoom: number;
}

export const TILE_PROVIDERS: Record<TileLayerType, TileLayerOption> = {
  osm: {
    id: 'osm',
    name: 'OpenStreetMap Live Standard',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  },
  carto_dark: {
    id: 'carto_dark',
    name: 'CartoDB Dark Matter (Cyberpunk)',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 20
  },
  carto_voyager: {
    id: 'carto_voyager',
    name: 'CartoDB Voyager (High Contrast)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 20
  },
  satellite: {
    id: 'satellite',
    name: 'Esri World Imagery (Satellite)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
  },
  opentopo: {
    id: 'opentopo',
    name: 'OpenTopoMap (Terrain & Topo)',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
    maxZoom: 17
  }
};

interface RealtimeOpenStreetMapProps {
  cameras: Camera[];
  tracks: GlobalVehicleTrack[];
  nodes?: RoadNode[];
  edges?: RoadEdge[];
  alerts?: AlertEvent[];
  infrastructure?: InfrastructurePOI[];
  selectedVehicleId?: string | null;
  onSelectVehicle?: (id: string) => void;
  selectedCameraId?: string | null;
  onSelectCamera?: (id: string) => void;
  activeRegion?: string;
  setActiveRegion?: (region: string) => void;
  isEcoTheme?: boolean;
  className?: string;
}

export const RealtimeOpenStreetMap: React.FC<RealtimeOpenStreetMapProps> = ({
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
  activeRegion = 'Tamil Nadu',
  setActiveRegion,
  isEcoTheme = true,
  className = 'w-full h-full min-h-[500px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeTileType, setActiveTileType] = useState<TileLayerType>('carto_dark');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedRegionKey, setSelectedRegionKey] = useState<string>(
    INDIA_GEO_REGIONS[activeRegion] ? activeRegion : 'Tamil Nadu'
  );

  const [activeLayers, setActiveLayers] = useState({
    cameras: true,
    vehicles: true,
    predictions: true,
    history: true,
    signals: true,
    police: true,
    hospitals: true,
    fuel: true,
    trafficFlow: true
  });

  const activeTrack = tracks.find((t) => t.globalTrackId === selectedVehicleId) || tracks[0] || null;

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const currentRegion = INDIA_GEO_REGIONS[selectedRegionKey] || INDIA_GEO_REGIONS['Tamil Nadu'];

    const map = L.map(mapContainerRef.current, {
      center: currentRegion.center,
      zoom: currentRegion.zoom,
      zoomControl: false,
      attributionControl: true
    });

    L.control.zoom({ position: 'topright' }).addTo(map);

    const initialProvider = TILE_PROVIDERS[activeTileType];
    const tileLayer = L.tileLayer(initialProvider.url, {
      attribution: initialProvider.attribution,
      maxZoom: initialProvider.maxZoom,
      subdomains: initialProvider.subdomains || ['a', 'b', 'c']
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    const routesGroup = L.layerGroup().addTo(map);
    const markersGroup = L.layerGroup().addTo(map);
    routesLayerGroupRef.current = routesGroup;
    markersLayerGroupRef.current = markersGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    const map = mapInstanceRef.current;
    map.removeLayer(tileLayerRef.current);

    const provider = TILE_PROVIDERS[activeTileType];
    const newTileLayer = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: provider.subdomains || ['a', 'b', 'c']
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [activeTileType]);

  // Handle Region FlyTo Transition
  const handleRegionChange = (newRegionKey: string) => {
    setSelectedRegionKey(newRegionKey);
    if (setActiveRegion) {
      setActiveRegion(newRegionKey);
    }

    const regionConfig = INDIA_GEO_REGIONS[newRegionKey];
    if (regionConfig && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(regionConfig.center, regionConfig.zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  };

  // Re-render Overlays (Markers, Trajectories, Predictions, Infrastructure)
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerGroupRef.current || !routesLayerGroupRef.current) {
      return;
    }

    const markersGroup = markersLayerGroupRef.current;
    const routesGroup = routesLayerGroupRef.current;

    markersGroup.clearLayers();
    routesGroup.clearLayers();

    const currentRegion = INDIA_GEO_REGIONS[selectedRegionKey] || INDIA_GEO_REGIONS['Tamil Nadu'];
    const [centerLat, centerLng] = currentRegion.center;

    // 1. CCTV Cameras Overlay
    if (activeLayers.cameras && cameras.length > 0) {
      cameras.forEach((cam, idx) => {
        // Offset coords slightly around region center if raw coords are far
        const lat = cam.latitude && Math.abs(cam.latitude - centerLat) < 1.0 ? cam.latitude : centerLat + (Math.sin(idx * 1.3) * 0.015);
        const lng = cam.longitude && Math.abs(cam.longitude - centerLng) < 1.0 ? cam.longitude : centerLng + (Math.cos(idx * 1.3) * 0.018);

        const isSelected = cam.id === selectedCameraId;
        const statusBg = cam.status === 'ONLINE' ? '#10B981' : cam.status === 'PROCESSING' ? '#06B6D4' : '#F59E0B';

        const customIcon = L.divIcon({
          className: 'custom-camera-pin',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%);">
              <div style="padding: 2px 6px; border-radius: 6px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(255, 255, 255, 0.3); color: #fff; font-size: 9px; font-family: monospace; font-weight: bold; white-space: nowrap; margin-bottom: 2px; box-shadow: 0 4px 6px rgba(0,0,0,0.5);">
                📹 ${cam.id}
              </div>
              <div style="width: 24px; height: 24px; border-radius: 50%; background: ${statusBg}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px ${statusBg}; ${isSelected ? 'outline: 3px solid #F59E0B;' : ''}">
                <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
              </div>
            </div>
          `,
          iconSize: [24, 24]
        });

        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.on('click', () => {
          if (onSelectCamera) onSelectCamera(cam.id);
        });

        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #0f172a; padding: 4px;">
            <div style="font-weight: bold; font-size: 12px; color: #0284c7;">📹 ${cam.name}</div>
            <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${cam.locationName || 'Indian Highway Node'}</div>
            <div style="margin-top: 6px; display: flex; gap: 8px;">
              <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: bold;">Status: ${cam.status}</span>
              <span style="background: #f1f5f9; color: #334155; padding: 2px 6px; border-radius: 4px;">FPS: ${cam.fps || 30}</span>
            </div>
            <div style="margin-top: 4px; font-size: 10px; color: #475569;">IP: ${cam.ipAddress || '10.244.18.91'}</div>
          </div>
        `);

        markersGroup.addLayer(marker);
      });
    }

    // 2. Vehicles Trajectories & Live Marker
    if (activeLayers.vehicles && tracks.length > 0) {
      tracks.forEach((track, tIdx) => {
        const isSelected = track.globalTrackId === selectedVehicleId || (!selectedVehicleId && tIdx === 0);
        const lat = track.currentLocationEstimate?.lat && Math.abs(track.currentLocationEstimate.lat - centerLat) < 1.0
          ? track.currentLocationEstimate.lat
          : centerLat + (tIdx === 0 ? 0.004 : -0.006 + tIdx * 0.005);
        const lng = track.currentLocationEstimate?.lng && Math.abs(track.currentLocationEstimate.lng - centerLng) < 1.0
          ? track.currentLocationEstimate.lng
          : centerLng + (tIdx === 0 ? 0.005 : -0.008 + tIdx * 0.006);

        // Historical Trail Polyline
        if (activeLayers.history) {
          const trailCoords: [number, number][] = [
            [lat - 0.015, lng - 0.020],
            [lat - 0.010, lng - 0.012],
            [lat - 0.005, lng - 0.004],
            [lat, lng]
          ];

          const historyPolyline = L.polyline(trailCoords, {
            color: isSelected ? '#3B82F6' : '#64748B',
            weight: isSelected ? 5 : 3,
            opacity: 0.9,
            dashArray: '2, 4'
          });
          routesGroup.addLayer(historyPolyline);
        }

        // Yen's K-Shortest Path AI Predictions
        if (activeLayers.predictions && isSelected) {
          // Rank 1: Cyan (62%)
          const path1Coords: [number, number][] = [
            [lat, lng],
            [lat + 0.006, lng + 0.008],
            [lat + 0.012, lng + 0.018],
            [lat + 0.018, lng + 0.025]
          ];
          const path1 = L.polyline(path1Coords, {
            color: '#00E5FF',
            weight: 5,
            dashArray: '8, 6',
            opacity: 0.95
          });
          routesGroup.addLayer(path1);

          // Rank 2: Mint Green (25%)
          const path2Coords: [number, number][] = [
            [lat, lng],
            [lat + 0.004, lng + 0.010],
            [lat + 0.008, lng + 0.022],
            [lat + 0.011, lng + 0.030]
          ];
          const path2 = L.polyline(path2Coords, {
            color: '#00F59B',
            weight: 4,
            dashArray: '6, 5',
            opacity: 0.85
          });
          routesGroup.addLayer(path2);

          // Rank 3: Electric Indigo (13%)
          const path3Coords: [number, number][] = [
            [lat, lng],
            [lat + 0.008, lng + 0.004],
            [lat + 0.016, lng + 0.007],
            [lat + 0.022, lng + 0.010]
          ];
          const path3 = L.polyline(path3Coords, {
            color: '#818CF8',
            weight: 3.5,
            dashArray: '4, 4',
            opacity: 0.8
          });
          routesGroup.addLayer(path3);

          // Destination Beacons
          const dest1 = L.circleMarker([lat + 0.018, lng + 0.025], {
            radius: 8,
            color: '#00E5FF',
            fillColor: '#00E5FF',
            fillOpacity: 0.9,
            weight: 2
          });
          dest1.bindPopup('<b>Rank #1 Predicted Next Junction</b><br/>Probability: 62%<br/>ETA: 4.2 mins');
          routesGroup.addLayer(dest1);
        }

        // Live Vehicle Icon Marker
        const vehicleToken = track.anonymousVehicleId || track.primaryPlateText || `TN-01-V-0${tIdx + 42}`;
        const vehIcon = L.divIcon({
          className: 'custom-vehicle-marker',
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -50%);">
              <div style="padding: 3px 8px; border-radius: 8px; background: ${isSelected ? '#F59E0B' : '#0F172A'}; color: ${isSelected ? '#0F172A' : '#FFF'}; font-size: 10px; font-family: monospace; font-weight: 900; border: 1.5px solid #F59E0B; white-space: nowrap; margin-bottom: 2px; box-shadow: 0 4px 10px rgba(0,0,0,0.6);">
                🚗 ${vehicleToken}
              </div>
              <div style="width: 28px; height: 28px; border-radius: 50%; background: ${isSelected ? '#F59E0B' : '#3B82F6'}; border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px ${isSelected ? 'rgba(245, 158, 11, 0.9)' : 'rgba(59, 130, 246, 0.8)'}; animation: pulse 2s infinite;">
                <div style="transform: rotate(45deg); font-size: 12px;">▲</div>
              </div>
            </div>
          `,
          iconSize: [32, 32]
        });

        const vehMarker = L.marker([lat, lng], { icon: vehIcon });
        vehMarker.on('click', () => {
          if (onSelectVehicle) onSelectVehicle(track.globalTrackId);
        });

        vehMarker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; padding: 4px; min-width: 180px;">
            <div style="font-weight: 900; font-size: 13px; color: #d97706;">🚗 ${vehicleToken}</div>
            <div style="color: #475569; font-size: 10px; margin-top: 2px;">Class: ${track.vehicleClass || 'SUV'} | Color: ${track.vehicleColor || 'White'}</div>
            <div style="margin-top: 6px; padding: 4px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
              <div>Speed: <b>${track.currentLocationEstimate?.speedKmh || 48} km/h</b></div>
              <div>Association Fusion: <b>${Math.round((track.confidenceFusion?.combinedScore || 0.91) * 100)}%</b></div>
              <div>Region: <b>${currentRegion.state} (${currentRegion.corridor})</b></div>
            </div>
          </div>
        `);

        markersGroup.addLayer(vehMarker);
      });
    }

    // 3. Indian Infrastructure POIs
    const sampleInfrastructure: InfrastructurePOI[] = infrastructure.length > 0 ? infrastructure : [
      { id: 'POI-01', name: 'Smart Traffic Signal Hub #14', type: 'traffic_signal', latitude: centerLat + 0.005, longitude: centerLng + 0.007, details: 'Adaptive Cycle 90s' },
      { id: 'POI-02', name: 'Traffic Police Station Sector 4', type: 'police_station', latitude: centerLat - 0.008, longitude: centerLng + 0.012, details: 'Interceptors on standby' },
      { id: 'POI-03', name: 'Metro Trauma & Emergency Hospital', type: 'hospital', latitude: centerLat + 0.014, longitude: centerLng - 0.006, details: 'Level 1 Trauma Care' },
      { id: 'POI-04', name: 'IndianOil EV Fast Charger & Fuel', type: 'petrol_station', latitude: centerLat - 0.011, longitude: centerLng - 0.009, details: '150kW CCS2 Active' },
      { id: 'POI-05', name: 'Key National Highway Bypass Jct', type: 'junction', latitude: centerLat + 0.018, longitude: centerLng + 0.025, details: 'Multi-lane grade separator' }
    ];

    sampleInfrastructure.forEach((poi) => {
      if (poi.type === 'traffic_signal' && !activeLayers.signals) return;
      if (poi.type === 'police_station' && !activeLayers.police) return;
      if (poi.type === 'hospital' && !activeLayers.hospitals) return;
      if (poi.type === 'petrol_station' && !activeLayers.fuel) return;

      const pLat = poi.latitude && Math.abs(poi.latitude - centerLat) < 1.0 ? poi.latitude : centerLat + 0.005;
      const pLng = poi.longitude && Math.abs(poi.longitude - centerLng) < 1.0 ? poi.longitude : centerLng + 0.007;

      let iconColor = '#06B6D4';
      let iconSymbol = '📍';

      if (poi.type === 'traffic_signal') {
        iconColor = '#10B981';
        iconSymbol = '🚦';
      } else if (poi.type === 'police_station') {
        iconColor = '#3B82F6';
        iconSymbol = '👮';
      } else if (poi.type === 'hospital') {
        iconColor = '#EF4444';
        iconSymbol = '🏥';
      } else if (poi.type === 'petrol_station') {
        iconColor = '#F59E0B';
        iconSymbol = '⚡';
      }

      const poiIcon = L.divIcon({
        className: 'custom-poi-marker',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%);">
            <div style="width: 22px; height: 22px; border-radius: 6px; background: ${iconColor}; border: 1.5px solid #ffffff; display: flex; align-items: center; justify-content: center; font-size: 11px; box-shadow: 0 2px 6px rgba(0,0,0,0.4);">
              ${iconSymbol}
            </div>
          </div>
        `,
        iconSize: [22, 22]
      });

      const poiMarker = L.marker([pLat, pLng], { icon: poiIcon });
      poiMarker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; padding: 2px;">
          <div style="font-weight: bold; color: ${iconColor};">${iconSymbol} ${poi.name}</div>
          <div style="color: #64748b; font-size: 10px; margin-top: 2px;">${poi.type.replace('_', ' ')}</div>
          <div style="margin-top: 4px; font-size: 10px; color: #334155;">${poi.details || 'Geo POI Infrastructure'}</div>
        </div>
      `);
      markersGroup.addLayer(poiMarker);
    });
  }, [
    cameras,
    tracks,
    selectedVehicleId,
    selectedCameraId,
    selectedRegionKey,
    activeLayers,
    infrastructure
  ]);

  const currentRegion = INDIA_GEO_REGIONS[selectedRegionKey] || INDIA_GEO_REGIONS['Tamil Nadu'];

  return (
    <div className={`relative rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
      isEcoTheme
        ? 'bg-slate-900 border-[#DDEBE4] text-slate-100'
        : 'bg-slate-950 border-slate-800 text-slate-100'
    } ${className}`}>
      {/* Top Header Bar: India Geo Maps Region Selector & Live Tile Provider */}
      <div className="p-3 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Region Selector */}
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                India Geo Region:
              </span>
              <select
                value={selectedRegionKey}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg bg-slate-800 border border-slate-700 text-amber-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {Object.entries(INDIA_GEO_REGIONS).map(([key, reg]) => (
                  <option key={key} value={key} className="bg-slate-900 text-white">
                    🇮🇳 {reg.state} — {reg.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              {currentRegion.description} ({currentRegion.corridor})
            </p>
          </div>
        </div>

        {/* Tile Provider Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
          {(Object.keys(TILE_PROVIDERS) as TileLayerType[]).map((tileKey) => (
            <button
              key={tileKey}
              onClick={() => setActiveTileType(tileKey)}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded-lg transition-all ${
                activeTileType === tileKey
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {tileKey === 'osm'
                ? '🗺️ OpenMaps'
                : tileKey === 'carto_dark'
                ? '🌙 Dark'
                : tileKey === 'carto_voyager'
                ? '☀️ Light'
                : tileKey === 'satellite'
                ? '🛰️ Satellite'
                : '🏔️ Topo'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative flex-1 w-full h-[520px]">
        {/* Leaflet DOM Node */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Layer Controls Badge */}
        <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 shadow-2xl flex flex-col gap-1.5 text-xs font-mono">
          <div className="font-bold text-slate-300 flex items-center gap-1.5 mb-1 pb-1 border-b border-slate-800">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>GIS Overlays</span>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={activeLayers.cameras}
              onChange={(e) => setActiveLayers((prev) => ({ ...prev, cameras: e.target.checked }))}
              className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
            />
            <span>📹 CCTV Cameras ({cameras.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={activeLayers.vehicles}
              onChange={(e) => setActiveLayers((prev) => ({ ...prev, vehicles: e.target.checked }))}
              className="rounded bg-slate-800 border-slate-600 text-amber-500 focus:ring-0"
            />
            <span>🚗 Live Vehicles ({tracks.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={activeLayers.predictions}
              onChange={(e) => setActiveLayers((prev) => ({ ...prev, predictions: e.target.checked }))}
              className="rounded bg-slate-800 border-slate-600 text-cyan-500 focus:ring-0"
            />
            <span>🔮 Yen's K-Path Predictions</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={activeLayers.signals}
              onChange={(e) => setActiveLayers((prev) => ({ ...prev, signals: e.target.checked }))}
              className="rounded bg-slate-800 border-slate-600 text-emerald-500 focus:ring-0"
            />
            <span>🚦 Traffic Signals</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={activeLayers.police}
              onChange={(e) => setActiveLayers((prev) => ({ ...prev, police: e.target.checked }))}
              className="rounded bg-slate-800 border-slate-600 text-blue-500 focus:ring-0"
            />
            <span>👮 Police Posts</span>
          </label>
        </div>

        {/* Floating Route Prediction Legend Card */}
        <div className="absolute bottom-3 right-3 z-20 bg-slate-950/95 backdrop-blur-md p-3 rounded-xl border border-cyan-500/40 shadow-2xl font-mono text-xs max-w-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Active Track: {activeTrack?.anonymousVehicleId || activeTrack?.primaryPlateText || 'V-042'}</span>
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] rounded">
              LIVE
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-cyan-300 font-semibold">◆ Rank #1 Route (Primary):</span>
              <span className="font-bold text-white">62% Prob</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-emerald-300 font-semibold">■ Rank #2 Route (Alt):</span>
              <span className="font-bold text-white">25% Prob</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-indigo-300 font-semibold">▲ Rank #3 Route (Loop):</span>
              <span className="font-bold text-white">13% Prob</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
