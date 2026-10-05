import React, { useState, useEffect } from 'react';
import { GlobalVehicleTrack, EnsemblePrediction } from '../types';
import { TrafficSparkline } from './map/TrafficSparkline';
import { Compass, Cpu, Clock, AlertTriangle, ShieldCheck, CheckCircle2, FileText, ChevronRight, BarChart3, Activity } from 'lucide-react';

interface RoutePredictionTabProps {
  tracks: GlobalVehicleTrack[];
}

export const RoutePredictionTab: React.FC<RoutePredictionTabProps> = ({ tracks }) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    tracks[0]?.globalTrackId || 'TRACK_00123'
  );
  const [prediction, setPrediction] = useState<EnsemblePrediction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeTrack = tracks.find((t) => t.globalTrackId === selectedTrackId) || tracks[0];

  useEffect(() => {
    if (!activeTrack) return;
    setIsLoading(true);

    fetch(`/api/v1/predictions/${activeTrack.globalTrackId}`)
      .then((res) => res.json())
      .then((data: EnsemblePrediction) => {
        setPrediction(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Prediction fetch error:', err);
        setIsLoading(false);
      });
  }, [selectedTrackId, activeTrack]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            Ensemble Calibrated Route Prediction Engine
          </h2>
          <p className="text-xs text-slate-400">
            Fuses 5 independent models (Graph Topology, Bayesian Transitions, Historical Matrix, ML Classifier, Traffic State) with Temperature Softmax Calibration ($T=1.2$).
          </p>
        </div>

        {/* Track Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 font-mono pl-2">Track Target:</span>
          <select
            value={selectedTrackId}
            onChange={(e) => setSelectedTrackId(e.target.value)}
            className="bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {tracks.map((t) => (
              <option key={t.globalTrackId} value={t.globalTrackId}>
                {t.globalTrackId} - {t.primaryPlateText}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Track Location Summary */}
      {activeTrack && (
        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div>
            <span className="text-slate-400">CURRENT CAMERA:</span>{' '}
            <strong className="text-white">{activeTrack.currentCameraId}</strong>
          </div>
          <div>
            <span className="text-slate-400">ROAD SEGMENT:</span>{' '}
            <strong className="text-cyan-400">{activeTrack.currentRoadSegmentId}</strong>
          </div>
          <div>
            <span className="text-slate-400">ESTIMATED SPEED:</span>{' '}
            <strong className="text-emerald-400">{activeTrack.currentLocationEstimate.speedKmh} km/h</strong>
          </div>
          <div>
            <span className="text-slate-400">PREDICTION HORIZON:</span>{' '}
            <strong className="text-amber-400">180 Seconds (3 Min)</strong>
          </div>
        </div>
      )}

      {/* Prediction Cards */}
      {isLoading ? (
        <div className="bg-slate-900/90 p-12 rounded-2xl border border-slate-800 text-center font-mono text-slate-400 animate-pulse">
          Calculating Ensemble Predictions across Road Topology...
        </div>
      ) : prediction && prediction.topPredictions ? (
        <div className="space-y-6">
          {/* Top 3 Predictions Ranked Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prediction.topPredictions.map((cand) => {
              const isTopRank = cand.rank === 1;
              return (
                <div
                  key={cand.rank}
                  className={`rounded-2xl border p-5 space-y-4 transition-all relative shadow-xl ${
                    isTopRank
                      ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  {/* Rank Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-black font-mono text-xs ${
                          isTopRank ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{cand.rank}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-400">RANK #{cand.rank} ROUTE</span>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-2xl font-black font-mono ${
                          isTopRank ? 'text-emerald-400' : 'text-slate-200'
                        }`}
                      >
                        {(cand.probability * 100).toFixed(0)}%
                      </div>
                      <div className="text-[9px] uppercase font-mono text-slate-400">Calibrated Prob</div>
                    </div>
                  </div>

                  {/* Segment Details */}
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white leading-snug">{cand.roadSegmentName}</h3>
                    <p className="text-xs font-mono text-cyan-400">{cand.roadSegmentId}</p>
                    <p className="text-xs text-slate-400 font-mono">
                      Target Junction: <strong className="text-slate-200">{cand.nextIntersectionName}</strong>
                    </p>
                  </div>

                  {/* ETA & Distance */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <div>
                      <div className="text-slate-500 text-[10px]">ETA RANGE</div>
                      <div className="text-amber-400 font-bold">
                        {cand.etaSecondsRange[0]}s - {cand.etaSecondsRange[1]}s
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">DISTANCE</div>
                      <div className="text-white font-bold">{cand.distanceMeters}m</div>
                    </div>
                  </div>

                  {/* Traffic Sparkline Indicator */}
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between font-mono">
                    <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-400" />
                      Traffic Congestion:
                    </span>
                    <TrafficSparkline rank={cand.rank} showDetails={true} />
                  </div>

                  {/* Algorithm Score Breakdown */}
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>Model Decomposition</span>
                      <span>Raw Score</span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Graph Topology:</span>
                        <span className="text-slate-200">{cand.algorithmScores.graphTopology}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bayesian Transition:</span>
                        <span className="text-slate-200">{cand.algorithmScores.bayesianProbability}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Historical Matrix:</span>
                        <span className="text-slate-200">{cand.algorithmScores.historicalTransition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ML Classifier:</span>
                        <span className="text-slate-200">{cand.algorithmScores.mlTabularModel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Traffic Congestion:</span>
                        <span className="text-slate-200">{cand.algorithmScores.trafficCongestionAwareness}</span>
                      </div>
                    </div>
                  </div>

                  {/* Evidence Explanations */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> Explainable Evidence
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                      {cand.evidenceExplanations.map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-slate-400 p-8 text-center font-mono">No predictions generated.</div>
      )}
    </div>
  );
};
