import React, { useState, useEffect } from 'react';
import { AuditLog, UserRole } from '../types';
import { FileCheck, ShieldCheck, Lock, Search, AlertCircle } from 'lucide-react';

interface AuditTrailTabProps {
  userRole: UserRole;
}

export const AuditTrailTab: React.FC<AuditTrailTabProps> = ({ userRole }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetch('/api/v1/audit-logs', {
      headers: { 'x-user-role': userRole }
    })
      .then((res) => {
        if (!res.ok) throw new Error('PERMISSIONS_DENIED: Accessing audit logs requires AUDITOR or SUPER_ADMIN role.');
        return res.json();
      })
      .then((data) => {
        setLogs(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [userRole]);

  const filtered = logs.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.queryReason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-indigo-400" />
            RBAC & Immutable Security Audit Trail
          </h2>
          <p className="text-xs text-slate-400">
            Append-only audit logs recording every sensitive vehicle query, plate search justification, model deployment switch, and system action.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Filter audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-950 text-xs text-white pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-red-950/60 border border-red-800 text-red-300 p-6 rounded-2xl flex items-center gap-3">
          <Lock className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm">Access Restricted by RBAC Security Policy</div>
            <div className="text-xs font-mono">{error} Switch role to SUPER_ADMIN or AUDITOR in header menu.</div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl overflow-x-auto">
          <table className="w-full text-left font-mono text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">User & Role</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Resource API</th>
                <th className="py-3 px-3">Justification / Case Reason</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{log.userName}</div>
                    <div className="text-[10px] text-indigo-400">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-3 font-bold text-cyan-300">{log.action}</td>
                  <td className="py-3 px-3 text-slate-400">{log.resource}</td>
                  <td className="py-3 px-3 text-slate-200 max-w-xs truncate" title={log.queryReason}>
                    {log.queryReason}
                  </td>
                  <td className="py-3 px-3 text-slate-400">{log.ipAddress}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.resultStatus === 'SUCCESS'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-red-950 text-red-300 border border-red-800'
                      }`}
                    >
                      {log.resultStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
