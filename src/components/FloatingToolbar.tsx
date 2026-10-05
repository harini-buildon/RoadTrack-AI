import React from 'react';
import {
  Search,
  Camera,
  Navigation,
  Activity,
  Compass,
  Bell,
  Layers,
  Leaf,
  Cpu,
  Shield,
  Eye,
  Crosshair
} from 'lucide-react';

interface FloatingToolbarProps {
  activeLayers: {
    roads: boolean;
    cameras: boolean;
    vehicles: boolean;
    trails: boolean;
    predictions: boolean;
    traffic: boolean;
    h3Grid: boolean;
    geofence: boolean;
    debugMode: boolean;
  };
  onToggleLayer: (key: string) => void;
  isEcoTheme: boolean;
  onToggleEcoTheme: () => void;
  onOpenDebugModal: () => void;
  onOpenSearch: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  activeLayers,
  onToggleLayer,
  isEcoTheme,
  onToggleEcoTheme,
  onOpenDebugModal,
  onOpenSearch
}) => {
  return (
    <div className="absolute top-20 left-4 z-40 flex flex-col gap-2 p-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl transition-all">
      {/* Universal Search Button */}
      <button
        onClick={onOpenSearch}
        className="p-2.5 rounded-xl bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 hover:bg-[#168A5B] hover:text-white transition-all shadow border border-[#18A66A]/30 flex items-center justify-center group"
        title="Universal Search (Plate / Location / Camera)"
      >
        <Search className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

      {/* Layer Toggles */}
      <button
        onClick={() => onToggleLayer('cameras')}
        className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
          activeLayers.cameras
            ? 'bg-[#168A5B] text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
        title="Toggle CCTV Cameras Layer"
      >
        <Camera className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleLayer('vehicles')}
        className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
          activeLayers.vehicles
            ? 'bg-[#168A5B] text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
        title="Toggle Tracked Vehicles Layer"
      >
        <Navigation className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleLayer('roads')}
        className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
          activeLayers.roads
            ? 'bg-[#168A5B] text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
        title="Toggle Road Network Graph Layer"
      >
        <Activity className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleLayer('predictions')}
        className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
          activeLayers.predictions
            ? 'bg-[#1677C8] text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
        title="Toggle Top-3 Route Prediction Branches Layer"
      >
        <Compass className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleLayer('h3Grid')}
        className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
          activeLayers.h3Grid
            ? 'bg-purple-600 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
        title="Toggle Uber H3 Hexagonal Grid Layer"
      >
        <Layers className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleLayer('geofence')}
        className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
          activeLayers.geofence
            ? 'bg-amber-600 text-white'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white'
        }`}
        title="Toggle Geofence Security Zone Layer"
      >
        <Shield className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-200 dark:bg-slate-800 my-1"></div>

      {/* Eco Theme Toggle */}
      <button
        onClick={onToggleEcoTheme}
        className={`p-2.5 rounded-xl transition-all shadow flex items-center justify-center ${
          isEcoTheme ? 'bg-[#18A66A] text-white ring-2 ring-[#18A66A]/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
        }`}
        title="Toggle Eco-Friendly Map Theme"
      >
        <Leaf className="w-4 h-4" />
      </button>

      {/* Spatial Index Debug Mode */}
      <button
        onClick={onOpenDebugModal}
        className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow flex items-center justify-center"
        title="Open Multi-Algorithm Spatial Index Debug & Consensus Panel"
      >
        <Cpu className="w-4 h-4" />
      </button>
    </div>
  );
};
