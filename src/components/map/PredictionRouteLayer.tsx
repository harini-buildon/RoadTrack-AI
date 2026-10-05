import React, { useEffect, useRef, useState } from 'react';
import { Point2D } from '../../services/map/GeoProjectionService';

export interface PredictedRouteData {
  rank: number; // 1, 2, 3
  probability: number; // e.g. 0.67, 0.23, 0.10
  routeName: string;
  points: Point2D[];
  destinationName: string;
}

interface PredictionRouteLayerProps {
  predictions: PredictedRouteData[];
}

/**
 * Color-blind friendly styling configuration for predicted routes.
 * Maintains the blue/green aesthetic with high luminance separation,
 * multi-channel pattern encoding (distinct dasharrays, line widths, and symbols),
 * and dark contrast casing for maximum legibility over satellite imagery.
 */
interface RouteStyleConfig {
  primaryColor: string;
  glowColor: string;
  haloColor: string;
  dashArray: string;
  strokeWidth: number;
  casingWidth: number;
  symbol: string;
  rankLabel: string;
  cardBorder: string;
  cardBadgeBg: string;
  pinColor: string;
}

const ROUTE_STYLES: Record<number, RouteStyleConfig> = {
  1: {
    // Primary: High-Luminance Cyan-Blue (Color-blind safe with high photon luminance)
    primaryColor: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.9)',
    haloColor: '#0284C7',
    dashArray: '10 5', // Long dashes for primary
    strokeWidth: 4.5,
    casingWidth: 9.5,
    symbol: '◆',
    rankLabel: 'RANK #1 (PRIMARY)',
    cardBorder: 'border-cyan-400/90 ring-2 ring-cyan-500/40',
    cardBadgeBg: 'bg-cyan-500 text-slate-950 font-black',
    pinColor: '#00E5FF'
  },
  2: {
    // Secondary: Vivid Spring Mint / High-Luminance Emerald (High yellow-green emission)
    primaryColor: '#00F59B',
    glowColor: 'rgba(0, 245, 155, 0.85)',
    haloColor: '#059669',
    dashArray: '6 4', // Medium dashes for secondary
    strokeWidth: 3.8,
    casingWidth: 8.5,
    symbol: '■',
    rankLabel: 'RANK #2 (ALT)',
    cardBorder: 'border-emerald-400/90 ring-1 ring-emerald-500/30',
    cardBadgeBg: 'bg-emerald-400 text-slate-950 font-black',
    pinColor: '#00F59B'
  },
  3: {
    // Tertiary: Vivid Electric Indigo / Periwinkle (Distinct spectral separation)
    primaryColor: '#818CF8',
    glowColor: 'rgba(129, 140, 248, 0.85)',
    haloColor: '#4F46E5',
    dashArray: '8 3 2 3', // Dash-dot pattern for tertiary
    strokeWidth: 3.2,
    casingWidth: 7.5,
    symbol: '▲',
    rankLabel: 'RANK #3 (CONTINGENCY)',
    cardBorder: 'border-indigo-400/80',
    cardBadgeBg: 'bg-indigo-500 text-white font-bold',
    pinColor: '#818CF8'
  }
};

const DEFAULT_STYLE: RouteStyleConfig = {
  primaryColor: '#38BDF8',
  glowColor: 'rgba(56, 189, 248, 0.8)',
  haloColor: '#0284C7',
  dashArray: '6 4',
  strokeWidth: 3.5,
  casingWidth: 8,
  symbol: '●',
  rankLabel: 'PREDICTED ROUTE',
  cardBorder: 'border-blue-400',
  cardBadgeBg: 'bg-blue-600 text-white',
  pinColor: '#38BDF8'
};

