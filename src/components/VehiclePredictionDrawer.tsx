import React, { useState, useEffect } from 'react';
import { GlobalVehicleTrack, EnsemblePrediction, UserRole } from '../types';
import { TrafficSparkline } from './map/TrafficSparkline';
import { DriveExportModal } from './DriveExportModal';
import { getCurrentUser, googleSignIn, initAuth, logout } from '../services/googleDriveAuth';
import { User } from 'firebase/auth';
import {
  X,
  Navigation,
  Compass,
  CheckCircle2,
  Clock,
  Zap,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Layers,
  FileCheck,
  Activity,
  Crosshair,
  Maximize2,
  HardDrive,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  LogIn,
  LogOut
} from 'lucide-react';

interface VehiclePredictionDrawerProps {
  selectedVehicleId: string | null;
  tracks: GlobalVehicleTrack[];
  onClose: () => void;
  userRole: UserRole;
  isEcoTheme: boolean;
  onPanAndZoomToPath?: () => void;
}

export const VehiclePredictionDrawer: React.FC<VehiclePredictionDrawerProps> = ({
  selectedVehicleId,
  tracks,
  onClose,
  userRole,
  isEcoTheme,
  onPanAndZoomToPath
}) => {
  const [predictionData, setPredictionData] = useState<EnsemblePrediction | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPathFramed, setIsPathFramed] = useState<boolean>(false);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState<boolean>(false);
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isLoggingInDrive, setIsLoggingInDrive] = useState<boolean>(false);

  const activeTrack = tracks.find((t) => t.globalTrackId === selectedVehicleId) || tracks[0];

  useEffect(() => {
    // Check initial Firebase / Google auth state for Drive
    const unsubscribe = initAuth(
      (user) => setDriveUser(user),
      () => setDriveUser(null)
    );
    setDriveUser(getCurrentUser());
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!activeTrack) return;
    setLoading(true);
    fetch(`/api/v1/predictions/${activeTrack.globalTrackId}`)
      .then((res) => res.json())
      .then((data) => {
        setPredictionData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching prediction drawer data:', err);
        setLoading(false);
      });
  }, [selectedVehicleId, activeTrack]);

  const handlePanZoomClick = () => {
    setIsPathFramed(true);
    onPanAndZoomToPath?.();
    setTimeout(() => setIsPathFramed(false), 2400);
  };

  const handleGoogleDriveSignIn = async () => {
    try {
      setIsLoggingInDrive(true);
      const res = await googleSignIn();
      if (res) {
        setDriveUser(res.user);
      }
    } catch (error: any) {
      if (error?.code !== 'auth/popup-closed-by-user' && error?.code !== 'auth/cancelled-popup-request') {
        console.warn('Drive sign-in notification:', error?.message || error);
      }
    } finally {
      setIsLoggingInDrive(false);
    }
  };

  const handleGoogleDriveSignOut = async () => {
    try {
      await logout();
      setDriveUser(null);
    } catch (error) {
      console.error('Drive sign-out error:', error);
    }
  };

  if (!selectedVehicleId || !activeTrack) return null;

  return (
    <>
      <div
        id="vehicle-prediction-drawer"
        className={`absolute top-20 right-4 z-40 w-96 max-h-[calc(100vh-110px)] overflow-y-auto rounded-2xl border shadow-2xl p-5 space-y-4 backdrop-blur-md transition-all ${
          isEcoTheme
            ? 'bg-white/95 border-[#DDEBE4] text-[#16322A]'
            : 'bg-slate-900/95 border-slate-800 text-slate-100'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 border border-[#18A66A]/30">
              <Navigation className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">VEHICLE SURVEILLANCE TARGET</div>
              <div className="text-base font-bold font-mono text-amber-500 flex items-center gap-1.5">
                <span>{activeTrack.primaryPlateText}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30">
                  LIVE
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Drawer"
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Specs Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs space-y-2">
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-400">Class:</span>{' '}
              <strong className="text-slate-800 dark:text-white uppercase">{activeTrack.vehicleClass}</strong>
            </div>
            <div>
              <span className="text-slate-400">Make/Model:</span>{' '}
              <strong className="text-slate-800 dark:text-white">{activeTrack.makeModel}</strong>
            </div>
            <div>
              <span className="text-slate-400">Speed:</span>{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">{activeTrack.currentLocationEstimate.speedKmh} km/h</strong>
            </div>
            <div>
              <span className="text-slate-400">Heading:</span>{' '}
              <strong className="text-cyan-600 dark:text-cyan-400">{activeTrack.currentLocationEstimate.headingDegrees}°</strong>
            </div>
          </div>

          {/* ALPR & Re-ID Cosine Metric */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Re-ID Cosine Match:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              {(activeTrack.scoreDecomposition.reidEmbeddingCosine * 100).toFixed(1)}% (Rank 1)
            </span>
          </div>
        </div>

        {/* Auto Pan & Zoom to Vehicle & Projected Path Button */}
        <div>
          <button
            id="btn-auto-pan-zoom-path"
            onClick={handlePanZoomClick}
            className={`w-full py-2.5 px-3.5 rounded-xl font-bold font-mono text-xs flex items-center justify-between transition-all duration-300 shadow-md group ${
              isPathFramed
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 ring-2 ring-amber-400 scale-[1.01]'
                : isEcoTheme
                ? 'bg-gradient-to-r from-[#168A5B] to-[#18A66A] hover:from-[#13734b] hover:to-[#168A5B] text-white border border-[#18A66A]/40 shadow-emerald-900/20 active:scale-[0.98]'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border border-blue-400/40 shadow-blue-950/40 active:scale-[0.98]'
            }`}
            title="Pan and zoom map to frame this vehicle and its full projected route"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`p-1.5 rounded-lg transition-transform ${
                  isPathFramed ? 'bg-black/20 text-slate-950' : 'bg-white/20 text-white group-hover:scale-110'
                }`}
              >
                <Crosshair className={`w-4 h-4 ${isPathFramed ? 'animate-spin' : 'animate-pulse'}`} />
              </span>
              <div className="text-left">
                <div className="text-[11px] font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                  <span>{isPathFramed ? 'Framing Path...' : 'Pan & Zoom to Path'}</span>
                </div>
                <div className={`text-[9px] font-normal ${isPathFramed ? 'text-slate-900 font-medium' : 'text-white/80'}`}>
                  {isPathFramed ? 'Centered on vehicle & 3 routes' : 'Center vehicle & entire projected path'}
                </div>
              </div>
            </div>
            <div
              className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-mono font-bold ${
                isPathFramed ? 'bg-black/20 text-slate-950' : 'bg-black/25 text-amber-300'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>{isPathFramed ? '100% FIT' : 'AUTO-FIT'}</span>
            </div>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* REFINED CARD-BASED LAYOUT: NEXT LOCATION PREDICTION SECTION */}
        {/* ========================================================================= */}
        <div className="space-y-3 pt-1">
          {/* Section Header with Hierarchical Typography & Softmax Temperature */}
          <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Compass className="w-4 h-4" />
              </span>
              <div>
                <h4 className="text-xs font-black font-mono uppercase tracking-wider text-slate-900 dark:text-white">
                  NEXT LOCATION PREDICTION
                </h4>
                <div className="text-[10px] text-slate-500 font-mono">Calibrated Multi-Model Ensemble</div>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-[#E8F7EF] dark:bg-emerald-950 text-[#168A5B] dark:text-emerald-300 font-bold px-2 py-0.5 rounded border border-[#18A66A]/30">
              T=1.2 SOFTMAX
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center font-mono text-xs text-slate-400 animate-pulse space-y-2">
              <Cpu className="w-5 h-5 mx-auto animate-spin text-blue-500" />
              <div>Computing Calibrated Probabilities...</div>
            </div>
          ) : predictionData && predictionData.topPredictions && predictionData.topPredictions.length > 0 ? (
            <div className="space-y-3">
              {predictionData.topPredictions.map((cand) => {
                const probabilityPct = Math.round(cand.probability * 100);
                const isRank1 = cand.rank === 1;
                const isRank2 = cand.rank === 2;

                return (
                  <div
                    key={cand.rank}
                    className={`rounded-xl border transition-all duration-200 p-4 space-y-3 font-mono ${
                      isRank1
                        ? 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/60 dark:border-emerald-500/70 shadow-lg shadow-emerald-950/10 ring-1 ring-emerald-500/30'
                        : isRank2
                        ? 'bg-gradient-to-br from-sky-500/10 via-blue-500/5 to-transparent border-sky-500/40 dark:border-sky-500/50 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Clear Hierarchy between Route Label and Probability Percentage */}
                    <div className="flex items-start justify-between gap-3">
                      {/* Left Column: Rank Pill & Primary Route Title + Corridor Subtitle */}
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase inline-flex items-center gap-1 ${
                              isRank1
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : isRank2
                                ? 'bg-sky-600 text-white'
                                : 'bg-slate-700 text-slate-200'
                            }`}
                          >
                            <span>RANK #{cand.rank}</span>
                            {isRank1 && <Sparkles className="w-2.5 h-2.5" />}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            {isRank1 ? 'HIGHEST PROBABILITY' : isRank2 ? 'ALTERNATE ROUTE' : 'CONTINGENCY'}
                          </span>
                        </div>

                        {/* Primary Route Name */}
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white truncate pt-0.5">
                          {cand.roadSegmentName}
                        </div>

                        {/* Target Junction Subtitle */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                          <span className="text-slate-400">Target Jct:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {cand.nextIntersectionName}
                          </span>
                        </div>
                      </div>

                      {/* Right Column: Prominent Probability Percentage Display */}
                      <div className="flex flex-col items-end flex-shrink-0">
                        <div
                          className={`px-2.5 py-1 rounded-xl font-black text-base flex flex-col items-end shadow-sm border ${
                            isRank1
                              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                              : isRank2
                              ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-baseline gap-0.5">
                            <span className="text-lg leading-none">{probabilityPct}</span>
                            <span className="text-xs font-bold">%</span>
                          </div>
                          <span className="text-[8px] font-extrabold uppercase tracking-tight opacity-75">
                            CONFIDENCE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Calibrated Probability Visual Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isRank1
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : isRank2
                              ? 'bg-gradient-to-r from-sky-500 to-blue-400'
                              : 'bg-gradient-to-r from-slate-400 to-slate-500'
                          }`}
                          style={{ width: `${Math.max(probabilityPct, 4)}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata Subgrid: ETA Window & Traffic Flow Sparkline */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/80 dark:border-slate-800/80 text-[10px]">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <Clock className="w-3 h-3 text-amber-500 flex-shrink-0" />
                        <span className="truncate">
                          ETA: <strong>{cand.etaSecondsRange[0]}s - {cand.etaSecondsRange[1]}s</strong>
                        </span>
                      </div>

                      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-cyan-500 flex-shrink-0" />
                          TRAFFIC:
                        </span>
                        <TrafficSparkline rank={cand.rank} showDetails={false} />
                      </div>
                    </div>

                    {/* Explainable AI Evidence Tags */}
                    <div className="space-y-1 pt-1">
                      <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-blue-500" />
                        <span>AI Evidence Signals</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cand.evidenceExplanations.map((exp, i) => (
                          <span
                            key={i}
                            className="text-[9px] px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                          >
                            ✓ {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-xs font-mono text-slate-400 border border-dashed rounded-xl">
              No route predictions available for this track.
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* GOOGLE DRIVE INTEGRATION SECTION */}
        {/* ========================================================================= */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-900 dark:text-white uppercase">Google Drive Intelligence</div>
                <div className="text-[9px] text-slate-500">Cloud Dossier Archive</div>
              </div>
            </div>

            {driveUser ? (
              <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Connected
              </span>
            ) : (
              <span className="text-[9px] font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                Not Connected
              </span>
            )}
          </div>

          {driveUser ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="truncate font-mono">{driveUser.email || 'Google Operator'}</span>
                <button
                  onClick={handleGoogleDriveSignOut}
                  className="text-slate-400 hover:text-red-400 transition-colors ml-2"
                  title="Sign out of Google Drive"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>

              <button
                id="btn-export-dossier-drive"
                onClick={() => setIsDriveModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Save Dossier to Google Drive</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[10px] text-slate-500">
                Connect your Google Account to archive full vehicle dossiers directly to your Google Drive.
              </div>

              <button
                id="btn-google-drive-login"
                onClick={handleGoogleDriveSignIn}
                disabled={isLoggingInDrive}
                className="w-full py-2 px-3 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
              >
                {/* Official Google G Logo */}
                <svg className="w-3.5 h-3.5" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isLoggingInDrive ? 'Connecting Google Drive...' : 'Sign in with Google to Connect Drive'}</span>
              </button>
            </div>
          )}
        </div>

        {/* RBAC Compliance Footnote */}
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 text-[10px] font-mono text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
          <FileCheck className="w-4 h-4 flex-shrink-0 text-indigo-500" />
          <span>Vehicle track search and prediction logged under RBAC role {userRole}.</span>
        </div>
      </div>

      {/* Google Drive Export Modal with User Confirmation */}
      <DriveExportModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        track={activeTrack}
        predictionData={predictionData}
      />
    </>
  );
};
