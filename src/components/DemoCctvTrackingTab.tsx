import React, { useState, useEffect } from 'react';
import { Camera, GlobalVehicleTrack, VehicleObservation, EnsemblePrediction } from '../types';
import {
  Camera as CameraIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  GitMerge,
  Compass,
  ShieldAlert,
  Clock,
  MapPin,
  Cpu,
  Layers,
  BarChart3,
  Search,
  Zap,
  ArrowRight
} from 'lucide-react';

interface DemoCctvTrackingTabProps {
  cameras: Camera[];
  tracks: GlobalVehicleTrack[];
}

export const DemoCctvTrackingTab: React.FC<DemoCctvTrackingTabProps> = ({ cameras, tracks }) => {
  // 5 Demo CCTV Locations
  const demoCameras = cameras.slice(0, 5);

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedPlate, setSelectedPlate] = useState<string>('7XYZ982');
  const [predictionData, setPredictionData] = useState<EnsemblePrediction | null>(null);

  const activeTrack = tracks.find((t) => t.primaryPlateText === selectedPlate) || tracks[0];

  // Auto playback through 5 CCTV Locations
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % demoCameras.length);
      }, 2500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, demoCameras.length]);

  // Fetch prediction for current track
  useEffect(() => {
    if (!activeTrack) return;
    fetch(`/api/v1/predictions/${activeTrack.globalTrackId}`)
      .then((res) => res.json())
      .then((data) => setPredictionData(data))
      .catch((err) => console.error('Fetch prediction error:', err));
  }, [activeTrack, currentStep]);

  const activeCamera = demoCameras[currentStep] || demoCameras[0];

  if (!demoCameras || demoCameras.length === 0) {
    return (
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center font-mono text-slate-400 text-xs shadow-xl animate-pulse">
        Initializing 5 Demo CCTV Camera Feeds and AI Tracking Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
              DEMO CCTV SUITE
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CameraIcon className="w-5 h-5 text-indigo-400" />
              5-Location CCTV Footages AI Tracking & Path Reconstruction Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates real-time multi-camera AI analysis across 5 strategic CCTV locations, demonstrating Re-ID feature extraction, spatiotemporal map-matching, and top-3 route predictions.
          </p>
        </div>

        {/* Demo Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 font-mono text-[11px] pl-2">Target Vehicle:</span>
            <select
              value={selectedPlate}
              onChange={(e) => setSelectedPlate(e.target.value)}
              className="bg-slate-900 text-amber-400 font-mono text-xs font-bold px-3 py-1 rounded-lg border border-slate-700 focus:outline-none"
            >
              <option value="7XYZ982">7XYZ982 - Black SUV (High Risk Watchlist)</option>
              <option value="8ABC123">8ABC123 - Silver Accord Sedan</option>
              <option value="9LMN456">9LMN456 - White Commercial Truck</option>
            </select>
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-2 shadow-lg border ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/50'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause 5-Camera Track' : 'Run 5-Camera Track Demo'}
          </button>

          <button
            onClick={() => setCurrentStep(0)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-colors"
            title="Reset to Camera 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5 CCTV Location Sequence Step Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
        {demoCameras.map((cam, idx) => {
          const isActive = currentStep === idx;
          const isPassed = currentStep > idx;
          return (
            <div
              key={cam.id}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlaying(false);
              }}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isActive
                  ? 'bg-indigo-950/80 border-indigo-500 shadow-lg ring-2 ring-indigo-500/50 text-white'
                  : isPassed
                  ? 'bg-slate-900/80 border-emerald-800/80 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="font-bold">LOCATION #{idx + 1}</span>
                {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                {isActive && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>}
              </div>
              <div className="font-bold text-xs truncate">{(cam.name || '').replace('CCTV ', '')}</div>
              <div className="text-[10px] opacity-75 truncate">{cam.roadSegmentId}</div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Active CCTV Feed Visualizer & Live AI Analysis Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: CCTV Feed Visualizer & Detection Box (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold text-white text-sm">{activeCamera.name}</span>
              <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {activeCamera.id}
              </span>
            </div>
            <div className="text-xs text-emerald-400 font-mono bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> LIVE AI INFERENCE
            </div>
          </div>

          {/* CCTV Frame Visualizer */}
          <div className="relative aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90"></div>

            {/* Simulated Bounding Box for active location */}
            <div
              className="absolute border-2 border-indigo-400 bg-indigo-500/10 rounded-lg p-2.5 flex flex-col justify-between shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-500"
              style={{
                top: `${20 + currentStep * 8}%`,
                left: `${15 + currentStep * 14}%`,
                width: '45%',
                height: '50%'
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="bg-indigo-600 text-white font-bold px-2 py-0.5 rounded shadow">
                  VEHICLE DETECTED
                </span>
                <span className="bg-slate-900/90 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-800">
                  CONF: 0.96
                </span>
              </div>

              {/* ALPR OCR Highlight */}
              <div className="bg-slate-950/95 border border-amber-500 rounded p-2 flex items-center justify-between shadow-lg">
                <div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">ALPR Plate OCR</div>
                  <div className="text-base font-black font-mono tracking-widest text-amber-400">
                    {selectedPlate}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[9px] text-slate-400">Re-ID Cosine</div>
                  <div className="text-xs font-bold text-cyan-400">0.962 (Match)</div>
                </div>
              </div>
            </div>

            {/* CCTV Overlay Specs */}
            <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
              LOCATION: <span className="text-white font-bold">{activeCamera.locationName}</span>
            </div>

            <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] font-mono text-slate-400">
              TIMESTAMP: <span className="text-emerald-400">{new Date().toISOString()}</span>
            </div>
          </div>

          {/* AI Feature Vectors & Photogrammetry Specs */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 font-mono">
              <Cpu className="w-4 h-4 text-indigo-400" />
              Location #{currentStep + 1} AI Observation Metrics
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">CAMERA ID</div>
                <div className="text-white font-bold">{activeCamera.id}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">ROAD SEGMENT</div>
                <div className="text-cyan-400 font-bold">{activeCamera.roadSegmentId}</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">OCR CONFIDENCE</div>
                <div className="text-amber-400 font-bold">96.2%</div>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <div className="text-slate-500 text-[10px]">ESTIMATED SPEED</div>
                <div className="text-emerald-400 font-bold">
                  {45 + currentStep * 2} km/h
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Path Tracking & Ensemble Route Predictions Output (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-400" />
              AI Route Prediction Output
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              SOFTMAX T=1.2
            </span>
          </div>

          {/* Path Trajectory Chain */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Reconstructed Path History across 5 CCTV Locations
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
              {demoCameras.slice(0, currentStep + 1).map((c, i) => (
                <div key={c.id} className="flex items-center gap-2 text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300 font-bold text-[10px] flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-bold text-white">{(c.name || '').replace('CCTV ', '')}</span>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <span className="text-cyan-400">{c.roadSegmentId}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 Predictions Output Box */}
          <div className="space-y-2">
            <div className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Calibrated Top 3 Future Route Segment Predictions
            </div>

            {predictionData && predictionData.topPredictions ? (
              <div className="space-y-2.5">
                {predictionData.topPredictions.map((cand) => (
                  <div
                    key={cand.rank}
                    className={`p-3 rounded-xl border transition-all space-y-2.5 ${
                      cand.rank === 1
                        ? 'bg-gradient-to-r from-indigo-950/80 to-slate-950 border-indigo-500/80 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            cand.rank === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          #{cand.rank}
                        </span>
                        <span className="font-bold text-white">{cand.roadSegmentName}</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">
                        {(cand.probability * 100).toFixed(0)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>ETA: {cand.etaSecondsRange[0]}s - {cand.etaSecondsRange[1]}s</span>
                      <span>Target Jct: {cand.nextIntersectionName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center font-mono text-slate-400 text-xs">Calculating route probabilities...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
