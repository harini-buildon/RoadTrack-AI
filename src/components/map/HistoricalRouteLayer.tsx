import React from 'react';
import { Point2D } from '../../services/map/GeoProjectionService';

interface HistoricalRouteLayerProps {
  points: Point2D[];
  strokeColor?: string;
  strokeWidth?: number;
}

export const HistoricalRouteLayer: React.FC<HistoricalRouteLayerProps> = ({
  points,
  strokeColor = '#1E3A8A', // Dark Blue
  strokeWidth = 5
}) => {
  if (!points || points.length < 2) return null;

  // Build SVG path string from percentage points
  const pathData = points.reduce((acc, pt, index) => {
    return index === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <filter id="glow-dark-blue" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="0.4" floodColor="#1d4ed8" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Dark Casing Underlay for Satellite Contrast */}
      <path
        d={pathData}
        fill="none"
        stroke="#020617"
        strokeWidth={strokeWidth + 3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
        vectorEffect="non-scaling-stroke"
      />

      {/* Outer Halo Line */}
      <path
        d={pathData}
        fill="none"
        stroke="#2563eb"
        strokeWidth={strokeWidth + 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
        vectorEffect="non-scaling-stroke"
      />

      {/* Main Solid Dark Blue Line */}
      <path
        d={pathData}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#glow-dark-blue)"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};
