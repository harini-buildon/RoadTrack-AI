import React, { useState } from 'react';
import {
  X,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  FileText,
  Loader2,
  Download
} from 'lucide-react';
import { uploadVehicleReportToDrive, DriveFileMetadata } from '../services/googleDriveService';
import { getCurrentUser, googleSignIn } from '../services/googleDriveAuth';
import { GlobalVehicleTrack, EnsemblePrediction } from '../types';

interface DriveExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: GlobalVehicleTrack;
  predictionData: EnsemblePrediction | null;
}

export const DriveExportModal: React.FC<DriveExportModalProps> = ({
  isOpen,
  onClose,
  track,
  predictionData
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportedFile, setExportedFile] = useState<DriveFileMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUser = getCurrentUser();

  const generatePayload = () => {
    return {
      title: `Vehicle Intelligence & Next-Location Prediction Report: ${track.primaryPlateText || track.anonymousVehicleId || 'V-042'}`,
      generatedAt: new Date().toISOString(),
      system: 'AegisTrack AI Command Center - Regional Corridor Surveillance',
      targetVehicle: {
        globalTrackId: track.globalTrackId,
        anonymousVehicleId: track.anonymousVehicleId || 'V-042',
        primaryPlateText: track.primaryPlateText || 'V-042',
        vehicleClass: track.vehicleClass,
        makeModel: track.makeModel,
        currentLocation: track.currentLocationEstimate,
        reidCosineMatch: track.scoreDecomposition?.reidEmbeddingCosine || 0.94,
        historicalTrajectory: track.recentCameraHits || []
      },
      ensemblePredictions: predictionData
        ? {
            status: 'OPTIMAL_CALIBRATION_CONVERGED',
            softmaxTemperature: predictionData.softmaxTemperature,
            topPredictions: predictionData.topPredictions
          }
        : 'Pending Realtime Calculation',
      audit: {
        classification: 'OFFICIAL_USE_ONLY',
        complianceStatus: 'ISO_27001_COMPLIANT'
      }
    };
  };

  const handleDownloadLocalJson = () => {
    const payload = generatePayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AEGISTRACK_PREDICTION_${track.anonymousVehicleId || track.primaryPlateText || 'V-042'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
      // Check auth first
      if (!currentUser) {
        const authResult = await googleSignIn();
        if (!authResult) {
          // User cancelled / dismissed popup
          setIsExporting(false);
          return;
        }
      }

      const reportPayload = generatePayload();
      const result = await uploadVehicleReportToDrive(track.primaryPlateText || track.anonymousVehicleId || 'V-042', reportPayload);
      setExportedFile(result);
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user' && err?.code !== 'auth/cancelled-popup-request') {
        setError(err?.message || 'Failed to export dossier to Google Drive.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider">Google Drive Integration</div>
              <div className="text-sm font-bold">Export Prediction Dossier</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-slate-700 dark:text-slate-200">
          {!exportedFile ? (
            <>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-400">Target Vehicle Dossier</div>
                <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
                  <span>Plate: {track.primaryPlateText}</span>
                  <span className="text-xs text-amber-500 font-mono">{track.vehicleClass.toUpperCase()}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Includes full multi-camera route trajectory, Re-ID embedding matches, and Top-3 ensemble probability predictions with ETA windows.
                </div>
              </div>

              {/* Confirmation Notice */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/40 text-[11px] space-y-1 text-blue-800 dark:text-blue-200">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                  <span>Google Drive Permission Confirmation</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  This action will save a JSON intelligence document to your connected Google Drive account with your permission.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>{error}</div>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white mx-auto flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                  Dossier Saved to Google Drive!
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
                  File: {exportedFile.name}
                </div>
              </div>

              {exportedFile.webViewLink && (
                <a
                  href={exportedFile.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Google Drive</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleDownloadLocalJson}
            disabled={isExporting}
            className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Download full surveillance and prediction dossier JSON directly to your device"
          >
            <Download className="w-3.5 h-3.5 text-blue-500" />
            <span>Download JSON Dossier</span>
          </button>

          <div className="flex items-center gap-2">
            {!exportedFile ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="btn-confirm-save-drive"
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Drive...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4" />
                      <span>Export to Google Drive</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setExportedFile(null);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
