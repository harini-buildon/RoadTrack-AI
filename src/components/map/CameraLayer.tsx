import React from 'react';
import { Camera as CameraIcon, Activity, AlertTriangle, VideoOff } from 'lucide-react';
import { Point2D } from '../../services/map/GeoProjectionService';

export interface CameraMarkerData {
  id: string;
  name: string;
  locationName: string;
  status: 'ONLINE' | 'PROCESSING' | 'WARNING' | 'OFFLINE';
  screenPos: Point2D;
  isSelected?: boolean;
}

interface CameraLayerProps {
  cameras: CameraMarkerData[];
  onSelectCamera?: (id: string) => void;
}

export const CameraLayer: React.FC<CameraLayerProps> = ({ cameras, onSelectCamera }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
      {cameras.map((cam) => (
        <CameraItem key={cam.id} camera={cam} onSelectCamera={onSelectCamera} />
      ))}
    </div>
  );
};

const CameraItem: React.FC<{ camera: CameraMarkerData; onSelectCamera?: (id: string) => void }> = ({
  camera,
  onSelectCamera
}) => {
  const posX = camera.screenPos?.x ?? (camera as any).x ?? 50;
  const posY = camera.screenPos?.y ?? (camera as any).y ?? 50;

  const getStatusStyle = (status: CameraMarkerData['status']) => {
    switch (status) {
      case 'ONLINE':
        return {
          bg: 'bg-blue-600',
          border: 'border-blue-400',
          text: 'text-blue-100',
          ring: 'ring-blue-500/30'
        };
      case 'PROCESSING':
        return {
          bg: 'bg-emerald-600',
          border: 'border-emerald-400',
          text: 'text-emerald-100',
          ring: 'ring-emerald-500/30'
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-600',
          border: 'border-amber-400',
          text: 'text-amber-100',
          ring: 'ring-amber-500/30'
        };
      case 'OFFLINE':
      default:
        return {
          bg: 'bg-slate-700',
          border: 'border-slate-500',
          text: 'text-slate-300',
          ring: 'ring-slate-500/30'
        };
    }
  };

  const style = getStatusStyle(camera.status);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectCamera?.(camera.id);
      }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
      style={{
        left: `${posX}%`,
        top: `${posY}%`
      }}
    >
      <div className="flex flex-col items-center">
        {/* Tooltip / Label */}
        <div
          className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold shadow-lg border backdrop-blur-md mb-1 whitespace-nowrap transition-all opacity-80 group-hover:opacity-100 ${style.bg} ${style.text} ${style.border}`}
        >
          <span>📹 {camera.id}</span>
          <span className="ml-1 font-semibold text-[9px] opacity-90">({camera.locationName})</span>
        </div>

        {/* Camera Pin */}
        <div
          className={`w-6 h-6 rounded-full ${style.bg} ${style.border} border-2 shadow-xl flex items-center justify-center text-white transition-transform group-hover:scale-125 ${
            camera.isSelected ? 'ring-4 ' + style.ring + ' scale-125' : ''
          }`}
        >
          {camera.status === 'PROCESSING' ? (
            <Activity className="w-3.5 h-3.5 animate-pulse" />
          ) : camera.status === 'WARNING' ? (
            <AlertTriangle className="w-3.5 h-3.5" />
          ) : camera.status === 'OFFLINE' ? (
            <VideoOff className="w-3.5 h-3.5" />
          ) : (
            <CameraIcon className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </div>
  );
};