export const PredictionRouteLayer: React.FC<PredictionRouteLayerProps> = ({ predictions }) => {
  if (!predictions || predictions.length === 0) return null;

  // Filter top 3 predictions
  const topPredictions = predictions.slice(0, 3);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
      {/* SVG Dashed Paths Layer with Path Growth & High-Contrast Casing */}
      <svg
        className="w-full h-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {topPredictions.map((pred) => {
          if (!pred.points || pred.points.length < 2) return null;
          const style = ROUTE_STYLES[pred.rank] || DEFAULT_STYLE;

          return (
            <AnimatedPathItem
              key={`pred-path-${pred.rank}`}
              pred={pred}
              style={style}
            />
          );
        })}
      </svg>

      {/* Predictive Destination End Markers with High Satellite Contrast */}
      {topPredictions.map((pred) => {
        if (!pred.points || pred.points.length === 0) return null;
        const lastPt = pred.points[pred.points.length - 1];
        const probPercent = Math.round(pred.probability * 100);
        const style = ROUTE_STYLES[pred.rank] || DEFAULT_STYLE;

        return (
          <div
            key={`pred-node-${pred.rank}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30 transition-all duration-700 ease-out font-mono"
            style={{ left: `${lastPt.x}%`, top: `${lastPt.y}%` }}
          >
            <div className="flex flex-col items-center group">
              {/* Destination Callout Tag with High-Contrast Dark Glass Card */}
              <div
                className={`px-3 py-1.5 rounded-xl text-[11px] font-mono shadow-2xl backdrop-blur-md bg-slate-950/95 border text-slate-100 flex items-center gap-2 mb-1.5 whitespace-nowrap transition-transform duration-200 group-hover:scale-105 ${style.cardBorder}`}
              >
                {/* Rank & Symbol Badge */}
                <span className={`px-1.5 py-0.5 rounded-md text-[9px] tracking-wider uppercase flex items-center gap-1 ${style.cardBadgeBg}`}>
                  <span>{style.symbol}</span>
                  <span>#{pred.rank}</span>
                </span>

                {/* Destination Name */}
                <span className="font-extrabold text-white text-xs max-w-[150px] truncate">
                  {pred.destinationName}
                </span>

                {/* Probability Confidence Pill with High Contrast */}
                <span className="px-1.5 py-0.5 rounded-md bg-white/15 border border-white/20 font-black text-[10px] text-amber-300">
                  {probPercent}%
                </span>
              </div>

              {/* High-Contrast Dual-Ring Destination Beacon */}
              <div className="relative flex items-center justify-center">
                {/* Satellite Contrast Underlay Ring */}
                <div className="absolute w-7 h-7 rounded-full bg-black/80 shadow-2xl" />

                {/* Outer Pulsing Color Ring */}
                <div
                  className="absolute -inset-2.5 rounded-full animate-ping opacity-60"
                  style={{ backgroundColor: style.primaryColor }}
                />

                {/* Colored Halo Ring */}
                <div
                  className="w-5 h-5 rounded-full border-2 border-white shadow-xl flex items-center justify-center"
                  style={{ backgroundColor: style.primaryColor }}
                >
                  {/* Inner High Contrast Center Core */}
                  <div className="w-2 h-2 rounded-full bg-slate-950 border border-white/80" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AnimatedPathItem: React.FC<{
  pred: PredictedRouteData;
  style: RouteStyleConfig;
}> = ({ pred, style }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [dashOffset, setDashOffset] = useState<number>(1000);
  const [totalLength, setTotalLength] = useState<number>(1000);

  const pathData = pred.points.reduce((acc, pt, index) => {
    return index === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  useEffect(() => {
    if (pathRef.current) {
      try {
        const len = pathRef.current.getTotalLength() || 100;
        setTotalLength(len);
        setDashOffset(len);

        const frame = requestAnimationFrame(() => {
          setTimeout(() => {
            setDashOffset(0);
          }, 70 * pred.rank);
        });

        return () => cancelAnimationFrame(frame);
      } catch (err) {
        setTotalLength(200);
        setDashOffset(0);
      }
    }
  }, [pathData, pred.rank]);

  const clipId = `clip-pred-${pred.rank}`;
  const filterId = `glow-filter-${pred.rank}`;

  return (
    <g>
      <defs>
        {/* SVG Blur Filter for Map Route Glow Effect */}
        <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3.0" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <clipPath id={clipId}>
          {/* Solid line path that animates strokeDashoffset from totalLength to 0 to trace route outwards */}
          <path
            ref={pathRef}
            d={pathData}
            fill="none"
            stroke="#000"
            strokeWidth={20}
            strokeDasharray={totalLength}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transition: 'stroke-dashoffset 1.8s cubic-bezier(0.25, 1, 0.5, 1)'
            }}
          />
        </clipPath>
      </defs>

      {/* Render the clipped prediction line with high-contrast satellite underlay */}
      <g clipPath={`url(#${clipId})`}>
        {/* 1. SOLID DARK UNDERLAY CASING: Ensures contrast against light roads, beige sand, or white buildings */}
        <path
          d={pathData}
          fill="none"
          stroke="#020617"
          strokeWidth={style.casingWidth}
          strokeOpacity={0.92}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* 2. OUTER LUMINOUS COLOR HALO: Provides vibrant ambient glow */}
        <path
          d={pathData}
          fill="none"
          stroke={style.primaryColor}
          strokeWidth={style.strokeWidth + 3.5}
          strokeOpacity={0.65}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#${filterId})`}
          className="animate-route-glow"
          style={{ '--glow-color': style.primaryColor } as React.CSSProperties}
          vectorEffect="non-scaling-stroke"
        />

        {/* 3. SOLID COLORED MID-LINE: Reinforces the rank's specific color identity */}
        <path
          d={pathData}
          fill="none"
          stroke={style.primaryColor}
          strokeWidth={style.strokeWidth}
          strokeOpacity={0.95}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* 4. HIGH-CONTRAST ANIMATED DASHED CORE: Pure white dashes with rank-specific dash patterns */}
        <path
          d={pathData}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={Math.max(style.strokeWidth - 1.2, 1.8)}
          strokeDasharray={style.dashArray}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-dash-flow"
          vectorEffect="non-scaling-stroke"
        />
      </g>
    </g>
  );
};
