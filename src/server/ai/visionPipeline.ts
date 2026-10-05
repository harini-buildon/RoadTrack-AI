import { VehicleObservation, BoundingBox, VehicleClass } from '../../types';

// Simulated Computer Vision Pipeline with abstractions for:
// - VehicleDetector
// - VehicleTracker
// - PlateRecognizer (ALPR + Temporal Voting)
// - VehicleReIdentifier (512-dim embedding encoder)

export class VisionPipeline {
  /**
   * Process a camera video frame or simulation tick.
   * Performs detection, temporal OCR voting across frames, and embedding extraction.
   */
  static processFrameObservation(
    cameraId: string,
    cameraName: string,
    roadSegmentId: string,
    gpsLat: number,
    gpsLng: number,
    plateText: string,
    vehicleClass: VehicleClass,
    vehicleColor: string,
    speedKmh: number,
    direction: VehicleObservation['direction']
  ): VehicleObservation {
    // Generate simulated bounding box
    const boundingBox: BoundingBox = {
      x: Math.floor(20 + Math.random() * 50),
      y: Math.floor(30 + Math.random() * 40),
      width: 120 + Math.floor(Math.random() * 40),
      height: 90 + Math.floor(Math.random() * 30)
    };

    // Frame quality assessment (0.80 - 0.99)
    const frameQualityScore = parseFloat((0.82 + Math.random() * 0.16).toFixed(2));

    // Multi-frame temporal OCR confidence fusion simulation
    const rawOcrScores = [0.78, 0.86, 0.93, 0.91];
    const avgOcr = rawOcrScores.reduce((a, b) => a + b, 0) / rawOcrScores.length;
    const plateConfidence = parseFloat((avgOcr * (0.95 + frameQualityScore * 0.05)).toFixed(2));

    // Simulated 512-dim Re-ID embedding
    const embeddingVector: number[] = [];
    let norm = 0;
    const seed = plateText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < 512; i++) {
      const val = Math.sin((seed + i) * 0.25) + Math.cos(i * 0.1);
      embeddingVector.push(val);
      norm += val * val;
    }
    norm = Math.sqrt(norm);
    const normalizedEmbedding = embeddingVector.map((v) => v / norm);

    return {
      id: `OBS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      cameraId,
      cameraName,
      timestamp: new Date().toISOString(),
      localTrackId: `LOC-TRK-${Math.floor(100 + Math.random() * 900)}`,
      anonymousVehicleId: plateText.startsWith('V-') ? plateText : `V-${Math.floor(10 + Math.random() * 90)}`,
      vehicleClass,
      vehicleColor,
      boundingBox,
      plateText,
      plateConfidence,
      vehicleConfidence: 0.94,
      detectionConfidence: 0.96,
      trackingConfidence: 0.91,
      direction,
      estimatedSpeedKmh: speedKmh,
      embeddingVector: normalizedEmbedding,
      frameQualityScore,
      roadSegmentId,
      gpsEstimate: { lat: gpsLat, lng: gpsLng }
    };
  }
}
