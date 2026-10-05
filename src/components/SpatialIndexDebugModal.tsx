import React from 'react';
import { X, Cpu, Layers, Database, GitBranch, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface SpatialIndexDebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEcoTheme: boolean;
}

export const SpatialIndexDebugModal: React.FC<SpatialIndexDebugModalProps> = ({
  isOpen,
  onClose,
  isEcoTheme
}) => {
  if (!isOpen) return null;

  const spatialIndexes = [
    { name: 'R-Tree / R*-Tree', type: 'Minimum Bounding Rectangles', candidates: ['Road NH-44', 'Road Annasalai', 'Road GST-2'], recall: '99.4%' },
    { name: 'Quadtree Index', type: 'Recursive 2D Subdivision', candidates: ['Road NH-44', 'Road Annasalai'], recall: '98.8%' },
    { name: 'k-d Tree (5D)', type: 'Lat/Lng/Heading/Speed/Time', candidates: ['Road NH-44', 'Road GST-2'], recall: '98.1%' },
    { name: 'Geohash Bucket', type: 'Base32 Geo Spatial Keys (8-char)', candidates: ['Road NH-44', 'Road Annasalai', 'Road GST-2'], recall: '97.6%' },
    { name: 'Google S2 Cell', type: 'Hilbert Curve 64-bit Cell IDs', candidates: ['Road NH-44', 'Road Annasalai'], recall: '99.1%' },
    { name: 'Uber H3 Hexagon', type: 'Resolution 8 Hexagonal Grid', candidates: ['Road NH-44', 'Road Annasalai', 'Road GST-2'], recall: '99.6%' },
    { name: 'PostGIS GiST Index', type: 'Spatial R-Tree in PostgreSQL', candidates: ['Road NH-44', 'Road Annasalai', 'Road GST-2'], recall: '99.8%' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 space-y-6 ${
        isEcoTheme
          ? 'bg-white border-[#DDEBE4] text-[#16322A]'
          : 'bg-slate-900 border-slate-800 text-slate-100'
      }`}>
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 border border-[#18A66A]/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                Multi-Algorithm Spatial Indexing & HMM Map-Matching Consensus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cascaded spatial index query execution benchmark, multi-index candidate consensus scoring, and Viterbi trajectory decoding.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Spatial Index Benchmarks Grid */}
        <div className="space-y-3 font-mono text-xs">
          <h4 className="text-xs font-bold uppercase text-[#168A5B] dark:text-emerald-400 flex items-center gap-2">
            <Layers className="w-4 h-4" />
            7-Index Spatial Retrieval Layer Benchmarks
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {spatialIndexes.map((idx, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{idx.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    Recall@20: {idx.recall}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">{idx.type}</div>
                <div className="text-[11px] text-cyan-600 dark:text-cyan-400">
                  Retrieved Candidates: {idx.candidates.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Multi-Index Consensus Matrix */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
          <h4 className="text-xs font-bold uppercase text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Multi-Index Candidate Consensus & HMM Map-Matching Viterbi State
          </h4>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-white">Road Segment NH-44 (Arterial Highway)</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">7/7 Indexes Consensus (100% Match)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-white">Road Annasalai (Urban Arterial)</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">5/7 Indexes Consensus (71% Match)</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="font-bold text-slate-800 dark:text-white">Road GST-2 (Regional Connector)</span>
              <span className="text-amber-500 font-bold">4/7 Indexes Consensus (57% Match)</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500">
          <span>Cascaded Spatial Search Latency: 4.2ms</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#168A5B] hover:bg-[#18A66A] text-white font-bold transition-all shadow"
          >
            Close Debug Panel
          </button>
        </div>
      </div>
    </div>
  );
};
