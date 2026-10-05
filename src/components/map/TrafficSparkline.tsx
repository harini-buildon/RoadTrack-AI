import React from 'react';
import { Activity } from 'lucide-react';

interface TrafficSparklineProps {
  rank: number;
  congestionPercent?: number; // 0 to 100
  avgSpeedKmh?: number;
  samplePoints?: number[];
  showDetails?: boolean;
}

export const TrafficSparkline: React.FC<TrafficSparklineProps> = ({
  rank,
  congestionPercent,
  avgSpeedKmh,
  samplePoints,
  showDetails = true
}) => {
  // Default realistic congestion values per rank
  const congestion =
    congestionPercent ?? (rank === 1 ? 18 : rank === 2 ? 45 : 78);
  const speed = avgSpeedKmh ?? (rank === 1 ? 52 : rank === 2 ? 34 : 18);

  // Sparkline point trends (values 0 - 100)
  const points =
    samplePoints ??
    (rank === 1
      ? [12, 18, 15, 22, 19, 16, 14, 18]
      : rank === 2
      ? [30, 42, 48, 38, 44, 52, 40, 45]
      : [60, 78, 85, 72, 80, 88, 75, 78]);

  const getTheme = (cong: number) => {
    if (cong < 30) {
      return {
        stroke: '#10b981', // Emerald
        fill: 'rgba(16, 185, 129, 0.15)',
        badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
        label: 'Smooth Flow',
        dot: 'bg-emerald-500'
      };
    } else if (cong < 65) {
      return {
        stroke: '#f59e0b', // Amber
        fill: 'rgba(245, 158, 11, 0.15)',
        badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
        label: 'Mod Traffic',
        dot: 'bg-amber-500'
      };
    } else {
      return {
        stroke: '#ef4444', // Red
        fill: 'rgba(239, 68, 68, 0.15)',
        badgeBg: 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30',
        label: 'Heavy Delay',
        dot: 'bg-red-500'
      };
    }
  };

  const theme = getTheme(congestion);

  // SVG sparkline path parameters
  const width = 72;
  const height = 22;
  const min = 0;
  const max = 100;

  const pathPoints = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / (max - min)) * height;
    return `${x},${y}`;
  });

  const linePath = `M ${pathPoints.join(' L ')}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px]">
      {/* SVG Mini Sparkline Chart */}
      <div className="relative flex-shrink-0" style={{ width: `${width}px`, height: `${height}px` }}>
        <svg width={width} height={height} className="overflow-visible">
          <defs>
            <linearGradient id={`sparkGrad-${rank}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.stroke} stopOpacity="0.3" />
              <stop offset="100%" stopColor={theme.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Fill under sparkline */}
          <path d={areaPath} fill={`url(#sparkGrad-${rank})`} />

          {/* Sparkline Line */}
          <path
            d={linePath}
            fill="none"
            stroke={theme.stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Last Data Node */}
          {points.length > 0 && (
            <circle
              cx={width}
              cy={height - ((points[points.length - 1] - min) / (max - min)) * height}
              r="2.5"
              fill={theme.stroke}
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Traffic Status Tag */}
      {showDetails && (
        <div className={`px-1.5 py-0.5 rounded-md border flex items-center gap-1 font-bold whitespace-nowrap ${theme.badgeBg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${theme.dot}`} />
          <span>{theme.label}</span>
          <span className="opacity-90">{speed} km/h</span>
        </div>
      )}
    </div>
  );
};
