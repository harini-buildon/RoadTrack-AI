import React, { useState, useEffect, useRef } from 'react';
import { Camera, GlobalVehicleTrack, RoadNode, RoadEdge, EnsemblePrediction, AlertEvent, AlertSeverity, VehicleClass } from '../types';
import { GoogleMapsRouteTracker } from './GoogleMapsRouteTracker';
import { MapContainer } from './map/MapContainer';
import { RealtimeOpenStreetMap } from './map/RealtimeOpenStreetMap';
import { MapLibreCommandMap } from './map/MapLibreCommandMap';
import {
  MapPin,
  Camera as CameraIcon,
  Navigation,
  Layers,
  Compass,
  AlertTriangle,
  Zap,
  Activity,
  Globe,
  Eye,
  Crosshair,
  ShieldAlert,
  Info,
  Filter,
  Sliders,
  Clock,
  Car,
  Truck,
  Bus,
  Check,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface EcoCommandCenterMapProps {
  cameras: Camera[];
  tracks: GlobalVehicleTrack[];
  nodes: RoadNode[];
  edges: RoadEdge[];
  alerts?: AlertEvent[];
  selectedVehicleId: string | null;
  onSelectVehicle: (trackId: string) => void;
  selectedCameraId: string | null;
  onSelectCamera: (camId: string) => void;
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  isEcoTheme: boolean;
  focusPathTrigger?: { id: string; timestamp: number } | null;
  activeLayers: {
    roads: boolean;
    cameras: boolean;
    vehicles: boolean;
    trails: boolean;
    predictions: boolean;
    traffic: boolean;
    h3Grid: boolean;
    geofence: boolean;
    debugMode: boolean;
  };
}

export const EcoCommandCenterMap: React.FC<EcoCommandCenterMapProps> = ({
  cameras,
  tracks,
  nodes,
  edges,
  alerts = [],
  selectedVehicleId,
  onSelectVehicle,
  selectedCameraId,
  onSelectCamera,
  activeRegion,
  setActiveRegion,
  isEcoTheme,
  focusPathTrigger,
  activeLayers
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 13.0827, lng: 80.2707 }); // Chennai default
  const [predictionData, setPredictionData] = useState<EnsemblePrediction | null>(null);
  const [mapEngineMode, setMapEngineMode] = useState<'maplibre_osm' | 'realtime_osm' | 'google' | 'topology'>('maplibre_osm');

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Auto center and zoom in CCTV Topology mode when focus trigger fires
  useEffect(() => {
    if (focusPathTrigger) {
      const track = tracks.find((t) => t.globalTrackId === focusPathTrigger.id) || tracks[0];
      if (track) {
        const vLat = track.currentLocationEstimate.lat;
        const vLng = track.currentLocationEstimate.lng;
        setMapCenter({
          lat: Number(((vLat + 13.12) / 2).toFixed(4)),
          lng: Number(((vLng + 80.22) / 2).toFixed(4))
        });
        setZoomLevel(14);
      }
    }
  }, [focusPathTrigger, tracks]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error('Fullscreen request failed:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error('Exit fullscreen failed:', err);
        });
      }
    }
  };

  // Persistent Filter Panel State
  const [selectedVehicleClasses, setSelectedVehicleClasses] = useState<string[]>([
    'car',
    'suv',
    'truck',
    'bus',
    'motorcycle',
    'van'
  ]);
  const [selectedSeverities, setSelectedSeverities] = useState<AlertSeverity[]>([
    'CRITICAL',
    'HIGH',
    'MEDIUM',
    'LOW'
  ]);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'15m' | '1h' | '24h' | 'ALL'>('1h');
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState<boolean>(true);

  const activeTrack = tracks.find((t) => t.globalTrackId === selectedVehicleId) || tracks[0];

  // Fetch prediction when selected vehicle changes
  useEffect(() => {
    if (!activeTrack) return;
    fetch(`/api/v1/predictions/${activeTrack.globalTrackId}`)
      .then((res) => res.json())
      .then((data) => setPredictionData(data))
      .catch((err) => console.error('Error fetching prediction:', err));
  }, [selectedVehicleId, activeTrack]);

  // Handle region zooming
  useEffect(() => {
    if (activeRegion === 'Tamil Nadu' || activeRegion === 'TN') {
      setMapCenter({ lat: 13.0827, lng: 80.2707 });
      setZoomLevel(12);
    } else if (activeRegion === 'Kerala' || activeRegion === 'KL') {
      setMapCenter({ lat: 9.9312, lng: 76.2673 });
      setZoomLevel(11);
    } else if (activeRegion === 'Delhi' || activeRegion === 'DL') {
      setMapCenter({ lat: 28.6139, lng: 77.209 });
      setZoomLevel(12);
    } else if (activeRegion === 'Maharashtra' || activeRegion === 'MH') {
      setMapCenter({ lat: 19.076, lng: 72.8777 });
      setZoomLevel(11);
    } else if (activeRegion === 'World') {
      setMapCenter({ lat: 20.0, lng: 78.0 });
      setZoomLevel(4);
    }
  }, [activeRegion]);

  // Filtered tracks based on selected vehicle classes
  const filteredTracks = tracks.filter((t) => {
    const vClass = (t.vehicleClass || '').toLowerCase();
    return selectedVehicleClasses.includes(vClass);
  });

  // Filtered alerts based on selected severity levels
  const filteredAlerts = alerts.filter((a) => selectedSeverities.includes(a.severity));

  // Toggle helper for vehicle class filter
  const toggleVehicleClass = (vClass: string) => {
    setSelectedVehicleClasses((prev) =>
      prev.includes(vClass) ? prev.filter((c) => c !== vClass) : [...prev, vClass]
    );
  };

  // Toggle helper for alert severity filter
  const toggleSeverity = (severity: AlertSeverity) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity) ? prev.filter((s) => s !== severity) : [...prev, severity]
    );
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedVehicleClasses(['car', 'suv', 'truck', 'bus', 'motorcycle', 'van']);
    setSelectedSeverities(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
    setSelectedTimeRange('1h');
  };

  // Calculate SVG historical trail path based on time range
  const getTrailPathString = () => {
    switch (selectedTimeRange) {
      case '15m':
        return 'M 480 300 L 580 340';
      case '1h':
        return 'M 410 320 L 480 300 L 580 340';
      case '24h':
        return 'M 320 280 L 410 320 L 480 300 L 580 340';
      case 'ALL':
      default:
        return 'M 240 220 L 320 280 L 410 320 L 480 300 L 580 340';
    }
  };

  const allVehicleClassesList: { id: string; label: string; icon: any }[] = [
    { id: 'car', label: 'Car', icon: Car },
    { id: 'suv', label: 'SUV', icon: Car },
    { id: 'truck', label: 'Truck', icon: Truck },
    { id: 'bus', label: 'Bus', icon: Bus },
    { id: 'motorcycle', label: 'Bike', icon: Navigation },
    { id: 'van', label: 'Van', icon: Truck }
  ];

  const severityConfigs: { severity: AlertSeverity; label: string; color: string; badgeBg: string }[] = [
    { severity: 'CRITICAL', label: 'CRITICAL', color: '#ef4444', badgeBg: 'bg-red-600' },
    { severity: 'HIGH', label: 'HIGH', color: '#f97316', badgeBg: 'bg-orange-600' },
    { severity: 'MEDIUM', label: 'MEDIUM', color: '#eab308', badgeBg: 'bg-yellow-600' },
    { severity: 'LOW', label: 'LOW', color: '#3b82f6', badgeBg: 'bg-blue-600' }
  ];

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[calc(100vh-80px)] min-h-[650px] rounded-2xl overflow-hidden border transition-all duration-500 shadow-2xl flex flex-col ${
        isEcoTheme
          ? 'bg-[#E8F7EF] border-[#DDEBE4] text-[#16322A]'
          : 'bg-slate-950 border-slate-800 text-slate-100'
      }`}
    >
      {/* Top Map Engine Switcher Header */}
      <div className="px-4 py-2 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-40 font-mono text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setMapEngineMode('maplibre_osm')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              mapEngineMode === 'maplibre_osm'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>MapLibre GL & India GeoJSON</span>
          </button>

          <button
            onClick={() => setMapEngineMode('realtime_osm')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              mapEngineMode === 'realtime_osm'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>OpenStreetMap Standard</span>
          </button>

          <button
            onClick={() => setMapEngineMode('google')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              mapEngineMode === 'google'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Google Maps Route Tracker</span>
          </button>

          <button
            onClick={() => setMapEngineMode('topology')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-2 ${
              mapEngineMode === 'topology'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CCTV Network Topology</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:block">
            {mapEngineMode === 'maplibre_osm'
              ? 'MapLibre Vector Engine • High-Res OSM & India Admin GeoJSON'
              : mapEngineMode === 'realtime_osm'
              ? 'Live Tiles: OpenStreetMap / CartoDB'
              : mapEngineMode === 'google'
              ? 'Destination: Ramdev Hardware, Guruvarajapet'
              : 'Active Cameras: 8/8 Online'}
          </div>

          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 text-xs shadow-sm ${
              isFullscreen
                ? 'bg-purple-600 text-white border border-purple-500 animate-pulse'
                : 'bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-700'
            }`}
            title="Toggle Browser Fullscreen Mode for Large-Screen Deployment"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}</span>
          </button>
        </div>
      </div>

      {mapEngineMode === 'maplibre_osm' ? (
        <div className="flex-1 w-full h-full relative">
          <MapLibreCommandMap
            cameras={cameras}
            tracks={tracks}
            nodes={nodes}
            edges={edges}
            alerts={alerts}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={onSelectVehicle}
            selectedCameraId={selectedCameraId}
            onSelectCamera={onSelectCamera}
            activeRegion={activeRegion}
            setActiveRegion={setActiveRegion}
            isEcoTheme={isEcoTheme}
            className="w-full h-full"
          />
        </div>
      ) : mapEngineMode === 'realtime_osm' ? (
        <div className="flex-1 w-full h-full relative">
          <RealtimeOpenStreetMap
            cameras={cameras}
            tracks={tracks}
            nodes={nodes}
            edges={edges}
            alerts={alerts}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={onSelectVehicle}
            selectedCameraId={selectedCameraId}
            onSelectCamera={onSelectCamera}
            activeRegion={activeRegion}
            setActiveRegion={setActiveRegion}
            isEcoTheme={isEcoTheme}
            className="w-full h-full"
          />
        </div>
      ) : mapEngineMode === 'google' ? (
        <div className="flex-1 w-full h-full relative">
          <MapContainer
            activeRegion={activeRegion}
            setActiveRegion={setActiveRegion}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={onSelectVehicle}
            selectedCameraId={selectedCameraId}
            onSelectCamera={onSelectCamera}
            focusPathTrigger={focusPathTrigger}
          />
        </div>
      ) : (
      /* Dynamic Background SVG Map Canvas */
      <div className="relative flex-1 w-full h-full overflow-hidden select-none">
        {/* Map Grid Pattern */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            isEcoTheme
              ? 'bg-[radial-gradient(#18A66A_1px,transparent_1px)] [background-size:24px_24px] opacity-15'
              : 'bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10'
          }`}
        ></div>

        {/* H3 Hexagonal Grid Overlay Layer */}
        {activeLayers.h3Grid && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-25">
            <defs>
              <pattern id="hex-grid" width="60" height="104" patternUnits="userSpaceOnUse">
                <path
                  d="M30 0 L60 17 L60 52 L30 69 L0 52 L0 17 Z M30 35 L60 52 L60 87 L30 104 L0 87 L0 52 Z"
                  fill="none"
                  stroke={isEcoTheme ? '#18A66A' : '#38bdf8'}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hex-grid)" />
          </svg>
        )}

        {/* Geofence Perimeter Polygon Layer */}
        {activeLayers.geofence && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <polygon
              points="200,180 520,160 620,420 280,480"
              fill={isEcoTheme ? 'rgba(24,166,106,0.08)' : 'rgba(239,68,68,0.08)'}
              stroke={isEcoTheme ? '#18A66A' : '#ef4444'}
              strokeWidth="2"
              strokeDasharray="6 4"
            />
            <text x="210" y="200" fill={isEcoTheme ? '#168A5B' : '#ef4444'} fontSize="11" fontFamily="monospace" fontWeight="bold">
              PROTECTED GEOFENCE ZONE #4
            </text>
          </svg>
        )}

        {/* SVG Interactive Road Network Graph */}
        <svg className="absolute inset-0 w-full h-full">
          {/* Road Edges */}
          {activeLayers.roads &&
            edges.map((edge, idx) => {
              const startNode = nodes.find((n) => n.id === edge.startNodeId);
              const endNode = nodes.find((n) => n.id === edge.endNodeId);
              if (!startNode || !endNode) return null;

              // Convert lat/lng to SVG percentage coords relative to center
              const x1 = 500 + (startNode.longitude - mapCenter.lng) * 4000 * (zoomLevel / 12);
              const y1 = 350 - (startNode.latitude - mapCenter.lat) * 4000 * (zoomLevel / 12);
              const x2 = 500 + (endNode.longitude - mapCenter.lng) * 4000 * (zoomLevel / 12);
              const y2 = 350 - (endNode.latitude - mapCenter.lat) * 4000 * (zoomLevel / 12);

              const isCongested = edge.currentTrafficState === 'CONGESTED';
              const isHeavy = edge.currentTrafficState === 'HEAVY';

              const strokeColor = activeLayers.traffic
                ? isCongested
                  ? '#ef4444'
                  : isHeavy
                  ? '#f59e0b'
                  : isEcoTheme
                  ? '#18A66A'
                  : '#38bdf8'
                : isEcoTheme
                ? '#A3E2C5'
                : '#334155';

              return (
                <g key={edge.id}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={strokeColor}
                    strokeWidth={edge.roadType === 'HIGHWAY' ? 6 : 4}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                  {activeLayers.debugMode && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 - 6}
                      fill={isEcoTheme ? '#16322A' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                    >
                      {edge.id} ({edge.currentTrafficState})
                    </text>
                  )}
                </g>
              );
            })}

          {/* Historical Vehicle Trail (Filtered by Selected Time Range) */}
          {activeLayers.trails && activeTrack && (
            <g>
              <path
                d={getTrailPathString()}
                fill="none"
                stroke={isEcoTheme ? '#168A5B' : '#10b981'}
                strokeWidth={selectedTimeRange === '15m' ? '3' : '4'}
                strokeDasharray={selectedTimeRange === '15m' ? '4 2' : 'none'}
              />

              {/* Waypoint Nodes along the historical trail based on selectedTimeRange */}
              {(selectedTimeRange === '24h' || selectedTimeRange === 'ALL') && (
                <circle cx="320" cy="280" r="5" fill="#18A66A" stroke="#ffffff" strokeWidth="2" />
              )}
              {(selectedTimeRange === '1h' || selectedTimeRange === '24h' || selectedTimeRange === 'ALL') && (
                <circle cx="410" cy="320" r="5" fill="#18A66A" stroke="#ffffff" strokeWidth="2" />
              )}
              <circle cx="480" cy="300" r="5" fill="#18A66A" stroke="#ffffff" strokeWidth="2" />
            </g>
          )}

          {/* Top-3 Predicted Route Branches (Dashed Lines) */}
          {activeLayers.predictions && predictionData && predictionData.topPredictions && (
            <g>
              {/* Branch 1 - 68% */}
              <path
                d="M 580 340 L 680 370 L 780 390"
                fill="none"
                stroke={isEcoTheme ? '#18A66A' : '#6366f1'}
                strokeWidth="4"
                strokeDasharray="6 4"
              />
              <rect x="710" y="365" width="45" height="18" rx="4" fill={isEcoTheme ? '#168A5B' : '#4f46e5'} />
              <text x="718" y="378" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                68%
              </text>

              {/* Branch 2 - 21% */}
              <path
                d="M 580 340 L 660 270 L 740 240"
                fill="none"
                stroke={isEcoTheme ? '#1677C8' : '#38bdf8'}
                strokeWidth="3"
                strokeDasharray="5 3"
              />
              <rect x="680" y="245" width="45" height="18" rx="4" fill={isEcoTheme ? '#1677C8' : '#0284c7'} />
              <text x="688" y="258" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                21%
              </text>

              {/* Branch 3 - 11% */}
              <path
                d="M 580 340 L 610 430 L 670 490"
                fill="none"
                stroke={isEcoTheme ? '#f59e0b' : '#a855f7'}
                strokeWidth="2"
                strokeDasharray="4 3"
              />
              <rect x="630" y="450" width="45" height="18" rx="4" fill={isEcoTheme ? '#d97706' : '#9333ea'} />
              <text x="638" y="463" fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                11%
              </text>
            </g>
          )}
        </svg>

        {/* Camera Markers */}
        {activeLayers.cameras &&
          cameras.map((cam, idx) => {
            const cx = 500 + (cam.longitude - mapCenter.lng) * 4000 * (zoomLevel / 12);
            const cy = 350 - (cam.latitude - mapCenter.lat) * 4000 * (zoomLevel / 12);
            const isSelected = selectedCameraId === cam.id;

            // Check if camera has active alerts matching severity filters
            const camAlerts = filteredAlerts.filter((a) => a.cameraId === cam.id);
            const highestAlert = camAlerts[0];

            return (
              <div
                key={cam.id}
                onClick={() => onSelectCamera(cam.id)}
                style={{ top: `${cy}px`, left: `${cx}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all group z-20`}
              >
                <div
                  className={`p-2 rounded-full border shadow-lg flex items-center justify-center transition-transform ${
                    isSelected
                      ? 'scale-125 bg-amber-500 border-white text-slate-950 ring-4 ring-amber-400/40'
                      : isEcoTheme
                      ? 'bg-white border-[#168A5B] text-[#168A5B] hover:scale-110'
                      : 'bg-slate-900 border-indigo-500 text-indigo-400 hover:scale-110'
                  }`}
                >
                  <CameraIcon className="w-4 h-4" />
                </div>

                {/* Alert Severity Badge Overlay on Camera */}
                {highestAlert && (
                  <div
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow animate-pulse ${
                      highestAlert.severity === 'CRITICAL'
                        ? 'bg-red-600'
                        : highestAlert.severity === 'HIGH'
                        ? 'bg-orange-600'
                        : highestAlert.severity === 'MEDIUM'
                        ? 'bg-yellow-600'
                        : 'bg-blue-600'
                    }`}
                  >
                    !
                  </div>
                )}

                {/* Tooltip on Hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 bg-slate-950 text-white font-mono text-[10px] rounded border border-slate-700 whitespace-nowrap shadow-xl pointer-events-none z-50">
                  <div className="font-bold">{cam.name}</div>
                  <div className="text-emerald-400">{cam.status} | FPS: {cam.fps}</div>
                  {highestAlert && (
                    <div className="text-red-400 font-bold mt-0.5">Alert: {highestAlert.ruleName} ({highestAlert.severity})</div>
                  )}
                </div>
              </div>
            );
          })}

        {/* Vehicle Markers (Filtered by Vehicle Types) */}
        {activeLayers.vehicles &&
          filteredTracks.map((track, idx) => {
            const vx = 500 + (track.currentLocationEstimate.lng - mapCenter.lng) * 4000 * (zoomLevel / 12);
            const vy = 350 - (track.currentLocationEstimate.lat - mapCenter.lat) * 4000 * (zoomLevel / 12);
            const isSelected = selectedVehicleId === track.globalTrackId;

            // Check if vehicle track has active alerts matching severity filters
            const vehicleAlerts = filteredAlerts.filter((a) => a.globalTrackId === track.globalTrackId);
            const highestVehicleAlert = vehicleAlerts[0];

            return (
              <div
                key={track.globalTrackId}
                onClick={() => onSelectVehicle(track.globalTrackId)}
                style={{ top: `${vy}px`, left: `${vx}px` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all z-30 group`}
              >
                <div
                  className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-xl transition-transform ${
                    isSelected
                      ? 'scale-110 bg-[#168A5B] text-white border-white ring-4 ring-[#18A66A]/40'
                      : isEcoTheme
                      ? 'bg-white border-[#18A66A] text-[#16322A] hover:scale-105'
                      : 'bg-slate-900 border-indigo-400 text-indigo-200 hover:scale-105'
                  }`}
                >
                  <Navigation
                    className="w-3.5 h-3.5 text-amber-400 transition-transform"
                    style={{ transform: `rotate(${track.currentLocationEstimate.headingDegrees}deg)` }}
                  />
                  <div className="font-mono text-xs font-bold">{track.primaryPlateText}</div>

                  {/* Severity Badge Tag */}
                  {highestVehicleAlert && (
                    <span
                      className={`px-1 py-0.2 text-[8px] font-mono font-bold text-white rounded ${
                        highestVehicleAlert.severity === 'CRITICAL'
                          ? 'bg-red-600'
                          : highestVehicleAlert.severity === 'HIGH'
                          ? 'bg-orange-600'
                          : highestVehicleAlert.severity === 'MEDIUM'
                          ? 'bg-yellow-600'
                          : 'bg-blue-600'
                      }`}
                    >
                      {highestVehicleAlert.severity[0]}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

        {/* Floating Top Region Badge */}
        <div className="absolute top-4 left-4 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-800/30 shadow-xl flex items-center gap-3">
          <Globe className="w-5 h-5 text-[#168A5B]" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ACTIVE GEO COMMAND REGION</div>
            <div className="text-sm font-bold font-mono text-[#16322A] dark:text-white flex items-center gap-2">
              {activeRegion}
              <span className="text-[10px] bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-[#18A66A]/30">
                GEO-SYNCED
              </span>
            </div>
          </div>
        </div>

        {/* PERSISTENT MAP FILTER PANEL */}
        <div className={`absolute top-4 right-4 z-40 w-80 sm:w-88 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${
          isEcoTheme
            ? 'bg-white/95 border-[#DDEBE4] text-[#16322A]'
            : 'bg-slate-900/95 border-slate-800 text-slate-100'
        }`}>
          {/* Filter Panel Header Bar */}
          <div
            onClick={() => setIsFilterPanelExpanded(!isFilterPanelExpanded)}
            className="px-4 py-2.5 cursor-pointer flex items-center justify-between border-b border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 border border-[#18A66A]/30">
                <Filter className="w-4 h-4" />
              </span>
              <div>
                <div className="text-xs font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                  MAP FILTERS & SEGMENTS
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  Showing {filteredTracks.length}/{tracks.length} Vehicles | {filteredAlerts.length} Alerts
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetFilters();
                }}
                className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
                title="Reset Map Filters"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
              <button className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white">
                {isFilterPanelExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Expanded Filter Panel Body */}
          {isFilterPanelExpanded && (
            <div className="p-4 space-y-4 font-mono text-xs max-h-[calc(100vh-180px)] overflow-y-auto">
              {/* SECTION 1: Vehicle Types Filter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-[#168A5B] dark:text-emerald-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5" />
                    Vehicle Classes ({selectedVehicleClasses.length}/{allVehicleClassesList.length})
                  </span>
                  <div className="flex gap-2 text-[10px] text-[#1677C8] dark:text-cyan-400">
                    <button
                      onClick={() => setSelectedVehicleClasses(allVehicleClassesList.map((c) => c.id))}
                      className="hover:underline"
                    >
                      All
                    </button>
                    <span>|</span>
                    <button onClick={() => setSelectedVehicleClasses([])} className="hover:underline">
                      None
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {allVehicleClassesList.map((item) => {
                    const isSelected = selectedVehicleClasses.includes(item.id);
                    const matchCount = tracks.filter((t) => (t.vehicleClass || '').toLowerCase() === item.id).length;
                    const IconComp = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleVehicleClass(item.id)}
                        className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#E8F7EF] dark:bg-emerald-950/80 border-[#18A66A] text-[#168A5B] dark:text-emerald-300 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <IconComp className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <span className={`text-[9px] px-1 rounded ${isSelected ? 'bg-[#168A5B] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                          {matchCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Alert Severity Filter */}
              <div className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-red-600 dark:text-red-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Alert Severities ({selectedSeverities.length}/4)
                  </span>
                  <div className="flex gap-2 text-[10px] text-[#1677C8] dark:text-cyan-400">
                    <button
                      onClick={() => setSelectedSeverities(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'])}
                      className="hover:underline"
                    >
                      All
                    </button>
                    <span>|</span>
                    <button onClick={() => setSelectedSeverities([])} className="hover:underline">
                      None
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {severityConfigs.map((cfg) => {
                    const isSelected = selectedSeverities.includes(cfg.severity);
                    const alertCount = alerts.filter((a) => a.severity === cfg.severity).length;

                    return (
                      <button
                        key={cfg.severity}
                        onClick={() => toggleSeverity(cfg.severity)}
                        className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-bold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-900 text-slate-400 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${cfg.badgeBg}`}></span>
                          <span className="text-slate-800 dark:text-slate-200">{cfg.label}</span>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] text-white font-bold ${cfg.badgeBg}`}>
                          {alertCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: Time-Based Historical Segment Filter */}
              <div className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Historical Trail Segment
                  </span>
                  <span className="text-[10px] text-slate-400">WINDOW</span>
                </div>

                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  {(['15m', '1h', '24h', 'ALL'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setSelectedTimeRange(range)}
                      className={`py-1 rounded-lg text-[10px] font-bold transition-all text-center ${
                        selectedTimeRange === range
                          ? 'bg-[#168A5B] text-white shadow'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      {range === '15m'
                        ? '15m'
                        : range === '1h'
                        ? '1h'
                        : range === '24h'
                        ? '24h'
                        : 'ALL'}
                    </button>
                  ))}
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                  {selectedTimeRange === '15m' && 'Rendering recent 15-min trail & camera checkpoints.'}
                  {selectedTimeRange === '1h' && 'Rendering 1-hour trajectory with historical waypoints.'}
                  {selectedTimeRange === '24h' && 'Rendering 24-hour multi-camera traversed path.'}
                  {selectedTimeRange === 'ALL' && 'Rendering full historical trajectory across all observations.'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Map Zoom & Fullscreen Controls */}
        <div className="absolute right-4 bottom-6 z-40 flex flex-col gap-2 font-mono text-xs">
          <button
            onClick={toggleFullscreen}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shadow-lg transition-all ${
              isFullscreen
                ? 'bg-purple-600 text-white border-purple-500'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-800 dark:text-white hover:bg-slate-100'
            }`}
            title="Toggle Browser Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-lg flex items-center justify-center shadow-lg hover:bg-slate-100 transition-all"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 3))}
            className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-800 dark:text-white font-bold text-lg flex items-center justify-center shadow-lg hover:bg-slate-100 transition-all"
            title="Zoom Out"
          >
            -
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

