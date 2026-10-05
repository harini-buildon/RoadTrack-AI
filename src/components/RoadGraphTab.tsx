import React, { useState } from 'react';
import { RoadNode, RoadEdge } from '../types';
import { Activity, MapPin, Gauge, ShieldAlert, CheckCircle2, AlertTriangle, TrafficCone } from 'lucide-react';

interface RoadGraphTabProps {
  nodes: RoadNode[];
  edges: RoadEdge[];
  onUpdateTrafficState: (edgeId: string, newState: RoadEdge['currentTrafficState']) => void;
}

export const RoadGraphTab: React.FC<RoadGraphTabProps> = ({
  nodes,
  edges,
  onUpdateTrafficState
}) => {
  const [selectedEdgeId, setSelectedEdgeId] = useState<string>(edges[0]?.id || 'ROAD-101');
  const activeEdge = edges.find((e) => e.id === selectedEdgeId) || edges[0];

  const trafficStateColors: Record<RoadEdge['currentTrafficState'], string> = {
    FREE_FLOW: 'bg-emerald-950 text-emerald-300 border-emerald-700/80',
    MODERATE: 'bg-amber-950 text-amber-300 border-amber-700/80',
    HEAVY: 'bg-orange-950 text-orange-300 border-orange-700/80',
    CONGESTED: 'bg-red-950 text-red-300 border-red-700/80',
    CLOSED: 'bg-slate-900 text-slate-400 border-slate-700'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Digital PostGIS Road Network Graph Engine
          </h2>
          <p className="text-xs text-slate-400">
            Node-edge topological graph representing Metro City arterial roads, turn restrictions, lane capacities, and dynamic traffic congestion weights.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
            NODES: <strong className="text-cyan-400">{nodes.length}</strong>
          </span>
          <span className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
            EDGES: <strong className="text-indigo-400">{edges.length}</strong>
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Edges List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <TrafficCone className="w-4 h-4 text-amber-400" />
            Road Segments Topology Directory ({edges.length})
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {edges.map((edge) => {
              const isSelected = edge.id === selectedEdgeId;
              return (
                <div
                  key={edge.id}
                  onClick={() => setSelectedEdgeId(edge.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-indigo-950/50 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{edge.name}</span>
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                        {edge.id}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
                      <span>Length: {edge.lengthMeters}m</span>
                      <span>Speed Limit: {edge.speedLimitKmh} km/h</span>
                      <span>Lanes: {edge.lanes}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border ${trafficStateColors[edge.currentTrafficState]}`}>
                      {edge.currentTrafficState}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Segment Inspector & Traffic Modifier (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">SEGMENT INSPECTOR</span>
            <h3 className="text-base font-bold text-white">{activeEdge.name}</h3>
            <p className="text-xs font-mono text-slate-400">ID: {activeEdge.id} | Type: {activeEdge.roadType}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">LENGTH</div>
              <div className="text-white font-bold text-sm">{activeEdge.lengthMeters} meters</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">SPEED LIMIT</div>
              <div className="text-white font-bold text-sm">{activeEdge.speedLimitKmh} km/h</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">CURRENT AVG SPEED</div>
              <div className="text-emerald-400 font-bold text-sm">{activeEdge.currentAvgSpeedKmh} km/h</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-500 text-[10px]">TRAFFIC MULTIPLIER</div>
              <div className="text-amber-400 font-bold text-sm">{activeEdge.trafficWeightMultiplier}x</div>
            </div>
          </div>

          {/* Interactive Traffic Modifier */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-indigo-400" />
              Live Traffic State Modifier (Test Prediction Rerouting)
            </h4>
            <p className="text-[11px] text-slate-400">
              Modifying traffic state immediately updates path cost weights and triggers the ensemble prediction engine.
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {(['FREE_FLOW', 'MODERATE', 'HEAVY', 'CONGESTED'] as const).map((state) => (
                <button
                  key={state}
                  onClick={() => onUpdateTrafficState(activeEdge.id, state)}
                  className={`py-2 px-3 rounded-lg border font-bold transition-all text-center ${
                    activeEdge.currentTrafficState === state
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
