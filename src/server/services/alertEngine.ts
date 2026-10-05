import { AlertEvent, VehicleObservation, GlobalVehicleTrack } from '../../types';
import { db } from '../db/inMemoryDb';

export class AlertEngine {
  /**
   * Evaluate active alert rules against a new vehicle observation
   */
  static evaluateRulesForObservation(
    observation: VehicleObservation,
    track: GlobalVehicleTrack
  ): AlertEvent[] {
    const triggeredAlerts: AlertEvent[] = [];

    for (const rule of db.alertRules) {
      if (!rule.enabled) continue;

      // 1. WATCHLIST_PLATE_MATCH
      if (rule.ruleType === 'WATCHLIST_PLATE_MATCH') {
        const targetPlates = rule.parameters.targetPlates || [];
        const cleanPlate = observation.plateText.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const isMatch = targetPlates.some(
          (tp) => tp.toUpperCase().replace(/[^A-Z0-9]/g, '') === cleanPlate
        );

        if (isMatch && observation.plateConfidence >= rule.minConfidenceThreshold) {
          const alert: AlertEvent = {
            id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            timestamp: new Date().toISOString(),
            globalTrackId: track.globalTrackId,
            cameraId: observation.cameraId,
            cameraName: observation.cameraName,
            plateText: observation.plateText,
            locationName: observation.cameraName,
            confidence: observation.plateConfidence,
            status: 'NEW',
            reason: `Target plate ${observation.plateText} matched Watchlist Rule '${rule.name}' with ${(observation.plateConfidence * 100).toFixed(0)}% OCR confidence.`,
            evidenceSummary: `Observation ID: ${observation.id}. Multi-camera track: ${track.globalTrackId}. Speed: ${observation.estimatedSpeedKmh} km/h.`
          };
          db.alerts.unshift(alert);
          triggeredAlerts.push(alert);
        }
      }

      // 2. SPEED_ANOMALY
      if (rule.ruleType === 'SPEED_ANOMALY') {
        const maxSpeed = rule.parameters.maxSpeedKmh || 80;
        if (observation.estimatedSpeedKmh > maxSpeed) {
          const alert: AlertEvent = {
            id: `ALT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            timestamp: new Date().toISOString(),
            globalTrackId: track.globalTrackId,
            cameraId: observation.cameraId,
            cameraName: observation.cameraName,
            plateText: observation.plateText,
            locationName: observation.cameraName,
            confidence: 0.92,
            status: 'NEW',
            reason: `Vehicle speed ${observation.estimatedSpeedKmh} km/h exceeded threshold (${maxSpeed} km/h) on ${observation.cameraName}.`,
            evidenceSummary: `Radar/Homography estimated speed: ${observation.estimatedSpeedKmh} km/h. Camera direction: ${observation.direction}.`
          };
          db.alerts.unshift(alert);
          triggeredAlerts.push(alert);
        }
      }
    }

    return triggeredAlerts;
  }
}
