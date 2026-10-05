import React, { useState, useEffect } from 'react';
import {
  Camera,
  GlobalVehicleTrack,
  RoadNode,
  RoadEdge,
  AlertEvent,
  AlertRule,
  UserRole,
  SystemMetrics
} from './types';
import { EcoHeader } from './components/EcoHeader';
import { EcoCommandCenterMap } from './components/EcoCommandCenterMap';
import { FloatingToolbar } from './components/FloatingToolbar';
import { VehiclePredictionDrawer } from './components/VehiclePredictionDrawer';
import { BottomSlidePanel } from './components/BottomSlidePanel';
import { SpatialIndexDebugModal } from './components/SpatialIndexDebugModal';
import { DemoCctvTrackingTab } from './components/DemoCctvTrackingTab';
import { LiveCameraMapTab } from './components/LiveCameraMapTab';
import { VehicleAssociationTab } from './components/VehicleAssociationTab';
import { RoadGraphTab } from './components/RoadGraphTab';
import { RoutePredictionTab } from './components/RoutePredictionTab';
import { AlertsTab } from './components/AlertsTab';
import { ModelMetricsTab } from './components/ModelMetricsTab';
import { AuditTrailTab } from './components/AuditTrailTab';
import { ArchitectureDocsTab } from './components/ArchitectureDocsTab';
import { TrafficIntelligenceDashboard } from './components/TrafficIntelligenceDashboard';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('traffic_intelligence');
  const [userRole, setUserRole] = useState<UserRole>('SUPER_ADMIN');
  const [activeRegion, setActiveRegion] = useState<string>('Tamil Nadu');
  const [isEcoTheme, setIsEcoTheme] = useState<boolean>(true);

  const [cameras, setCameras] = useState<Camera[]>([]);
  const [tracks, setTracks] = useState<GlobalVehicleTrack[]>([]);
  const [roadNodes, setRoadNodes] = useState<RoadNode[]>([]);
  const [roadEdges, setRoadEdges] = useState<RoadEdge[]>([]);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('TRACK_7XYZ982');
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>('CAM_001');
  const [isDebugModalOpen, setIsDebugModalOpen] = useState<boolean>(false);
  const [isAutoSimulating, setIsAutoSimulating] = useState<boolean>(false);
  const [focusPathTrigger, setFocusPathTrigger] = useState<{ id: string; timestamp: number } | null>(null);

  const handleFocusVehiclePath = (vehicleId?: string) => {
    setFocusPathTrigger({
      id: vehicleId || selectedVehicleId || 'TRACK_7XYZ982',
      timestamp: Date.now()
    });
  };

  const [activeLayers, setActiveLayers] = useState({
    roads: true,
    cameras: true,
    vehicles: true,
    trails: true,
    predictions: true,
    traffic: true,
    h3Grid: false,
    geofence: true,
    debugMode: false
  });

  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    activeCameras: 8,
    totalCameras: 8,
    fpsIngested: 360,
    activeTracksCount: 3,
    gpuUtilizationPercentage: 64.2,
    inferenceLatencyMs: 18.5,
    associationLatencyMs: 12.2,
    predictionLatencyMs: 14.8,
    apiLatencyMs: 22.1,
    queuedFrames: 4,
    memoryUsageMb: 1420
  });

  // Fetch initial state
  const fetchData = () => {
    fetch('/api/v1/cameras')
      .then((res) => res.json())
      .then((data) => setCameras(data))
      .catch(console.error);

    fetch('/api/v1/tracks')
      .then((res) => res.json())
      .then((data) => setTracks(data))
      .catch(console.error);

    fetch('/api/v1/graph')
      .then((res) => res.json())
      .then((data) => {
        setRoadNodes(data.nodes || []);
        setRoadEdges(data.edges || []);
      })
      .catch(console.error);

    fetch('/api/v1/alerts')
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch(console.error);

    fetch('/api/v1/metrics')
      .then((res) => res.json())
      .then((data) => setSystemMetrics(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Trigger frame step simulation
  const handleSimulateTick = () => {
    fetch('/api/v1/simulation/tick', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': userRole }
    })
      .then((res) => res.json())
      .then(() => {
        fetchData();
      })
      .catch(console.error);
  };

  // Auto simulation timer
  useEffect(() => {
    let interval: any = null;
    if (isAutoSimulating) {
      interval = setInterval(() => {
        handleSimulateTick();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoSimulating, userRole]);

  const handleToggleLayer = (key: string) => {
    setActiveLayers((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  // Universal Search Handler
  const handleUniversalSearch = (term: string) => {
    const lower = term.toLowerCase();
    if (lower.includes('tn') || lower.includes('tamil') || lower.includes('chennai')) {
      setActiveRegion('Tamil Nadu');
    } else if (lower.includes('kl') || lower.includes('kerala')) {
      setActiveRegion('Kerala');
    } else if (lower.includes('dl') || lower.includes('delhi')) {
      setActiveRegion('Delhi');
    } else if (lower.includes('mh') || lower.includes('mumbai') || lower.includes('maharashtra')) {
      setActiveRegion('Maharashtra');
    }

    const matchedTrack = tracks.find((t) => t.primaryPlateText.toLowerCase().includes(lower));
    if (matchedTrack) {
      setSelectedVehicleId(matchedTrack.globalTrackId);
    }

    const matchedCam = cameras.find((c) => c.name.toLowerCase().includes(lower) || c.id.toLowerCase().includes(lower));
    if (matchedCam) {
      setSelectedCameraId(matchedCam.id);
    }
  };

  // Update Traffic State on a Road Edge
  const handleUpdateTrafficState = (edgeId: string, newState: RoadEdge['currentTrafficState']) => {
    setRoadEdges((prev) =>
      prev.map((e) => {
        if (e.id === edgeId) {
          const mult = newState === 'CONGESTED' ? 2.5 : newState === 'HEAVY' ? 1.8 : newState === 'MODERATE' ? 1.3 : 1.0;
          return { ...e, currentTrafficState: newState, trafficWeightMultiplier: mult };
        }
        return e;
      })
    );
  };

  // Acknowledge Security Alert
  const handleAcknowledgeAlert = (alertId: string) => {
    fetch(`/api/v1/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': userRole }
    })
      .then((res) => res.json())
      .then((updatedAlert) => {
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? updatedAlert : a)));
      })
      .catch(console.error);
  };

  const unreadAlertsCount = alerts.filter((a) => a.status === 'NEW').length;

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-all duration-500 ${
      isEcoTheme ? 'bg-[#E8F7EF] text-[#16322A]' : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Application Eco Header */}
      <EcoHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        systemMetrics={systemMetrics}
        onSimulateTick={handleSimulateTick}
        isAutoSimulating={isAutoSimulating}
        setIsAutoSimulating={setIsAutoSimulating}
        unreadAlertsCount={unreadAlertsCount}
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        isEcoTheme={isEcoTheme}
        onToggleEcoTheme={() => setIsEcoTheme(!isEcoTheme)}
        onUniversalSearch={handleUniversalSearch}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative overflow-hidden">
        {/* PRIMARY TAB: Traffic Intelligence Platform (Two Brains: Vision + OSM GIS) */}
        {activeTab === 'traffic_intelligence' && (
          <div className="max-w-7xl mx-auto p-2 sm:p-4">
            <TrafficIntelligenceDashboard
              cameras={cameras}
              tracks={tracks}
              nodes={roadNodes}
              edges={roadEdges}
              onSimulateTick={handleSimulateTick}
              isAutoSimulating={isAutoSimulating}
              setIsAutoSimulating={setIsAutoSimulating}
              isEcoTheme={isEcoTheme}
            />
          </div>
        )}

        {/* TAB 1: Full-Screen Interactive Eco Map Command Center */}
        {activeTab === 'map' && (
          <div className="relative w-full h-[calc(100vh-80px)] p-2">
            <EcoCommandCenterMap
              cameras={cameras}
              tracks={tracks}
              nodes={roadNodes}
              edges={roadEdges}
              alerts={alerts}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
              selectedCameraId={selectedCameraId}
              onSelectCamera={(camId) => setSelectedCameraId(camId)}
              activeRegion={activeRegion}
              setActiveRegion={setActiveRegion}
              isEcoTheme={isEcoTheme}
              focusPathTrigger={focusPathTrigger}
              activeLayers={activeLayers}
            />

            {/* Floating Left Toolbar */}
            <FloatingToolbar
              activeLayers={activeLayers}
              onToggleLayer={handleToggleLayer}
              isEcoTheme={isEcoTheme}
              onToggleEcoTheme={() => setIsEcoTheme(!isEcoTheme)}
              onOpenDebugModal={() => setIsDebugModalOpen(true)}
              onOpenSearch={() => handleUniversalSearch('Tamil Nadu')}
            />

            {/* Floating Right Vehicle Route Prediction Drawer */}
            <VehiclePredictionDrawer
              selectedVehicleId={selectedVehicleId}
              tracks={tracks}
              onClose={() => setSelectedVehicleId(null)}
              userRole={userRole}
              isEcoTheme={isEcoTheme}
              onPanAndZoomToPath={() => handleFocusVehiclePath(selectedVehicleId || undefined)}
            />

            {/* Floating Bottom Slide Panel */}
            <BottomSlidePanel
              cameras={cameras}
              tracks={tracks}
              alerts={alerts}
              metrics={systemMetrics}
              isEcoTheme={isEcoTheme}
              onSelectVehicle={(id) => setSelectedVehicleId(id)}
              onSelectCamera={(camId) => setSelectedCameraId(camId)}
            />

            {/* Spatial Index Debug & Multi-Algorithm Consensus Modal */}
            <SpatialIndexDebugModal
              isOpen={isDebugModalOpen}
              onClose={() => setIsDebugModalOpen(false)}
              isEcoTheme={isEcoTheme}
            />
          </div>
        )}

        {activeTab === 'demo' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <DemoCctvTrackingTab cameras={cameras} tracks={tracks} />
          </div>
        )}

        {activeTab === 'cameras' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <LiveCameraMapTab
              cameras={cameras}
              tracks={tracks}
              selectedCamera={selectedCamera}
              setSelectedCamera={setSelectedCamera}
            />
          </div>
        )}

        {activeTab === 'association' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <VehicleAssociationTab tracks={tracks} />
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <RoadGraphTab
              nodes={roadNodes}
              edges={roadEdges}
              onUpdateTrafficState={handleUpdateTrafficState}
            />
          </div>
        )}

        {activeTab === 'prediction' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <RoutePredictionTab tracks={tracks} />
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <AlertsTab
              alerts={alerts}
              alertRules={alertRules}
              userRole={userRole}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          </div>
        )}

        {activeTab === 'models' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <ModelMetricsTab userRole={userRole} />
          </div>
        )}

        {activeTab === 'docs' && (
          <div className="max-w-7xl mx-auto p-4 sm:p-6">
            <ArchitectureDocsTab />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <footer className={`border-t py-3 px-6 text-center text-xs font-mono transition-all ${
        isEcoTheme
          ? 'bg-white border-[#DDEBE4] text-slate-500'
          : 'bg-slate-950/90 border-slate-900 text-slate-500'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            AegisTrack Eco AI Geo Command Center | OpenID / OAuth2 RBAC Enforced
          </div>
          <div>
            Prediction Engine: <span className="text-[#168A5B] dark:text-emerald-400 font-bold">v3.4.1 Calibrated T=1.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
