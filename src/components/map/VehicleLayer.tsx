import React, { useEffect, useState } from 'react';
import { Navigation, Car, ShieldCheck, Zap } from 'lucide-react';
import { Point2D } from '../../services/map/GeoProjectionService';

export interface VehicleMarkerData {
  id: string;
  plateText: string;
  vehicleClass: string;
  vehicleColor: string;
  speedKmh: number;
  direction: string;
  headingDegrees?: number;
  confidence: number;
  timestamp: string;
  screenPos: Point2D;
  isSelected?: boolean;
}

interface VehicleLayerProps {
  vehicles: VehicleMarkerData[];
  onSelectVehicle?: (id: string) => void;
}

export const VehicleLayer: React.FC<VehicleLayerProps> = ({ vehicles, onSelectVehicle }) => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-20">
      {vehicles.map((v) => (
        <VehicleItem key={v.id} vehicle={v} onSelectVehicle={onSelectVehicle} />
      ))}
    </div>
  );
};

const VehicleItem: React.FC<{ vehicle: VehicleMarkerData; onSelectVehicle?: (id: string) => void }> = ({
  vehicle,
  onSelectVehicle
}) => {
  const initialPos = vehicle.screenPos || { x: (vehicle as any).x ?? 50, y: (vehicle as any).y ?? 50 };
  const [currPos, setCurrPos] = useState<Point2D>(initialPos);

  // Smooth interpolation when coordinates update
  useEffect(() => {
    if (vehicle.screenPos) {
      setCurrPos(vehicle.screenPos);
    } else if ((vehicle as any).x !== undefined && (vehicle as any).y !== undefined) {
      setCurrPos({ x: (vehicle as any).x, y: (vehicle as any).y });
    }
  }, [vehicle.screenPos?.x, vehicle.screenPos?.y, (vehicle as any).x, (vehicle as any).y]);

  // Convert direction string or heading degrees to rotation angle
  const getRotationAngle = (dir: string, heading?: number): number => {
    if (heading !== undefined) return heading;
    switch (dir) {
      case 'NORTH':
        return 0;
      case 'NORTH_EAST':
        return 45;
      case 'EAST':
        return 90;
      case 'SOUTH_EAST':
        return 135;
      case 'SOUTH':
        return 180;
      case 'SOUTH_WEST':
        return 225;
      case 'WEST':
        return 270;
      case 'NORTH_WEST':
        return 315;
      default:
        return 45;
    }
  };

  const rotation = getRotationAngle(vehicle.direction, vehicle.headingDegrees);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onSelectVehicle?.(vehicle.id);
      }}
      className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer transition-all duration-1000 ease-out group z-30"
      style={{
        left: `${currPos.x}%`,
        top: `${currPos.y}%`
      }}
    >
      <div className="flex flex-col items-center">
        {/* Floating Vehicle Info Badge with Heading Direction Indicator */}
        <div
          className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-bold shadow-2xl backdrop-blur-md border transition-all mb-1.5 flex items-center gap-1.5 whitespace-nowrap ${
            vehicle.isSelected
              ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 scale-105'
              : 'bg-slate-900/95 text-white border-slate-700 group-hover:border-amber-400'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="text-amber-300 font-extrabold">{vehicle.plateText}</span>
          <span className="text-slate-400">|</span>
          <span className="text-cyan-300">{vehicle.speedKmh} km/h</span>
          <span className="text-slate-400">|</span>
          <span className="text-amber-400 font-extrabold flex items-center gap-0.5">
            <span
              className="inline-block transition-transform duration-500"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              ↑
            </span>
            {rotation}° {vehicle.direction.replace('_', ' ')}
          </span>
          <span className="text-emerald-400 font-semibold">{Math.round(vehicle.confidence * 100)}%</span>
        </div>

        {/* Dynamic Directional Arrow Head SVG Marker */}
        <div className="relative flex items-center justify-center">
          {/* Radar Ping Ripple for Selected Vehicle */}
          {vehicle.isSelected && (
            <div className="absolute -inset-4 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
          )}

          {/* Rotated Container for Velocity Beam & Arrowhead */}
          <div
            className="relative transition-transform duration-500 ease-out flex items-center justify-center"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {/* Forward Motion Cone / Velocity Beam in direction of movement */}
            <div className="absolute -top-8 w-12 h-10 pointer-events-none opacity-60">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon points="50,10 90,90 10,90" fill="url(#velocityConeGrad)" />
                <defs>
                  <linearGradient id="velocityConeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Sharp Arrowhead SVG Icon Body */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 shadow-2xl transition-transform ${
                vehicle.isSelected
                  ? 'bg-amber-400 border-white text-slate-950 ring-4 ring-amber-500/40'
                  : 'bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 border-white text-white group-hover:scale-115'
              }`}
            >
              {/* Dynamic SVG Arrow Head Pointing Upwards (rotated by parent angle) */}
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 filter drop-shadow-md text-amber-300"
              >
                {/* Aerodynamic Forward Arrow Head Tip */}
                <path d="M12 2L21 21L12 17L3 21L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
