import React from 'react';
import {
  ShieldAlert,
  Camera,
  Activity,
  GitMerge,
  Compass,
  Bell,
  Cpu,
  FileCheck,
  BookOpen,
  Play,
  RotateCw,
  UserCheck,
  Lock
} from 'lucide-react';
import { UserRole, SystemMetrics } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  systemMetrics: SystemMetrics;
  onSimulateTick: () => void;
  isAutoSimulating: boolean;
  setIsAutoSimulating: (sim: boolean) => void;
  unreadAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  systemMetrics,
  onSimulateTick,
  isAutoSimulating,
  setIsAutoSimulating,
  unreadAlertsCount
}) => {
  const tabs = [
    { id: 'demo', label: '5 Demo CCTV Footages', icon: Camera },
    { id: 'cameras', label: 'CCTV Feeds & GIS Map', icon: Camera },
    { id: 'association', label: 'Multi-Camera Re-ID', icon: GitMerge },
    { id: 'graph', label: 'Road Graph Network', icon: Activity },
    { id: 'prediction', label: 'Ensemble Route Prediction', icon: Compass },
    { id: 'alerts', label: 'Alerts & Geofences', icon: Bell, badge: unreadAlertsCount },
    { id: 'models', label: 'Model Metrics & Calibration', icon: Cpu },
    { id: 'audit', label: 'RBAC & Audit Trail', icon: FileCheck },
    { id: 'docs', label: 'Architecture & Docs Spec', icon: BookOpen }
  ];

  const roleColors: Record<UserRole, string> = {
    SUPER_ADMIN: 'bg-red-950/80 text-red-300 border-red-700/60',
    SECURITY_ADMIN: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    OPERATOR: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
    ANALYST: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60',
    AUDITOR: 'bg-purple-950/80 text-purple-300 border-purple-700/60',
    READ_ONLY: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl shadow-lg border border-indigo-400/30 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                AegisTrack AI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                v3.4.1 PROD
              </span>
            </div>
            <p className="text-xs text-slate-400">
              AI Multi-CCTV Vehicle Tracking, Re-ID & Ensemble Route Prediction Platform
            </p>
          </div>
        </div>

        {/* System Health Status & Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-300">FPS: <strong className="text-emerald-400">{systemMetrics.fpsIngested}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">CAMERAS: <strong className="text-cyan-400">{systemMetrics.activeCameras}/{systemMetrics.totalCameras}</strong></span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">LATENCY: <strong className="text-amber-400">{systemMetrics.inferenceLatencyMs}ms</strong></span>
          </div>

          {/* Simulation Tick Button */}
          <button
            onClick={onSimulateTick}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg font-sans font-medium transition-colors flex items-center gap-1.5 shadow-md border border-indigo-400/30"
            title="Step simulation forward by 1 tick"
          >
            <RotateCw className="w-3.5 h-3.5 animate-spin-slow" />
            Simulate Frame
          </button>

          <button
            onClick={() => setIsAutoSimulating(!isAutoSimulating)}
            className={`px-3 py-1.5 rounded-lg font-sans font-medium transition-colors flex items-center gap-1.5 border ${
              isAutoSimulating
                ? 'bg-amber-600/90 hover:bg-amber-500 text-white border-amber-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isAutoSimulating ? 'animate-pulse text-amber-200' : ''}`} />
            {isAutoSimulating ? 'Auto-Sim Active' : 'Auto Stream'}
          </button>

          {/* User Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 px-2.5 py-1 rounded-lg border border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value as UserRole)}
              className={`bg-transparent text-xs font-semibold px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${roleColors[userRole]}`}
            >
              <option value="SUPER_ADMIN">Role: SUPER_ADMIN</option>
              <option value="SECURITY_ADMIN">Role: SECURITY_ADMIN</option>
              <option value="OPERATOR">Role: OPERATOR</option>
              <option value="ANALYST">Role: ANALYST</option>
              <option value="AUDITOR">Role: AUDITOR</option>
              <option value="READ_ONLY">Role: READ_ONLY</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center overflow-x-auto scrollbar-none border-t border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? 'border-indigo-500 text-white bg-indigo-950/30'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-red-600 text-white animate-bounce">
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
