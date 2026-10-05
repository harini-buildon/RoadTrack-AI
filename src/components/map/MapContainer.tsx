import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleMapEmbed } from './GoogleMapEmbed';
import { TrackingOverlay } from './TrackingOverlay';
import { MapUIControls } from './MapUIControls';
import { VehicleInfoPanel } from './VehicleInfoPanel';
import { GeoProjectionService } from '../../services/map/GeoProjectionService';
import { defaultMapProvider } from '../../services/map/MapProvider';
import { Point2D } from '../../services/map/GeoProjectionService';
import { PredictedRouteData } from './PredictionRouteLayer';
import { VehicleMarkerData } from './VehicleLayer';
import { CameraMarkerData } from './CameraLayer';
import { AlertMarkerData } from './AlertLayer';

interface MapContainerProps {
  activeRegion?: string;
  setActiveRegion?: (region: string) => void;
  selectedVehicleId?: string | null;
  onSelectVehicle?: (id: string | null) => void;
  selectedCameraId?: string | null;
  onSelectCamera?: (id: string | null) => void;
  unreadAlertsCount?: number;
  focusPathTrigger?: { id: string; timestamp: number } | null;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  activeRegion = 'Tamil Nadu',
  setActiveRegion,
  selectedVehicleId,
  onSelectVehicle,
  selectedCameraId,
  onSelectCamera,
  unreadAlertsCount = 0,
  focusPathTrigger
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeVehicleId, setActiveVehicleId] = useState<string | null>(selectedVehicleId || 'TRACK_7XYZ982');
  const [isFollowingVehicle, setIsFollowingVehicle] = useState<boolean>(true);
  const [isReplayingRoute, setIsReplayingRoute] = useState<boolean>(false);
  const [replayProgress, setReplayProgress] = useState<number>(100);

  // Viewport Transform State for Smooth Pan and Zoom
  const [viewportTransform, setViewportTransform] = useState<{
    scale: number;
    translateX: number;
    translateY: number;
    isFocused: boolean;
  }>({
    scale: 1,
    translateX: 0,
    translateY: 0,
    isFocused: false
  });

  // Projection service calibrated for region
  const projection = useMemo(() => {
    return new GeoProjectionService(activeRegion);
  }, [activeRegion]);

  // Handle Fullscreen mode
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
        containerRef.current.requestFullscreen().catch(console.error);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    }
  };

  // 1. Vehicle Live Trajectory State
  const [vehPos, setVehPos] = useState({ lat: 12.8200, lng: 78.8500 }); // Ranipet / Arakkonam Corridor

  // Live simulation tick moving vehicle along Ramdev Hardware, Guruvarajapet corridor
  useEffect(() => {
    const interval = setInterval(() => {
      setVehPos((prev) => {
        const destLat = 12.9200;
        const destLng = 79.1200;
        const deltaLat = (destLat - prev.lat) * 0.03;
        const deltaLng = (destLng - prev.lng) * 0.03;

        if (Math.abs(destLat - prev.lat) < 0.002 && Math.abs(destLng - prev.lng) < 0.002) {
          return { lat: 12.8200, lng: 78.8500 }; // Reset loop start
        }
        return { lat: prev.lat + deltaLat, lng: prev.lng + deltaLng };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // 2. Projected Screen Points for Overlay
  // Historical Route (Solid Dark Blue Line)
  const historicalRawPoints = [
    { lat: 11.6000, lng: 78.1000 }, // Salem Hub
    { lat: 12.1000, lng: 78.4000 }, // Tirupattur Link
    { lat: 12.5000, lng: 78.6500 }, // Vellore Highway
    vehPos
  ];

  const historicalRoutePoints: Point2D[] = useMemo(() => {
    return historicalRawPoints.map((pt) => projection.project(pt.lat, pt.lng));
  }, [historicalRawPoints, projection]);

  // Top-3 AI Predicted Future Routes (Growing Dashed Blue/Green/Purple Lines)
  const predictions: PredictedRouteData[] = useMemo(() => {
    const rawPred1 = [
      vehPos,
      { lat: 13.0000, lng: 79.3500 },
      { lat: 13.0800, lng: 79.8000 },
      { lat: 13.1200, lng: 80.2200 } // Ramdev Hardware, Guruvarajapet / Chennai Link
    ];

    const rawPred2 = [
      vehPos,
      { lat: 13.1200, lng: 78.9500 },
      { lat: 13.3500, lng: 79.1200 },
      { lat: 13.5200, lng: 79.2800 } // Chinnakadambur Checkpost
    ];

    const rawPred3 = [
      vehPos,
      { lat: 12.4500, lng: 79.1000 },
      { lat: 12.0500, lng: 79.3500 },
      { lat: 11.7200, lng: 79.5200 } // Soganur Substation
    ];

    return [
      {
        rank: 1,
        probability: 0.67,
        routeName: 'Guruvarajapet Main Rd via Gokula Gaushala',
        destinationName: 'Ramdev Hardware',
        points: rawPred1.map((pt) => projection.project(pt.lat, pt.lng))
      },
      {
        rank: 2,
        probability: 0.23,
        routeName: 'Chinnakadambur Bypass Link',
        destinationName: 'Chinnakadambur',
        points: rawPred2.map((pt) => projection.project(pt.lat, pt.lng))
      },
      {
        rank: 3,
        probability: 0.10,
        routeName: 'Soganur District Connector',
        destinationName: 'Soganur Substation',
        points: rawPred3.map((pt) => projection.project(pt.lat, pt.lng))
      }
    ];
  }, [vehPos, projection]);

  // Camera Markers
  const cameras: CameraMarkerData[] = useMemo(() => {
    const camsRaw = [
      { id: 'CAM-001', name: 'Gokula Gaushala East', locationName: 'Guruvarajapet Rd', status: 'PROCESSING' as const, lat: 13.0000, lng: 79.3500 },
      { id: 'CAM-002', name: 'Gedarikuppam Junction', locationName: 'Gedarikuppam', status: 'ONLINE' as const, lat: 12.5000, lng: 78.6500 },
      { id: 'CAM-003', name: 'Ramdev Hardware Gate', locationName: 'Ramdev Hardware', status: 'ONLINE' as const, lat: 13.1200, lng: 80.2200 },
      { id: 'CAM-004', name: 'Chinnakadambur North', locationName: 'Chinnakadambur', status: 'WARNING' as const, lat: 13.3500, lng: 79.1200 },
      { id: 'CAM-005', name: 'Soganur Toll Gate', locationName: 'Soganur', status: 'OFFLINE' as const, lat: 12.0500, lng: 79.3500 }
    ];

    return camsRaw.map((c) => ({
      ...c,
      screenPos: projection.project(c.lat, c.lng),
      isSelected: selectedCameraId === c.id
    }));
  }, [projection, selectedCameraId]);

  // Active Tracked Vehicles
  const vehicles: VehicleMarkerData[] = useMemo(() => {
    const vehScreen = projection.project(vehPos.lat, vehPos.lng);

    return [
      {
        id: 'TRACK_7XYZ982',
        plateText: 'TN-20-CZ-9821',
        vehicleClass: 'car',
        vehicleColor: 'Silver',
        speedKmh: 42,
        direction: 'NORTH_EAST',
        confidence: 0.96,
        timestamp: new Date().toLocaleTimeString(),
        screenPos: vehScreen,
        isSelected: activeVehicleId === 'TRACK_7XYZ982'
      }
    ];
  }, [vehPos, projection, activeVehicleId]);

  // Alert Markers
  const alerts: AlertMarkerData[] = useMemo(() => {
    const alertRaw = [
      {
        id: 'ALERT_1',
        type: 'PREDICTIVE ROUTE MATCH',
        message: 'Vehicle following 67% rank 1 trajectory towards Ramdev Hardware',
        severity: 'MEDIUM' as const,
        lat: 13.0800,
        lng: 79.8000
      }
    ];

    return alertRaw.map((a) => ({
      ...a,
      screenPos: projection.project(a.lat, a.lng)
    }));
  }, [projection]);

  // Selected Vehicle Object for Drawer
  const selectedVehicleObj = useMemo(() => {
    if (!activeVehicleId) return null;
    return {
      id: 'TRACK_7XYZ982',
      plateText: 'TN-20-CZ-9821',
      vehicleClass: 'SUV / Sedan',
      vehicleColor: 'Silver Grey',
      speedKmh: 42,
      direction: 'NORTH_EAST',
      locationName: 'Near Gokula Gaushala, Guruvarajapet',
      roadName: 'Ramdev Hardware Connector Road',
      lastCameraName: 'CAM-001 (Gokula Gaushala East)'
    };
  }, [activeVehicleId]);

  // Route replay simulation effect
  useEffect(() => {
    let interval: any;
    if (isReplayingRoute) {
      setReplayProgress(0);
      interval = setInterval(() => {
        setReplayProgress((prev) => {
          if (prev >= 100) {
            setIsReplayingRoute(false);
            return 100;
          }
          return prev + 10;
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isReplayingRoute]);

  // Auto Pan and Zoom to Vehicle & Entire Projected Path
  useEffect(() => {
    if (focusPathTrigger) {
      // 1. Gather all points belonging to vehicle and top 3 projected paths
      const currentVehScreen = projection.project(vehPos.lat, vehPos.lng);
      const allPoints: Point2D[] = [
        currentVehScreen,
        ...predictions.flatMap((p) => p.points)
      ];

      const xs = allPoints.map((p) => p.x);
      const ys = allPoints.map((p) => p.y);

      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const centerX = (minX + maxX) / 2;
      const centerY = (minY + maxY) / 2;
      const spanX = Math.max(12, maxX - minX);
      const spanY = Math.max(12, maxY - minY);

      // Desired view framing: fit full trajectory in ~55% of viewport width and ~50% of viewport height
      // Offset slightly to 42% X to leave breathing room for right drawer
      const targetScaleX = 55 / spanX;
      const targetScaleY = 50 / spanY;
      const calculatedScale = Math.min(Math.max(Math.min(targetScaleX, targetScaleY), 1.35), 2.75);

      const shiftX = (42 - centerX);
      const shiftY = (50 - centerY);

      setViewportTransform({
        scale: Number(calculatedScale.toFixed(2)),
        translateX: Number((shiftX * calculatedScale).toFixed(2)),
        translateY: Number((shiftY * calculatedScale).toFixed(2)),
        isFocused: true
      });

      setIsFollowingVehicle(true);
    }
  }, [focusPathTrigger, vehPos, predictions, projection]);

  const handleResetViewport = () => {
    setViewportTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
      isFocused: false
    });
  };

  const handleZoomIn = () => {
    setViewportTransform((prev) => ({
      ...prev,
      scale: Number(Math.min(prev.scale + 0.35, 3.5).toFixed(2)),
      isFocused: true
    }));
  };

  const handleZoomOut = () => {
    setViewportTransform((prev) => {
      const nextScale = Number(Math.max(prev.scale - 0.35, 1).toFixed(2));
      return {
        ...prev,
        scale: nextScale,
        isFocused: nextScale > 1
      };
    });
  };

  const handleSelectVehicle = (id: string | null) => {
    setActiveVehicleId(id);
    onSelectVehicle?.(id);
  };

  const handleSearch = (term: string) => {
    if (setActiveRegion && (term.toLowerCase().includes('kerala') || term.toLowerCase().includes('delhi'))) {
      setActiveRegion(term);
    }
  };

  return (
    <div
      ref={containerRef}
      className="map-container relative w-full h-full min-h-[600px] overflow-hidden select-none bg-slate-950 font-mono"
      style={{ width: '100%', height: '100%' }}
    >
      {/* MAP CANVAS & TRACKING OVERLAY VIEWPORT TRANSFORM WRAPPER */}
      <div
        className="w-full h-full relative transition-transform duration-700 ease-out origin-center"
        style={{
          transform: viewportTransform.isFocused
            ? `translate(${viewportTransform.translateX}%, ${viewportTransform.translateY}%) scale(${viewportTransform.scale})`
            : 'translate(0%, 0%) scale(1)'
        }}
      >
        {/* LAYER 1: Google Maps Embed (Exact Tamil Nadu Embed URL, no API key) */}
        <GoogleMapEmbed embedUrl={defaultMapProvider.getEmbedUrl(activeRegion)} regionName={activeRegion} />

        {/* LAYER 2: Transparent Application Tracking Overlay */}
        <TrackingOverlay
          historicalRoutePoints={historicalRoutePoints}
          predictions={predictions}
          cameras={cameras}
          vehicles={vehicles}
          alerts={alerts}
          onSelectVehicle={(id) => handleSelectVehicle(id)}
          onSelectCamera={(camId) => onSelectCamera?.(camId)}
        />
      </div>

      {/* AUTO-FRAMED VIEWPORT STATUS BADGE */}
      {viewportTransform.isFocused && (
        <div className="absolute top-18 left-4 z-40 bg-slate-900/95 border border-emerald-500/80 rounded-2xl shadow-2xl px-3.5 py-1.5 text-white flex items-center gap-2.5 backdrop-blur-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-[11px] font-mono font-bold flex items-center gap-1.5">
            <span className="text-emerald-400">PROJECTED PATH AUTO-FRAMED</span>
            <span className="text-slate-500">•</span>
            <span className="text-cyan-300 font-black">{viewportTransform.scale}x Zoom</span>
          </div>
          <button
            onClick={handleResetViewport}
            className="ml-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Reset to Full Map Overview"
          >
            Reset View
          </button>
        </div>
      )}

      {/* ACTIVE FOLLOW VEHICLE MODE FLOATING BANNER OVERLAY */}
      {isFollowingVehicle && selectedVehicleObj && !viewportTransform.isFocused && (
        <div className="absolute top-18 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-blue-500 rounded-2xl shadow-2xl px-4 py-2 text-white flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-5 duration-300 pointer-events-auto">
          <div className="relative flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-blue-400" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">
                FOLLOW VEHICLE ACTIVE
              </span>
              <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded text-[10px] font-black">
                {selectedVehicleObj.plateText}
              </span>
            </div>
            <div className="text-[11px] text-slate-300 font-semibold flex items-center gap-2">
              <span>Path: <strong className="text-blue-300">Solid Dark Blue</strong></span>
              <span>•</span>
              <span>Next Dest: <strong className="text-red-400">3 Red Points</strong></span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">{selectedVehicleObj.speedKmh} km/h ↗</span>
            </div>
          </div>

          <button
            onClick={() => setIsFollowingVehicle(false)}
            className="ml-2 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Disable Lock
          </button>
        </div>
      )}

      {/* ROUTE REPLAY CONTROLS BANNER */}
      {isReplayingRoute && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-40 bg-slate-900/95 border-2 border-emerald-500 rounded-2xl shadow-2xl px-5 py-2.5 text-white flex items-center gap-4 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto w-80 sm:w-96">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div className="flex-1">
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-emerald-400">REPLAYING HISTORICAL TRAJECTORY...</span>
              <span>{replayProgress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${replayProgress}%` }}
              />
            </div>
          </div>
          <button
            onClick={() => setIsReplayingRoute(false)}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Stop
          </button>
        </div>
      )}

      {/* LAYER 3: Floating Map UI Controls */}
      <MapUIControls
        activeRegion={activeRegion}
        onSelectRegion={(reg) => setActiveRegion?.(reg)}
        onSearch={handleSearch}
        onToggleFullscreen={toggleFullscreen}
        isFullscreen={isFullscreen}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        unreadAlertsCount={unreadAlertsCount}
        activeVehiclesCount={vehicles.length}
        activeCamerasCount={cameras.length}
      />

      {/* LAYER 4: Vehicle Information Panel (Floating Right Drawer) */}
      {selectedVehicleObj && (
        <VehicleInfoPanel
          vehicle={selectedVehicleObj}
          predictions={predictions}
          onClose={() => handleSelectVehicle(null)}
          onFollowVehicle={() => setIsFollowingVehicle(!isFollowingVehicle)}
          onReplayRoute={() => setIsReplayingRoute(true)}
          onPanZoomToPath={() => {
            const currentVehScreen = projection.project(vehPos.lat, vehPos.lng);
            const allPoints: Point2D[] = [
              currentVehScreen,
              ...predictions.flatMap((p) => p.points)
            ];
            const xs = allPoints.map((p) => p.x);
            const ys = allPoints.map((p) => p.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const spanX = Math.max(12, maxX - minX);
            const spanY = Math.max(12, maxY - minY);
            const targetScaleX = 55 / spanX;
            const targetScaleY = 50 / spanY;
            const calculatedScale = Math.min(Math.max(Math.min(targetScaleX, targetScaleY), 1.35), 2.75);
            const shiftX = (42 - centerX);
            const shiftY = (50 - centerY);
            setViewportTransform({
              scale: Number(calculatedScale.toFixed(2)),
              translateX: Number((shiftX * calculatedScale).toFixed(2)),
              translateY: Number((shiftY * calculatedScale).toFixed(2)),
              isFocused: true
            });
            setIsFollowingVehicle(true);
          }}
          isFollowingVehicle={isFollowingVehicle}
        />
      )}
    </div>
  );
};
