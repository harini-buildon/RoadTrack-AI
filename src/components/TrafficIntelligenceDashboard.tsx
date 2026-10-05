import React, { useState, useEffect } from 'react';
import {
  Camera,
  GlobalVehicleTrack,
  RoadNode,
  RoadEdge,
  EnsemblePrediction,
  InfrastructurePOI
} from '../types';
import {
  Camera as CameraIcon,
  Video,
  Layers,
  Activity,
  Compass,
  Zap,
  CheckCircle2,
  Navigation,
  Sparkles,
  TrendingUp,
  Cpu,
  Clock,
  Shield,
  Radio,
  Sliders,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Network,
  Eye,
  Info,
  Server,
  Database,
  ArrowRight,
  GitBranch,
  Search
} from 'lucide-react';
import { TrackingOverlay } from './map/TrackingOverlay';
import { PredictedRouteData } from './map/PredictionRouteLayer';
import { CameraMarkerData } from './map/CameraLayer';
import { VehicleMarkerData } from './map/VehicleLayer';
import { AlertMarkerData } from './map/AlertLayer';
import { GeoProjectionService } from '../services/map/GeoProjectionService';
import { RealtimeOpenStreetMap } from './map/RealtimeOpenStreetMap';
import { MapLibreCommandMap } from './map/MapLibreCommandMap';

interface TrafficIntelligenceDashboardProps {
  cameras: Camera[];
  tracks: GlobalVehicleTrack[];
  nodes: RoadNode[];
  edges: RoadEdge[];
  onSimulateTick?: () => void;
  isAutoSimulating?: boolean;
  setIsAutoSimulating?: (val: boolean) => void;
  isEcoTheme?: boolean;
}

