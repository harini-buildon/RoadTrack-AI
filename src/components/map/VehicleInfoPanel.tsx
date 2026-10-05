import React from 'react';
import {
  Car,
  MapPin,
  Camera as CameraIcon,
  Sparkles,
  Play,
  Crosshair,
  X,
  Compass,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Maximize2
} from 'lucide-react';
import { PredictedRouteData } from './PredictionRouteLayer';
import { TrafficSparkline } from './TrafficSparkline';

interface VehicleInfoPanelProps {
  vehicle: {
    id: string;
    plateText: string;
    vehicleClass: string;
    vehicleColor: string;
    speedKmh: number;
    direction: string;
    locationName: string;
    roadName: string;
    lastCameraName: string;
  } | null;
  predictions: PredictedRouteData[];
  onClose: () => void;
  onFollowVehicle?: () => void;
  onReplayRoute?: () => void;
  onPanZoomToPath?: () => void;
  isFollowingVehicle?: boolean;
}

export const VehicleInfoPanel: React.FC<VehicleInfoPanelProps> = ({
  vehicle,
  predictions,
  onClose,
  onFollowVehicle,
  onReplayRoute,
  onPanZoomToPath,
  isFollowingVehicle = false
}) => {
  if (!vehicle) return null;

  return (
    <div className="absolute right-4 top-16 bottom-20 z-40 w-80 sm:w-88 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md font-mono text-xs flex flex-col overflow-hidden animate-in slide-in-from-right-10 duration-300 pointer-events-auto">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between border-b border-blue-600">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-amber-300" />
          <span className="font-extrabold text-xs">VEHICLE TRACK INSPECTION</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Details Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Vehicle Badge Banner */}
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-slate-500 font-bold">PLATE NUMBER</div>
            <div className="text-base font-black text-amber-600 dark:text-amber-400 font-mono tracking-wider">
              {vehicle.plateText}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold capitalize">
              {vehicle.vehicleColor} {vehicle.vehicleClass}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-500 font-bold">SPEED / DIR</div>
            <div className="text-sm font-extrabold text-cyan-600 dark:text-cyan-400">
              {vehicle.speedKmh} km/h
            </div>
            <div className="text-[10px] text-emerald-600 font-bold">{vehicle.direction}</div>
          </div>
        </div>

        {/* Location & Road Details */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/80 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700">
            <MapPin className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-slate-500">CURRENT LOCATION</div>
              <div className="font-extrabold text-slate-900 dark:text-white">{vehicle.locationName}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/80 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700">
            <Compass className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-slate-500">CURRENT ROAD</div>
              <div className="font-extrabold text-slate-900 dark:text-white">{vehicle.roadName}</div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-blue-50/80 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700">
            <CameraIcon className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-[10px] font-bold text-slate-500">LAST DETECTED CAMERA</div>
              <div className="font-extrabold text-slate-900 dark:text-white">{vehicle.lastCameraName}</div>
            </div>
          </div>
        </div>

        {/* Top-3 Next Location Predictions */}
        <div className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-black text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>NEXT LOCATION PREDICTION (TOP-3)</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold border border-blue-500/20">
              ENSEMBLE
            </span>
          </div>

          <div className="space-y-2.5">
            {predictions.slice(0, 3).map((pred) => {
              const pct = Math.round(pred.probability * 100);
              const isRank1 = pred.rank === 1;
              const isRank2 = pred.rank === 2;

              return (
                <div
                  key={pred.rank}
                  className={`p-3 rounded-xl border space-y-2.5 transition-all font-mono ${
                    isRank1
                      ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-emerald-500/50 dark:border-emerald-500/60 shadow-sm'
                      : isRank2
                      ? 'bg-gradient-to-r from-sky-500/10 to-blue-500/5 border-sky-500/40 dark:border-sky-500/50'
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      <span
                        className={`w-5 h-5 rounded-lg flex-shrink-0 text-white font-black text-[10px] flex items-center justify-center ${
                          isRank1 ? 'bg-emerald-600' : isRank2 ? 'bg-sky-600' : 'bg-slate-700'
                        }`}
                      >
                        #{pred.rank}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                          {pred.destinationName}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {pred.routeName}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`px-2 py-0.5 rounded-lg font-black text-xs border flex-shrink-0 ${
                        isRank1
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : isRank2
                          ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {pct}%
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isRank1 ? 'bg-emerald-500' : isRank2 ? 'bg-sky-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.max(pct, 5)}%` }}
                    />
                  </div>

                  {/* Traffic Sparkline & Congestion Row */}
                  <div className="pt-1.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                      <Activity className="w-3 h-3 text-cyan-500" />
                      Traffic Flow:
                    </span>
                    <TrafficSparkline rank={pred.rank} showDetails={false} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Action Buttons */}
      <div className="p-3 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <button
          onClick={onPanZoomToPath}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          title="Auto pan and zoom map to fit vehicle and all 3 projected routes"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Pan & Zoom to Projected Path</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onFollowVehicle}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
              isFollowingVehicle
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 ring-2 ring-amber-400/50'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Crosshair className={`w-3.5 h-3.5 ${isFollowingVehicle ? 'animate-spin' : ''}`} />
            <span>{isFollowingVehicle ? 'Following Active' : 'Follow Vehicle'}</span>
          </button>

          <button
            onClick={onReplayRoute}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Replay</span>
          </button>
        </div>
      </div>
    </div>
  );
};
