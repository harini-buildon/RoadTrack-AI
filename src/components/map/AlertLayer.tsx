import React from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Point2D } from '../../services/map/GeoProjectionService';

export interface AlertMarkerData {
  id: string;
  type: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  screenPos: Point2D;
}

interface AlertLayerProps {
  alerts: AlertMarkerData[];
}

export const AlertLayer: React.FC<AlertLayerProps> = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-30">
      {alerts.map((alert) => {
        const posX = alert.screenPos?.x ?? (alert as any).x ?? 50;
        const posY = alert.screenPos?.y ?? (alert as any).y ?? 50;
        return (
          <div
            key={alert.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
            style={{ left: `${posX}%`, top: `${posY}%` }}
          >
            <div className="flex flex-col items-center animate-bounce">
              <div className="px-2 py-1 rounded-xl bg-red-600 text-white font-mono font-bold text-[10px] shadow-2xl border border-red-400 flex items-center gap-1 mb-1 whitespace-nowrap">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
                <span>{alert.type}</span>
              </div>

              <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
