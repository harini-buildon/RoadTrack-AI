import React, { useState, useEffect } from 'react';
import { Camera, GlobalVehicleTrack } from '../types';
import { Camera as CameraIcon, ShieldCheck, Eye, MapPin, Gauge, Cpu, CheckCircle, AlertTriangle } from 'lucide-react';

interface LiveCameraMapTabProps {
  cameras: Camera[];
  tracks: GlobalVehicleTrack[];
  selectedCamera: Camera | null;
  setSelectedCamera: (cam: Camera | null) => void;
}

export const LiveCameraMapTab: React.FC<LiveCameraMapTabProps> = ({
  cameras,
  tracks,
  selectedCamera,
  setSelectedCamera
}) => {
  const [activeCam, setActiveCam] = useState<Camera | null>(selectedCamera || cameras[0] || null);

  useEffect(() => {
    if (selectedCamera) {
      setActiveCam(selectedCamera);
    } else if (cameras.length > 0 && (!activeCam || !activeCam.id)) {
      setActiveCam(cameras[0]);
    }
  }, [selectedCamera, cameras]);

  if (!activeCam || cameras.length === 0) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center font-mono text-slate-400 text-xs shadow-xl animate-pulse">
        Loading metro CCTV camera nodes...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 bg-emerald-950/80 rounded-lg border border-emerald-800/60 text-emerald-400">
            <CameraIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Cameras</div>
            <div className="text-lg font-bold text-white font-mono">
              {cameras.filter((c) => c.status === 'ONLINE').length} / {cameras.length} Online
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 bg-indigo-950/80 rounded-lg border border-indigo-800/60 text-indigo-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Active Tracked Vehicles</div>
            <div className="text-lg font-bold text-white font-mono">
              {tracks.filter((t) => t.status === 'ACTIVE').length} Tracks Active
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 bg-cyan-950/80 rounded-lg border border-cyan-800/60 text-cyan-400">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Avg Ingestion FPS</div>
            <div className="text-lg font-bold text-white font-mono">29.8 FPS / Cam</div>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
          <div className="p-3 bg-purple-950/80 rounded-lg border border-purple-800/60 text-purple-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Inference Pipeline</div>
            <div className="text-lg font-bold text-white font-mono">18.5ms Latency</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Live Camera Stream View & Interactive Map Network */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Stream & Detections (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {activeCam.name || 'CCTV Feed'}
              </h2>
              <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {activeCam.ipAddress || '192.168.10.101'}
              </span>
            </div>
            <div className="text-xs text-emerald-400 font-mono bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/60 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> RTSP STREAM 1080p
            </div>
          </div>

          {/* Simulated CCTV Frame Container */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group shadow-2xl">
            {/* Visual Simulated Traffic Road Canvas Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90"></div>

            {/* Simulated Road Lanes Graphics */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-full border-y border-dashed border-slate-700/60 flex items-center justify-around">
                <div className="w-px h-full border-r border-dashed border-slate-700/60"></div>
                <div className="w-px h-full border-r border-dashed border-slate-700/60"></div>
              </div>
            </div>

            {/* Simulated Vehicle Bounding Box Overlay */}
            <div className="absolute top-[28%] left-[32%] w-[38%] h-[42%] border-2 border-emerald-400 bg-emerald-500/10 rounded-lg backdrop-blur-[1px] p-2 flex flex-col justify-between shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all duration-300">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded shadow">
                  SUV #TRK-123
                </span>
                <span className="bg-slate-900/90 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-800">
                  CONF: 0.96
                </span>
              </div>

              {/* License Plate Banner Overlay */}
              <div className="bg-slate-950/90 border border-amber-500/80 rounded p-1.5 flex items-center justify-between">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Anonymous ID</div>
                  <div className="text-sm font-black font-mono tracking-wider text-amber-400">
                    V-042
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[9px] text-slate-400">Speed</div>
                  <div className="text-xs font-bold text-white">48 km/h</div>
                </div>
              </div>
            </div>

            {/* Camera Overlay Metadata */}
            <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 space-y-0.5">
              <div>LOCATION: <span className="text-white">{activeCam.locationName}</span></div>
              <div>FOV: <span className="text-cyan-400">{activeCam.calibration?.fieldOfViewDegrees || 85}°</span> | TILT: <span className="text-amber-400">{activeCam.calibration?.tiltAngleDegrees || 25}°</span></div>
            </div>

            <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
              TIMESTAMP: <span className="text-emerald-400">{new Date().toISOString()}</span>
            </div>
          </div>

          {/* Camera Calibration Details Panel */}
          <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Camera Photogrammetry & Homography Calibration
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">MOUNT HEIGHT</div>
                <div className="text-white font-bold text-sm">
                  {activeCam.calibration?.mountingHeightMeters || 6.5} m
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">ORIENTATION</div>
                <div className="text-white font-bold text-sm">
                  {activeCam.calibration?.orientationDegrees || 90}° (East)
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">LANES COVERED</div>
                <div className="text-white font-bold text-sm">
                  {activeCam.lanes || 3} Traffic Lanes
                </div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">ROAD EDGE</div>
                <div className="text-cyan-400 font-bold text-sm truncate">
                  {activeCam.roadSegmentId || 'ROAD-101'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: CCTV Cameras Directory & Network Map (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              Metro Camera Nodes Directory ({cameras.length})
            </h2>
            <span className="text-xs text-slate-400">Select feed to inspect</span>
          </div>

          <div className="space-y-2.5 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {cameras.map((cam) => {
              const isSelected = activeCam.id === cam.id;
              return (
                <div
                  key={cam.id}
                  onClick={() => {
                    setActiveCam(cam);
                    setSelectedCamera(cam);
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500/80 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${cam.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      <span className="font-bold text-sm text-white">{cam.name}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{cam.locationName}</p>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                      <span>Lat: {cam.latitude.toFixed(4)}</span>
                      <span>Lng: {cam.longitude.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-900 text-slate-300 border border-slate-800">
                      30 FPS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
