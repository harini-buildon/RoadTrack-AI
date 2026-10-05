import React, { useState } from 'react';
import { GlobalVehicleTrack } from '../types';
import { GitMerge, Fingerprint, Shield, Clock, Camera, ArrowRight, CheckCircle2, AlertOctagon } from 'lucide-react';

interface VehicleAssociationTabProps {
  tracks: GlobalVehicleTrack[];
}

export const VehicleAssociationTab: React.FC<VehicleAssociationTabProps> = ({ tracks }) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    tracks[0]?.globalTrackId || 'TRACK_00123'
  );

  const activeTrack = tracks.find((t) => t.globalTrackId === selectedTrackId) || tracks[0];

  if (!activeTrack) {
    return <div className="text-slate-400 p-8 text-center">No active vehicle tracks found.</div>;
  }

  const decomp = activeTrack.scoreDecomposition || {
    plateSimilarity: 0.98,
    appearanceSimilarity: 0.94,
    reidEmbeddingCosine: 0.96,
    colorClassMatch: 1.0,
    transitionProbability: 0.68,
    speedTimeFeasibility: 0.95,
    directionCompatibility: 0.92,
    roadConnectivityScore: 0.98,
    finalAssociationScore: 0.94
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-indigo-400" />
            Multi-Camera Spatiotemporal Vehicle Association Engine
          </h2>
          <p className="text-xs text-slate-400">
            Associates vehicle observations across distinct CCTV camera feeds using multi-signal feature fusion (Re-ID, Plate, Topology, Speed).
          </p>
        </div>

        {/* Track Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-mono pl-2">Select Track:</span>
          <select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            className="bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {tracks.map((t) => (
              <option key={t.globalTrackId} value={t.globalTrackId}>
                {t.globalTrackId} - {t.primaryPlateText} ({t.makeModel})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Vehicle Profile & Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">GLOBAL TRACK IDENTITY</span>
              <h3 className="text-lg font-black font-mono text-white">{activeTrack.globalTrackId}</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
              ACTIVE TRACK
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Primary Plate:</span>
              <span className="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                {activeTrack.primaryPlateText}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Plate Privacy Hash:</span>
              <span className="font-bold text-slate-300 truncate max-w-[180px]" title={activeTrack.plateHash}>
                {activeTrack.plateHash.slice(0, 16)}...
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Class & Make:</span>
              <span className="font-bold text-white">{activeTrack.makeModel}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Color Variant:</span>
              <span className="font-bold text-cyan-300">{activeTrack.vehicleColor}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Current Speed:</span>
              <span className="font-bold text-emerald-400">
                {activeTrack.currentLocationEstimate.speedKmh} km/h
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-400">Observations Logged:</span>
              <span className="font-bold text-white">{activeTrack.observationCount} frames</span>
            </div>
          </div>
        </div>

        {/* Multi-Signal Decomposed Score Cards */}
        <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" />
              Multi-Signal Association Confidence Score
            </h3>
            <div className="text-right">
              <div className="text-2xl font-black font-mono text-emerald-400">
                {(decomp.finalAssociationScore * 100).toFixed(0)}%
              </div>
              <div className="text-[10px] text-slate-400 uppercase font-mono">Combined Match Confidence</div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* 1. Plate Similarity */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">License Plate String Similarity</span>
                <span className="font-bold text-amber-400">{(decomp.plateSimilarity * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${decomp.plateSimilarity * 100}%` }}></div>
              </div>
            </div>

            {/* 2. Re-ID Embedding Cosine */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">512-Dim Re-ID Cosine Similarity</span>
                <span className="font-bold text-cyan-400">{(decomp.reidEmbeddingCosine * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${decomp.reidEmbeddingCosine * 100}%` }}></div>
              </div>
            </div>

            {/* 3. Camera Transition Prob */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Camera Transition Matrix P(B|A)</span>
                <span className="font-bold text-indigo-400">{(decomp.transitionProbability * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${decomp.transitionProbability * 100}%` }}></div>
              </div>
            </div>

            {/* 4. Speed / Travel-Time Sanity */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Spatiotemporal Travel-Time Sanity</span>
                <span className="font-bold text-emerald-400">{(decomp.speedTimeFeasibility * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${decomp.speedTimeFeasibility * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Camera Trajectory Sequence Timeline */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Chronological Cross-Camera Observation Timeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activeTrack.recentObservations.map((obs, idx) => (
            <div
              key={obs.observationId}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative space-y-2 hover:border-indigo-500/50 transition-all"
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
                  OBS #{idx + 1}
                </span>
                <span className="text-slate-400">{new Date(obs.timestamp).toLocaleTimeString()}</span>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  {obs.cameraId}
                </div>
                <div className="text-xs text-amber-400 font-mono font-bold">
                  PLATE: {obs.plateText} (Conf: {(obs.confidence * 100).toFixed(0)}%)
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  SPEED: {obs.estimatedSpeedKmh} km/h
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
