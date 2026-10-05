import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Globe,
  Camera,
  GitMerge,
  Activity,
  Compass,
  Bell,
  Cpu,
  FileCheck,
  BookOpen,
  Play,
  RotateCw,
  UserCheck,
  Leaf
} from 'lucide-react';
import { UserRole, SystemMetrics } from '../types';

interface EcoHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  systemMetrics: SystemMetrics;
  onSimulateTick: () => void;
  isAutoSimulating: boolean;
  setIsAutoSimulating: (sim: boolean) => void;
  unreadAlertsCount: number;
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  isEcoTheme: boolean;
  onToggleEcoTheme: () => void;
  onUniversalSearch: (term: string) => void;
}

export const EcoHeader: React.FC<EcoHeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  systemMetrics,
  onSimulateTick,
  isAutoSimulating,
  setIsAutoSimulating,
  unreadAlertsCount,
  activeRegion,
  setActiveRegion,
  isEcoTheme,
  onToggleEcoTheme,
  onUniversalSearch
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onUniversalSearch(searchTerm.trim());
    }
  };

  const tabs = [
    { id: 'traffic_intelligence', label: 'Traffic Intelligence (OSM + CCTV)', icon: Activity },
    { id: 'map', label: 'Geo Map Command Center', icon: Globe },
    { id: 'demo', label: 'CCTV Feeds Matrix', icon: Camera },
    { id: 'association', label: 'Multi-Camera Re-ID', icon: GitMerge },
    { id: 'graph', label: 'Road Graph Network', icon: Activity },
    { id: 'prediction', label: 'Route Prediction', icon: Compass },
    { id: 'alerts', label: 'Alerts & Incidents', icon: Bell, badge: unreadAlertsCount },
    { id: 'models', label: 'Model Metrics', icon: Cpu },
    { id: 'docs', label: 'Architecture & Stack', icon: BookOpen }
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-500 shadow-xl border-b ${
      isEcoTheme
        ? 'bg-white/95 border-[#DDEBE4] text-[#16322A]'
        : 'bg-slate-900 border-slate-800 text-slate-100'
    }`}>
      {/* Upper Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand & Eco Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[#168A5B] to-[#18A66A] text-white shadow-lg flex items-center justify-center">
            <Leaf className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight font-mono text-slate-900 dark:text-white">
                AegisTrack Eco AI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 border border-[#18A66A]/30">
                GEO COMMAND v3.4
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-Camera Vehicle Tracking & Ensemble Predictive Routing Platform
            </p>
          </div>
        </div>

        {/* Universal Search Form */}
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Region, Plate, Camera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs font-mono bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 focus:outline-none focus:border-[#18A66A]"
          />
        </form>

        {/* Region Auto-Selector & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Active Region Select */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-xl border border-slate-300 dark:border-slate-800">
            <Globe className="w-3.5 h-3.5 text-[#168A5B]" />
            <span className="text-slate-400 text-[10px]">REGION:</span>
            <select
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="bg-transparent font-bold font-mono focus:outline-none cursor-pointer text-[#168A5B] dark:text-emerald-400"
            >
              <option value="Tamil Nadu">Tamil Nadu (TN)</option>
              <option value="Kerala">Kerala (KL)</option>
              <option value="Delhi">Delhi (DL)</option>
              <option value="Maharashtra">Maharashtra (MH)</option>
              <option value="World">World View</option>
            </select>
          </div>

          {/* Simulation Tick */}
          <button
            onClick={onSimulateTick}
            className="px-3 py-1.5 rounded-xl bg-[#168A5B] hover:bg-[#18A66A] text-white font-bold transition-all shadow border border-[#18A66A]/40 flex items-center gap-1.5"
            title="Advance simulation by 1 step"
          >
            <RotateCw className="w-3.5 h-3.5" /> Tick
          </button>

          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all border flex items-center gap-1.5 ${
              isAutoSimulating
                ? 'bg-amber-600 text-white border-amber-400'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {isAutoSimulating ? 'Auto Sim' : 'Stream'}
          </button>

          {/* User Role Switcher */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer text-indigo-600 dark:text-indigo-400"
            >
              <option value="SUPER_ADMIN">Role: SUPER_ADMIN</option>
              <option value="SECURITY_ADMIN">Role: SECURITY_ADMIN</option>
              <option value="OPERATOR">Role: OPERATOR</option>
              <option value="ANALYST">Role: ANALYST</option>
              <option value="AUDITOR">Role: AUDITOR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto scrollbar-none border-t border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-[#18A66A] text-[#168A5B] dark:text-emerald-400 bg-[#E8F7EF]/50 dark:bg-emerald-950/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#168A5B] dark:text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-600 text-white animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