export const TrafficIntelligenceDashboard: React.FC<TrafficIntelligenceDashboardProps> = ({
  cameras,
  tracks,
  nodes,
  edges,
  onSimulateTick,
  isAutoSimulating = false,
  setIsAutoSimulating,
  isEcoTheme = true
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.globalTrackId || 'TRACK_V042');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('CAM-101');
  const [predictionData, setPredictionData] = useState<EnsemblePrediction | null>(null);
  const [infrastructure, setInfrastructure] = useState<InfrastructurePOI[]>([]);
  const [gisEngine, setGisEngine] = useState<'maplibre' | 'osm'>('maplibre');
  const [mapTileMode, setMapTileMode] = useState<'osm' | 'satellite'>('osm');
  const [activeBottomTab, setActiveBottomTab] = useState<'predictions' | 'markov' | 'architecture'>('predictions');

  // Infrastructure Layer Visibility Toggles (Section 10 of Spec)
  const [infraLayers, setInfraLayers] = useState({
    cctv: true,
    signals: true,
    police: true,
    hospitals: true,
    fireStations: true,
    petrolStations: true,
    junctions: true,
    trafficDensity: true
  });

  const activeTrack = tracks.find((t) => t.globalTrackId === selectedTrackId) || tracks[0];

  // Fetch infrastructure POIs & predictions
  useEffect(() => {
    fetch('/api/v1/infrastructure')
      .then((res) => res.json())
      .then((data) => setInfrastructure(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeTrack) return;
    fetch(`/api/v1/predictions/${activeTrack.globalTrackId}`)
      .then((res) => res.json())
      .then((data) => setPredictionData(data))
      .catch(() => {});
  }, [activeTrack]);

  // Geo bounds for OpenStreetMap canvas projection
  const bounds = {
    minLat: 37.768,
    maxLat: 37.782,
    minLng: -122.426,
    maxLng: -122.411
  };

  // Convert track observations to 2D percentage points for SVG map overlay
  const historicalRoutePoints = (activeTrack?.recentObservations || []).map((obs) => {
    const cam = cameras.find((c) => c.id === obs.cameraId);
    const lat = cam ? cam.latitude : activeTrack.currentLocationEstimate.lat;
    const lng = cam ? cam.longitude : activeTrack.currentLocationEstimate.lng;
    return GeoProjectionService.projectToPercent(lat, lng, bounds);
  });

  // Predicted K-shortest paths with color-blind friendly styling
  const predictedRoutes: PredictedRouteData[] = (predictionData?.topPredictions || [
    {
      rank: 1,
      probability: 0.62,
      routeName: 'Grand Ave Flyover East -> Harbor Blvd',
      destinationName: 'Junction A - Harbor Gateway',
      etaSecondsRange: [35, 50],
      distanceMeters: 450
    },
    {
      rank: 2,
      probability: 0.25,
      routeName: 'Market Street Arterial South',
      destinationName: 'Junction B - Financial District',
      etaSecondsRange: [60, 80],
      distanceMeters: 520
    },
    {
      rank: 3,
      probability: 0.13,
      routeName: 'Central Plaza Roundabout Loop',
      destinationName: 'Junction C - Civic Hub',
      etaSecondsRange: [90, 120],
      distanceMeters: 610
    }
  ]).map((pred: any, idx: number) => {
    const startPt = GeoProjectionService.projectToPercent(
      activeTrack?.currentLocationEstimate.lat || 37.7754,
      activeTrack?.currentLocationEstimate.lng || -122.4150,
      bounds
    );

    // K-Shortest Path waypoints branching outwards
    const offsets = [
      [{ x: 62, y: 38 }, { x: 74, y: 34 }, { x: 86, y: 30 }],
      [{ x: 55, y: 48 }, { x: 58, y: 62 }, { x: 62, y: 76 }],
      [{ x: 44, y: 36 }, { x: 38, y: 24 }, { x: 32, y: 16 }]
    ];

    const branch = offsets[idx % offsets.length] || offsets[0];

    return {
      rank: pred.rank || idx + 1,
      probability: pred.probability || (idx === 0 ? 0.62 : idx === 1 ? 0.25 : 0.13),
      routeName: pred.roadSegmentName || pred.routeName || `Yen's Path #${idx + 1}`,
      destinationName: pred.nextIntersectionName || pred.destinationName || `Destination Junction ${String.fromCharCode(65 + idx)}`,
      points: [startPt, ...branch]
    };
  });

  const cameraMarkers: CameraMarkerData[] = cameras.map((c) => {
    const pt = GeoProjectionService.projectToPercent(c.latitude, c.longitude, bounds);
    return {
      id: c.id,
      name: c.name,
      locationName: c.locationName || c.name,
      status: (c.status as any) || 'ONLINE',
      screenPos: { x: pt.x, y: pt.y },
      isSelected: c.id === selectedCameraId || c.id === activeTrack?.currentCameraId
    };
  });

  const vehicleMarkers: VehicleMarkerData[] = tracks.map((t) => {
    const pt = GeoProjectionService.projectToPercent(
      t.currentLocationEstimate?.lat || 37.7754,
      t.currentLocationEstimate?.lng || -122.4150,
      bounds
    );
    return {
      id: t.globalTrackId,
      plateText: t.anonymousVehicleId || t.primaryPlateText || 'V-042',
      vehicleClass: t.vehicleClass || 'car',
      vehicleColor: t.vehicleColor || 'Silver',
      speedKmh: t.currentLocationEstimate?.speedKmh || 45,
      direction: t.currentLocationEstimate?.directionName || 'NORTH_EAST',
      headingDegrees: t.currentLocationEstimate?.headingDegrees || 45,
      confidence: t.confidenceFusion?.combinedScore || 0.92,
      timestamp: t.lastSeenTimestamp || new Date().toISOString(),
      screenPos: { x: pt.x, y: pt.y },
      isSelected: t.globalTrackId === activeTrack?.globalTrackId
    };
  });

  const fusion = activeTrack?.confidenceFusion || {
    appearanceSimilarity: 0.88,
    colorSimilarity: 0.94,
    vehicleTypeSimilarity: 0.97,
    temporalConsistency: 0.91,
    routeConsistency: 0.86,
    combinedScore: 0.91
  };

  return (
    <div className="w-full flex flex-col gap-3 p-2 sm:p-4 text-slate-900 dark:text-slate-100 font-sans">
      {/* 1. TOP HEADER & CONTROL BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center text-white shadow-md">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-sm sm:text-base tracking-tight uppercase">
                TRAFFIC INTELLIGENCE PLATFORM
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                SYSTEM ONLINE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              Multi-Camera Vehicle Re-ID • Yen's K-Shortest Paths • OpenStreetMap GIS
            </div>
          </div>
        </div>

        {/* Control Strip */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target Anonymous Vehicle Switcher */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
            <span className="text-slate-500 text-[11px]">Track Token:</span>
            <select
              value={selectedTrackId}
              onChange={(e) => setSelectedTrackId(e.target.value)}
              className="bg-transparent font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none cursor-pointer"
            >
              {tracks.map((t) => (
                <option key={t.globalTrackId} value={t.globalTrackId} className="bg-slate-900 text-white">
                  {t.anonymousVehicleId} - {t.vehicleColor} {t.vehicleClass.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Simulation Tick Controls */}
          {setIsAutoSimulating && (
            <button
              onClick={() => setIsAutoSimulating(!isAutoSimulating)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                isAutoSimulating
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {isAutoSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoSimulating ? 'SIMULATING (3s)' : 'AUTO-SIMULATE'}</span>
            </button>
          )}

          {onSimulateTick && (
            <button
              onClick={onSimulateTick}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-mono bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-sm"
              title="Trigger single step simulation"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>STEP</span>
            </button>
          )}

          {/* Map Base Tile Switcher */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold">
            <button
              onClick={() => setMapTileMode('osm')}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapTileMode === 'osm' ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              OSM
            </button>
            <button
              onClick={() => setMapTileMode('satellite')}
              className={`px-2 py-1 rounded-lg transition-all ${
                mapTileMode === 'satellite' ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              SATELLITE
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN TWO-BRAIN VIEW: LEFT CCTV TRACKING + RIGHT OPENSTREETMAP GIS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-[580px]">
        {/* LEFT BRAIN: CCTV TRACKING & CAMERA PROCESSOR (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {/* A. 4-Camera Multi-View Grid */}
          <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-slate-700 dark:text-slate-300 font-mono">
                <Video className="w-3.5 h-3.5 text-blue-500" />
                <span>CCTV MATRIX (YOLOv8 + ByteTrack)</span>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                4 FEEDS ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {cameras.slice(0, 4).map((cam, idx) => {
                const isActive = cam.id === activeTrack?.currentCameraId || cam.id === selectedCameraId;
                return (
                  <div
                    key={cam.id}
                    onClick={() => setSelectedCameraId(cam.id)}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all ${
                      isActive
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-slate-200 dark:border-slate-800 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* Simulated Camera Video Frame */}
                    <div className="aspect-video bg-slate-950 relative flex items-center justify-center overflow-hidden">
                      {/* Background Road/Traffic Scene */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900 to-slate-950" />

                      {/* Perspective Road Markings */}
                      <div className="absolute inset-0 opacity-25">
                        <div className="w-full h-full border-b border-dashed border-amber-400 transform -skew-x-12" />
                      </div>

                      {/* YOLO Bounding Box Overlay for Target Vehicle */}
                      {isActive && (
                        <div className="absolute inset-4 border-2 border-emerald-400 bg-emerald-500/15 rounded-lg flex flex-col justify-between p-1 animate-pulse">
                          <div className="bg-emerald-500 text-slate-950 text-[9px] font-mono font-black px-1 py-0.5 rounded self-start flex items-center gap-1 shadow">
                            <span>{activeTrack?.anonymousVehicleId || 'V-042'}</span>
                            <span>96%</span>
                          </div>
                          <div className="text-[8px] font-mono font-bold text-white bg-slate-950/80 px-1 py-0.5 rounded self-end">
                            {activeTrack?.vehicleColor} {activeTrack?.vehicleClass.toUpperCase()}
                          </div>
                        </div>
                      )}

                      {/* Camera Tag & Rec Dot */}
                      <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-slate-950/85 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span>CAM 0{idx + 1}</span>
                      </div>
                      <div className="absolute bottom-1 right-1.5 text-[8px] font-mono text-slate-400 bg-black/60 px-1 rounded">
                        30 FPS • 1080p
                      </div>
                    </div>

                    <div className="p-1.5 bg-slate-50 dark:bg-slate-950 text-[10px] font-mono font-bold flex items-center justify-between">
                      <span className="truncate max-w-[120px] text-slate-700 dark:text-slate-300">{cam.name}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 text-[9px]">LIVE</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. Active Vehicle Information Card */}
          <div className="p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm font-mono">
            <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800 mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-black text-xs uppercase tracking-wide">VEHICLE INFORMATION</span>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs border border-emerald-500/30">
                {activeTrack?.anonymousVehicleId || 'V-042'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500">TYPE</div>
                <div className="font-black text-slate-800 dark:text-slate-200 uppercase">{activeTrack?.vehicleClass}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500">COLOR</div>
                <div className="font-black text-slate-800 dark:text-slate-200">{activeTrack?.vehicleColor}</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500">DIRECTION</div>
                <div className="font-black text-blue-600 dark:text-blue-400">
                  {activeTrack?.currentLocationEstimate.directionName || 'NE'} ({activeTrack?.currentLocationEstimate.headingDegrees || 45}°)
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500">EST. SPEED</div>
                <div className="font-black text-emerald-600 dark:text-emerald-400">{activeTrack?.currentLocationEstimate.speedKmh || 48} KM/H</div>
              </div>
            </div>

            {/* Re-ID Multi-Feature Confidence Fusion Breakdown (Section 17 of Spec) */}
            <div className="space-y-1.5 pt-1 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  CONFIDENCE FUSION SCORE:
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                  {(fusion.combinedScore * 100).toFixed(0)}% COMBINED
                </span>
              </div>

              {/* Progress bars for multi-feature fusion */}
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Appearance Embedding:</span>
                  <span className="font-bold">{(fusion.appearanceSimilarity * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fusion.appearanceSimilarity * 100}%` }} />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500">Color Similarity:</span>
                  <span className="font-bold">{(fusion.colorSimilarity * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${fusion.colorSimilarity * 100}%` }} />
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-slate-500">Temporal / Kinematic:</span>
                  <span className="font-bold">{(fusion.temporalConsistency * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${fusion.temporalConsistency * 100}%` }} />
                </div>
              </div>
            </div>

            {/* C. Camera Events Timeline */}
            <div className="pt-3 mt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  CAMERA EVENTS TIMELINE
                </span>
                <span className="text-[10px] text-slate-500">{activeTrack?.recentObservations?.length || 4} SIGHTINGS</span>
              </div>

              <div className="space-y-1.5">
                {(activeTrack?.recentObservations || []).map((obs, idx) => (
                  <div
                    key={obs.observationId || idx}
                    className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 font-black text-[10px] flex items-center justify-center text-slate-700 dark:text-slate-300">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white mr-1.5">{obs.timeFormatted || '10:31'}</span>
                        <span className="text-slate-600 dark:text-slate-400">{obs.cameraName || `Camera 0${idx + 1}`}</span>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                      {(obs.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT BRAIN: REAL-TIME OPENSTREETMAP & INDIA GEO MAPS GIS (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-white/95 dark:bg-slate-900/95 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setGisEngine('maplibre')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  gisEngine === 'maplibre'
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-400/50'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>MapLibre GL Vector & India GeoJSON</span>
              </button>

              <button
                onClick={() => setGisEngine('osm')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  gisEngine === 'osm'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Leaflet OSM Tiles</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 hidden sm:block">
              {gisEngine === 'maplibre' ? 'MapLibre GL • Dynamic Choropleth Analytics' : 'Leaflet • Real-Time OSM Tiles'}
            </div>
          </div>

          {gisEngine === 'maplibre' ? (
            <MapLibreCommandMap
              cameras={cameras}
              tracks={tracks}
              nodes={nodes}
              edges={edges}
              infrastructure={infrastructure}
              selectedVehicleId={selectedTrackId}
              onSelectVehicle={(id) => setSelectedTrackId(id)}
              selectedCameraId={selectedCameraId}
              onSelectCamera={(id) => setSelectedCameraId(id)}
              isEcoTheme={isEcoTheme}
              className="w-full h-full min-h-[500px]"
            />
          ) : (
            <RealtimeOpenStreetMap
              cameras={cameras}
              tracks={tracks}
              nodes={nodes}
              edges={edges}
              infrastructure={infrastructure}
              selectedVehicleId={selectedTrackId}
              onSelectVehicle={(id) => setSelectedTrackId(id)}
              selectedCameraId={selectedCameraId}
              onSelectCamera={(id) => setSelectedCameraId(id)}
              isEcoTheme={isEcoTheme}
              className="w-full h-full min-h-[500px]"
            />
          )}
        </div>
      </div>

      {/* 3. BOTTOM PANEL: ROUTE PREDICTION, MARKOV TRANSITIONS & OPEN-SOURCE ARCHITECTURE */}
      <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-sm font-mono">
        <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-800 mb-3">
          {/* Navigation Tabs for Bottom Intelligence Panel */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveBottomTab('predictions')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeBottomTab === 'predictions'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>NEXT POSSIBLE LOCATIONS (TOP-3)</span>
            </button>
            <button
              onClick={() => setActiveBottomTab('markov')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeBottomTab === 'markov'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>MARKOV TRANSITION MATRIX</span>
            </button>
            <button
              onClick={() => setActiveBottomTab('architecture')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeBottomTab === 'architecture'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>OPEN-SOURCE ARCHITECTURE</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:block">
            Routing Cost: <span className="font-bold text-slate-700 dark:text-slate-300">Distance + Travel Time + Congestion + Turn Penalty</span>
          </div>
        </div>

        {/* TAB 1: NEXT POSSIBLE LOCATIONS CARDS (Yen's K-Shortest Paths) */}
        {activeBottomTab === 'predictions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {predictedRoutes.map((route) => {
              const pct = Math.round(route.probability * 100);
              const isRank1 = route.rank === 1;
              const isRank2 = route.rank === 2;

              return (
                <div
                  key={route.rank}
                  className={`p-3.5 rounded-xl border space-y-2 transition-all ${
                    isRank1
                      ? 'bg-cyan-500/10 border-cyan-400 dark:border-cyan-500/50 shadow-sm'
                      : isRank2
                      ? 'bg-emerald-500/10 border-emerald-400 dark:border-emerald-500/50'
                      : 'bg-indigo-500/10 border-indigo-400 dark:border-indigo-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-6 h-6 rounded-lg text-white font-black text-xs flex items-center justify-center ${
                          isRank1 ? 'bg-cyan-600' : isRank2 ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                      >
                        #{route.rank}
                      </span>
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate max-w-[170px]">
                          {route.destinationName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                          {route.routeName}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-lg font-black text-sm border ${
                        isRank1
                          ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border-cyan-500/40'
                          : isRank2
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/40'
                      }`}
                    >
                      {pct}%
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isRank1 ? 'bg-cyan-500' : isRank2 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200 dark:border-slate-800/80">
                    <span>Est. Travel Time: <strong>{35 * route.rank}s</strong></span>
                    <span>Distance: <strong>{400 + route.rank * 60}m</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: MARKOV TRANSITION MATRIX (Section 6 of Spec) */}
        {activeBottomTab === 'markov' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">
              Camera-to-camera movement probabilities learned from aggregate/anonymized historical traffic data:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2">From Camera</th>
                    <th className="p-2">To Camera 01</th>
                    <th className="p-2">To Camera 02</th>
                    <th className="p-2">To Camera 03</th>
                    <th className="p-2">To Camera 04</th>
                    <th className="p-2">Avg. Travel Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2 font-bold text-slate-900 dark:text-white">Camera 01 (1st St)</td>
                    <td className="p-2 text-slate-400">-</td>
                    <td className="p-2 font-black text-emerald-600 dark:text-emerald-400">68%</td>
                    <td className="p-2 font-bold text-slate-600 dark:text-slate-300">24%</td>
                    <td className="p-2 text-slate-500">8%</td>
                    <td className="p-2 text-slate-400">32s ± 4s</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2 font-bold text-slate-900 dark:text-white">Camera 02 (Grand & Market)</td>
                    <td className="p-2 text-slate-500">21%</td>
                    <td className="p-2 text-slate-400">-</td>
                    <td className="p-2 font-black text-emerald-600 dark:text-emerald-400">48%</td>
                    <td className="p-2 font-bold text-slate-600 dark:text-slate-300">31%</td>
                    <td className="p-2 text-slate-400">36s ± 4s</td>
                  </tr>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-2 font-bold text-slate-900 dark:text-white">Camera 03 (Flyover North)</td>
                    <td className="p-2 text-slate-500">10%</td>
                    <td className="p-2 text-slate-500">18%</td>
                    <td className="p-2 text-slate-400">-</td>
                    <td className="p-2 font-black text-emerald-600 dark:text-emerald-400">72%</td>
                    <td className="p-2 text-slate-400">34s ± 4s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OPEN-SOURCE ARCHITECTURE BLUEPRINT (Section 1 & 18 of Spec) */}
        {activeBottomTab === 'architecture' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>1. Computer Vision</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>• <strong>YOLOv8</strong> Vehicle Detection</li>
                <li>• <strong>ByteTrack / BoT-SORT</strong> Tracking</li>
                <li>• <strong>512-dim</strong> Re-ID Embeddings</li>
                <li>• Temporary Token <strong>V-042</strong></li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Network className="w-4 h-4" />
                <span>2. Road Graph & Routing</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>• <strong>OpenStreetMap</strong> + <strong>OSMnx</strong></li>
                <li>• <strong>NetworkX</strong> Graph Engine</li>
                <li>• <strong>Dijkstra</strong> & <strong>A*</strong> Routing</li>
                <li>• <strong>Yen's K-Shortest Paths</strong></li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Server className="w-4 h-4" />
                <span>3. Backend & Geo DB</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>• <strong>FastAPI</strong> Python Microservices</li>
                <li>• <strong>PostgreSQL</strong> + <strong>PostGIS</strong></li>
                <li>• <strong>Redis</strong> Stream Event Queue</li>
                <li>• <strong>WebSockets</strong> Realtime Sync</li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-extrabold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>4. GIS Visualization</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <li>• <strong>React</strong> + <strong>MapLibre GL JS</strong></li>
                <li>• Color-Blind Friendly Dash Paths</li>
                <li>• Satellite Contrast Casing</li>
                <li>• Infrastructure POI Layers</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
