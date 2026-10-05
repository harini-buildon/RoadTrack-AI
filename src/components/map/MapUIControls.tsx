import React, { useState } from 'react';
import {
  Search,
  Bell,
  Settings,
  Maximize2,
  Minimize2,
  Layers,
  Activity,
  Compass,
  MapPin,
  ChevronDown
} from 'lucide-react';

interface MapUIControlsProps {
  activeRegion: string;
  onSelectRegion: (region: string) => void;
  onSearch: (term: string) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  unreadAlertsCount?: number;
  activeVehiclesCount?: number;
  activeCamerasCount?: number;
}

export const MapUIControls: React.FC<MapUIControlsProps> = ({
  activeRegion,
  onSelectRegion,
  onSearch,
  onToggleFullscreen,
  isFullscreen,
  onZoomIn,
  onZoomOut,
  unreadAlertsCount = 0,
  activeVehiclesCount = 3,
  activeCamerasCount = 8
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState<boolean>(false);

  const regions = ['Tamil Nadu', 'Kerala', 'Delhi', 'Maharashtra'];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-30 font-mono text-xs">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
        {/* Top-Left Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="pointer-events-auto flex items-center bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 backdrop-blur-md w-72 sm:w-96"
        >
          <Search className="w-4 h-4 text-slate-400 ml-2 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search vehicle / camera / area in Tamil Nadu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none text-xs"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors ml-1"
          >
            Search
          </button>
        </form>

        {/* Top-Right Region, Alerts, Settings */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Region Selector */}
          <div className="relative">
            <button
              onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
              className="px-3 py-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-md text-slate-800 dark:text-white font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>{activeRegion}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isRegionDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                <div className="px-3 py-1.5 text-[10px] text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                  SELECT REGIONAL MAP
                </div>
                {regions.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => {
                      onSelectRegion(reg);
                      setIsRegionDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors flex items-center justify-between ${
                      reg === activeRegion
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{reg}</span>
                    {reg === 'Tamil Nadu' && <span className="text-[9px] opacity-80">(Embed Active)</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Alerts Badge Button */}
          <button className="relative p-2.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-md text-slate-800 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Bell className="w-4 h-4 text-amber-500" />
            {unreadAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadAlertsCount}
              </span>
            )}
          </button>

          {/* Fullscreen Mode Toggle Button */}
          <button
            onClick={onToggleFullscreen}
            className={`px-3 py-2 rounded-2xl font-bold border transition-all shadow-xl flex items-center gap-1.5 ${
              isFullscreen
                ? 'bg-purple-600 text-white border-purple-500 animate-pulse'
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
            }`}
            title="Toggle Browser Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
        </div>
      </div>

      {/* Floating Bottom Status Bar */}
      <div className="absolute bottom-4 left-4 right-20 sm:right-auto pointer-events-auto flex items-center bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 backdrop-blur-md space-x-3 text-xs">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-extrabold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>LIVE OVERLAY ●</span>
        </div>

        <div className="text-slate-400">|</div>

        <div className="text-slate-800 dark:text-slate-200 font-bold">
          Vehicles: <span className="text-blue-600 dark:text-blue-400">{activeVehiclesCount}</span>
        </div>

        <div className="text-slate-400">|</div>

        <div className="text-slate-800 dark:text-slate-200 font-bold">
          Cameras: <span className="text-emerald-600 dark:text-emerald-400">{activeCamerasCount}</span>
        </div>

        <div className="text-slate-400 hidden sm:block">|</div>

        <div className="text-slate-500 dark:text-slate-400 font-semibold hidden sm:flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-cyan-500" />
          <span>AI Top-3 Path Prediction Active</span>
        </div>
      </div>

      {/* Floating Bottom-Right Zoom Controls */}
      <div className="absolute right-4 bottom-4 pointer-events-auto flex flex-col gap-2">
        <button
          onClick={onZoomIn}
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-black text-lg flex items-center justify-center shadow-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="w-10 h-10 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white font-black text-lg flex items-center justify-center shadow-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Zoom Out"
        >
          -
        </button>
      </div>
    </div>
  );
};
