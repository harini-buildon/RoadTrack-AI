import React, { useState, useEffect } from 'react';
import { ModelVersion, UserRole } from '../types';
import { Cpu, CheckCircle2, AlertCircle, BarChart3, ShieldCheck, RefreshCw } from 'lucide-react';

interface ModelMetricsTabProps {
  userRole: UserRole;
}

export const ModelMetricsTab: React.FC<ModelMetricsTabProps> = ({ userRole }) => {
  const [modelData, setModelData] = useState<{
    activeModel: ModelVersion;
    allModels: ModelVersion[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchModels = () => {
    setIsLoading(true);
    fetch('/api/v1/models')
      .then((res) => res.json())
      .then((data) => {
        setModelData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Fetch model metrics error:', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleActivateModel = (modelId: string) => {
    fetch(`/api/v1/models/${modelId}/activate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': userRole }
    })
      .then((res) => res.json())
      .then(() => fetchModels())
      .catch((err) => console.error(err));
  };

  if (isLoading || !modelData) {
    return <div className="p-8 text-center font-mono text-slate-400">Loading AI Model Registry & Calibration Metrics...</div>;
  }

  const active = modelData.activeModel;
  const metrics = active.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            AI Model Registry, Calibration & Benchmarks Suite
          </h2>
          <p className="text-xs text-slate-400">
            Offline and online model evaluation across held-out trajectories, tracking MOTA/IDF1/HOTA, Brier score, and Reliability Calibration Diagrams.
          </p>
        </div>

        <div className="text-right font-mono text-xs">
          <div className="text-emerald-400 font-bold">ACTIVE MODEL: {active.version}</div>
          <div className="text-slate-400 text-[10px]">{active.architecture}</div>
        </div>
      </div>

      {/* Model Registry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modelData.allModels.map((mod) => {
          const isActive = mod.status === 'ACTIVE_PRODUCTION';
          return (
            <div
              key={mod.id}
              className={`p-5 rounded-2xl border transition-all space-y-4 shadow-xl ${
                isActive
                  ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900 border-indigo-500/80 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">{mod.version}</span>
                  <h3 className="text-base font-bold text-white">{mod.name}</h3>
                </div>
                <span
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full border ${
                    isActive
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}
                >
                  {mod.status}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300 font-mono">
                <div><strong>Architecture:</strong> {mod.architecture}</div>
                <div><strong>Training Dataset:</strong> {mod.trainingDataset}</div>
                <div><strong>Inference Latency:</strong> {mod.metrics.avgInferenceLatencyMs} ms / trajectory</div>
              </div>

              {!isActive && userRole === 'SUPER_ADMIN' && (
                <button
                  onClick={() => handleActivateModel(mod.id)}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-sans transition-colors shadow-md text-xs flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Deploy Canary to Production
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Benchmark Metrics Grid */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          Model Evaluation Metrics ({active.version})
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[10px]">TOP-1 ACCURACY</div>
            <div className="text-emerald-400 font-bold text-base">{(metrics.top1Accuracy * 100).toFixed(1)}%</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[10px]">TOP-2 ACCURACY</div>
            <div className="text-emerald-400 font-bold text-base">{(metrics.top2Accuracy * 100).toFixed(1)}%</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[10px]">TOP-3 ACCURACY</div>
            <div className="text-emerald-400 font-bold text-base">{(metrics.top3Accuracy * 100).toFixed(1)}%</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[10px]">MRR SCORE</div>
            <div className="text-cyan-400 font-bold text-base">{metrics.mrr}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[10px]">BRIER SCORE</div>
            <div className="text-amber-400 font-bold text-base">{metrics.brierScore}</div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-500 text-[10px]">ECE (CALIBRATION)</div>
            <div className="text-purple-400 font-bold text-base">{metrics.ece}</div>
          </div>
        </div>

        {/* Reliability Diagram Calibration Curve Table */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Reliability Diagram Calibration Curve (ECE = {metrics.ece})
          </h4>
          <div className="grid grid-cols-5 gap-2 font-mono text-center text-xs">
            {active.calibrationCurve.map((bin, i) => (
              <div key={i} className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <div className="text-slate-500 text-[10px]">Bin Conf {bin.confidenceBin}</div>
                <div className="text-emerald-400 font-bold">{bin.observedAccuracy} Acc</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
