import React, { useState } from 'react';
import { Camera, GlobalVehicleTrack, AlertEvent, SystemMetrics } from '../types';
import {
  ChevronUp,
  ChevronDown,
  Activity,
  Camera as CameraIcon,
  Navigation,
  Bell,
  Cpu,
  Zap,
  ShieldCheck,
  BarChart2
} from 'lucide-react';

interface BottomSlidePanelProps {
  cameras: Camera[];
  tracks: GlobalVehicleTrack[];
  alerts: AlertEvent[];
  metrics: SystemMetrics;
  isEcoTheme: boolean;
  onSelectVehicle: (trackId: string) => void;
  onSelectCamera: (camId: string) => void;
}

export const BottomSlidePanel: React.FC<BottomSlidePanelProps> = ({
  cameras,
  tracks,
  alerts,
  metrics,
  isEcoTheme,
  onSelectVehicle,
  onSelectCamera
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'tracking' | 'cameras' | 'alerts' | 'metrics'>('tracking');

  const activeCamerasCount = cameras.filter((c) => c.status === 'ONLINE').length;
  const newAlertsCount = alerts.filter((a) => a.status === 'NEW').length;

  return (
    <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-5xl rounded-2xl border shadow-2xl transition-all duration-300 backdrop-blur-md ${
      isEcoTheme
        ? 'bg-white/95 border-[#DDEBE4] text-[#16322A]'
        : 'bg-slate-900/95 border-slate-800 text-slate-100'
    }`}>
      {/* Panel Header Toggle Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-3 cursor-pointer flex items-center justify-between border-b border-slate-200 dark:border-slate-800"
      >
        <div className="flex items-center gap-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold text-slate-900 dark:text-white">COMMAND CENTER STATUS</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <span>
              CAMERAS: <strong className="text-emerald-600 dark:text-emerald-400">{activeCamerasCount}/{cameras.length}</strong>
            </span>
            <span>|</span>
            <span>
              ACTIVE TRACKS: <strong className="text-[#1677C8] dark:text-cyan-400">{tracks.length}</strong>
            </span>
            <span>|</span>
            <span>
              LATENCY: <strong className="text-amber-500">{metrics.inferenceLatencyMs}ms</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {newAlertsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-600 text-white animate-bounce">
              {newAlertsCount} NEW ALERTS
            </span>
          )}
          <button className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Slide Body */}
      {isOpen && (
        <div className="p-5 space-y-4 max-h-72 overflow-y-auto font-mono text-xs">
          {/* Inner Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'tracking'
                  ? 'bg-[#168A5B] text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" /> Tracked Vehicles ({tracks.length})
            </button>

            <button
              onClick={() => setActiveTab('cameras')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'cameras'
                  ? 'bg-[#168A5B] text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CameraIcon className="w-3.5 h-3.5" /> CCTV Feeds ({cameras.length})
            </button>

            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'alerts'
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-3.5 h-3.5" /> Security Alerts ({alerts.length})
            </button>

            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'metrics'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" /> Hardware & Model Metrics
            </button>
          </div>

          {/* Tab 1: Live Tracked Vehicles Table */}
          {activeTab === 'tracking' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {tracks.map((t) => (
                <div
                  key={t.globalTrackId}
                  onClick={() => onSelectVehicle(t.globalTrackId)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-[#18A66A] cursor-pointer transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-500 text-sm">{t.primaryPlateText}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t.makeModel} ({t.vehicleClass}) | {t.currentLocationEstimate.speedKmh} km/h
                  </div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400">
                    Road: {t.currentLocationEstimate.roadSegmentName}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: CCTV Camera Grid */}
          {activeTab === 'cameras' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {cameras.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectCamera(c.id)}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-indigo-500 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">{c.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-500">{c.locationName}</div>
                  <div className="text-[10px] text-indigo-500 font-bold">FPS: {c.fps} | Lanes: {c.lanes}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Security Alerts */}
          {activeTab === 'alerts' && (
            <div className="space-y-2">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-red-700 dark:text-red-300 text-xs">{a.ruleName}</div>
                    <div className="text-[10px] text-slate-600 dark:text-slate-400">
                      Plate: <span className="font-bold text-amber-500">{a.plateText}</span> @ {a.cameraName} ({a.locationName})
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded text-[10px] font-bold bg-red-600 text-white">
                    {a.severity}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: System & GPU Hardware Metrics */}
          {activeTab === 'metrics' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">GPU UTILIZATION</div>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{metrics.gpuUtilizationPercentage}%</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">CV INFERENCE LATENCY</div>
                <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{metrics.inferenceLatencyMs} ms</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">RE-ID ASSOCIATION</div>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{metrics.associationLatencyMs} ms</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px]">ENSEMBLE ROUTE PREDICTION</div>
                <div className="text-lg font-bold text-amber-500">{metrics.predictionLatencyMs} ms</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
