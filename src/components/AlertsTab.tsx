import React from 'react';
import { AlertEvent, AlertRule, UserRole } from '../types';
import { Bell, ShieldAlert, CheckCircle2, Clock, AlertTriangle, Filter, Eye } from 'lucide-react';

interface AlertsTabProps {
  alerts: AlertEvent[];
  alertRules: AlertRule[];
  userRole: UserRole;
  onAcknowledgeAlert: (alertId: string) => void;
}

export const AlertsTab: React.FC<AlertsTabProps> = ({
  alerts,
  alertRules,
  userRole,
  onAcknowledgeAlert
}) => {
  const severityBadgeColors: Record<AlertEvent['severity'], string> = {
    CRITICAL: 'bg-red-950 text-red-300 border-red-700/80 animate-pulse',
    HIGH: 'bg-amber-950 text-amber-300 border-amber-700/80',
    MEDIUM: 'bg-yellow-950 text-yellow-300 border-yellow-700/80',
    LOW: 'bg-slate-800 text-slate-300 border-slate-700'
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-red-400" />
            Security Alert Engine & Human Review Center
          </h2>
          <p className="text-xs text-slate-400">
            Real-time security rule engine processing watchlist matches, geofence perimeter violations, and speed anomalies.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
            UNREVIEWED: <strong className="text-red-400">{alerts.filter((a) => a.status === 'NEW').length}</strong>
          </span>
          <span className="px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-800 text-slate-300">
            TOTAL: <strong className="text-white">{alerts.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Alerts List (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Active Incident Alerts Feed
          </h3>

          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded-full border ${severityBadgeColors[alert.severity]}`}>
                      {alert.severity}
                    </span>
                    <span className="font-bold text-sm text-white">{alert.ruleName}</span>
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <p className="text-slate-200">{alert.reason}</p>
                  <p className="text-slate-400 font-mono text-[11px]">{alert.evidenceSummary}</p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="text-slate-400">
                    LOCATION: <strong className="text-cyan-400">{alert.locationName}</strong> | PLATE: <strong className="text-amber-400">{alert.plateText}</strong>
                  </div>

                  <div>
                    {alert.status === 'NEW' ? (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-sans font-medium transition-colors shadow-md text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge Alert
                      </button>
                    ) : (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Reviewed by {alert.reviewedBy || 'Operator'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Rules Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
            Security Rules Configuration ({alertRules.length})
          </h3>

          <div className="space-y-3">
            {alertRules.map((rule) => (
              <div key={rule.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{rule.name}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded ${rule.enabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-500'}`}>
                    {rule.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{rule.description}</p>
                <div className="text-[10px] font-mono text-indigo-400">
                  MIN CONFIDENCE THRESHOLD: {(rule.minConfidenceThreshold * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
