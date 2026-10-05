// Types for AegisTrack - AI Multi-Camera Vehicle Tracking & Route Prediction Platform

export type UserRole = 'SUPER_ADMIN' | 'SECURITY_ADMIN' | 'OPERATOR' | 'ANALYST' | 'AUDITOR' | 'READ_ONLY';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  badgeNumber: string;
}

export type Permission = 
  | 'camera.read' 
  | 'camera.manage' 
  | 'vehicle.search' 
  | 'vehicle.track' 
  | 'prediction.read' 
  | 'alert.read' 
  | 'alert.manage' 
  | 'audit.read' 
  | 'model.manage' 
  | 'system.manage';

export interface BoundingBox {
  x: number; // Percentage 0-100
  y: number;
  width: number;
  height: number;
}

export interface CameraCalibration {
  orientationDegrees: number; // 0-360
  fieldOfViewDegrees: number;
  mountingHeightMeters: number;
  tiltAngleDegrees: number;
  homographyMatrix: number[][]; // 3x3 matrix for perspective transformation
}

export interface Camera {
  id: string;
  name: string;
  locationName: string;
  latitude: number;
  longitude: number;
  roadSegmentId: string;
  intersectionId: string;
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  fps: number;
  lanes: number;
  calibration: CameraCalibration;
  ipAddress: string;
  streamUrl: string;
  lastActive: string;
}

export type VehicleClass = 'car' | 'suv' | 'truck' | 'bus' | 'motorcycle' | 'van' | 'bicycle';

export interface VehicleObservation {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;
  localTrackId: string;
  anonymousVehicleId: string; // e.g. V-042 (Anonymized temporary ID)
  vehicleClass: VehicleClass;
  vehicleColor: string;
  vehicleMakeModel?: string;
  boundingBox: BoundingBox;
  plateText?: string; // Optional anonymized or hashed reference
  plateConfidence?: number;
  vehicleConfidence: number;
  detectionConfidence: number; // YOLO detection confidence (e.g. 0.96)
  trackingConfidence: number;  // ByteTrack / BoT-SORT confidence (e.g. 0.91)
  direction: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'NORTH_EAST' | 'NORTH_WEST' | 'SOUTH_EAST' | 'SOUTH_WEST';
  estimatedSpeedKmh: number;
  embeddingVector: number[]; // 512-dim visual appearance feature vector
  frameQualityScore: number;
  roadSegmentId: string;
  gpsEstimate: {
    lat: number;
    lng: number;
  };
}

export interface ConfidenceFusionBreakdown {
  appearanceSimilarity: number;  // Visual embedding cosine (e.g. 0.88)
  colorSimilarity: number;       // Color histogram / classifier score (e.g. 0.94)
  vehicleTypeSimilarity: number; // Class classifier consistency (e.g. 0.97)
  temporalConsistency: number;   // Time & speed kinematic feasibility (e.g. 0.91)
  routeConsistency: number;      // Road network topology transition score (e.g. 0.86)
  combinedScore: number;         // Multi-feature fused confidence (e.g. 0.91)
}

export interface ScoreDecomposition extends ConfidenceFusionBreakdown {
  plateSimilarity?: number;
  reidEmbeddingCosine?: number;
  colorClassMatch?: number;
  transitionProbability?: number;
  speedTimeFeasibility?: number;
  directionCompatibility?: number;
  roadConnectivityScore?: number;
  finalAssociationScore?: number;
}

export interface ObservationReference {
  observationId: string;
  cameraId: string;
  cameraName?: string;
  timestamp: string;
  timeFormatted?: string;
  anonymousVehicleId?: string;
  plateText?: string;
  confidence: number;
  estimatedSpeedKmh: number;
  roadSegmentName?: string;
}

export interface GlobalVehicleTrack {
  globalTrackId: string;
  anonymousVehicleId: string; // e.g. V-042 (Anonymized research & traffic ID)
  firstSeenTimestamp: string;
  lastSeenTimestamp: string;
  status: 'ACTIVE' | 'LOST' | 'TERMINATED';
  primaryPlateText: string; // Kept for backwards compatibility, mapped to anonymous ID
  plateHash: string; // Salted hash for privacy
  vehicleClass: VehicleClass;
  vehicleColor: string;
  makeModel: string;
  observationCount: number;
  camerasTraversed: string[];
  currentCameraId: string;
  currentRoadSegmentId: string;
  currentLocationEstimate: {
    lat: number;
    lng: number;
    roadSegmentName: string;
    speedKmh: number;
    headingDegrees: number;
    directionName?: string;
  };
  confidenceFusion: ConfidenceFusionBreakdown;
  scoreDecomposition: ScoreDecomposition;
  recentObservations: ObservationReference[];
}

export interface InfrastructurePOI {
  id: string;
  name: string;
  type: 'cctv' | 'traffic_signal' | 'police_station' | 'hospital' | 'fire_station' | 'petrol_station' | 'junction';
  latitude: number;
  longitude: number;
  status?: string;
  details?: string;
}

export interface RoadNode {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  intersectionType: '4_WAY' | 'T_JUNCTION' | 'ROUNDABOUT' | 'HIGHWAY_RAMP';
}

export interface RoadEdge {
  id: string;
  name: string;
  startNodeId: string;
  endNodeId: string;
  lengthMeters: number;
  speedLimitKmh: number;
  lanes: number;
  roadType: 'ARTERIAL' | 'HIGHWAY' | 'RESIDENTIAL' | 'ONE_WAY';
  currentTrafficState: 'FREE_FLOW' | 'MODERATE' | 'HEAVY' | 'CONGESTED' | 'CLOSED';
  currentAvgSpeedKmh: number;
  trafficWeightMultiplier: number;
}

export interface TransitionProbability {
  fromCameraId: string;
  toCameraId: string;
  probability: number;
  avgTravelTimeSeconds: number;
  stdDevSeconds: number;
  distanceMeters: number;
}

export interface RouteCandidate {
  rank: number;
  roadSegmentId: string;
  roadSegmentName: string;
  nextIntersectionId: string;
  nextIntersectionName: string;
  probability: number; // Calibrated 0.0 - 1.0
  rawConfidence: number;
  etaSecondsRange: [number, number]; // [min, max]
  distanceMeters: number;
  algorithmScores: {
    graphTopology: number;
    bayesianProbability: number;
    historicalTransition: number;
    mlTabularModel: number;
    trafficCongestionAwareness: number;
  };
  evidenceExplanations: string[];
}

export interface EnsemblePrediction {
  predictionId: string;
  globalTrackId: string;
  generatedTimestamp: string;
  currentRoadSegmentId: string;
  currentCameraId: string;
  status: 'SUCCESS' | 'LOW_CONFIDENCE_INSUFFICIENT_DATA';
  modelId: string;
  modelVersion: string;
  temperatureCalibration: number; // e.g. 1.2
  topPredictions: RouteCandidate[];
  predictionHorizonSeconds: number;
  uncertaintyMarginPercentage: number;
}

export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  ruleType: 'WATCHLIST_PLATE_MATCH' | 'GEOFENCE_VIOLATION' | 'RESTRICTED_ROAD_ENTRY' | 'SPEED_ANOMALY' | 'UNEXPECTED_ROUTE_DEVIATION';
  severity: AlertSeverity;
  enabled: boolean;
  minConfidenceThreshold: number; // 0.0 - 1.0
  parameters: {
    targetPlates?: string[];
    geofencePolygon?: { lat: number; lng: number }[];
    restrictedRoadIds?: string[];
    maxSpeedKmh?: number;
  };
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  timestamp: string;
  globalTrackId: string;
  cameraId: string;
  cameraName: string;
  plateText: string;
  locationName: string;
  confidence: number;
  status: 'NEW' | 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED';
  reason: string;
  evidenceSummary: string;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  queryReason: string;
  ipAddress: string;
  resultStatus: 'SUCCESS' | 'DENIED' | 'FAILED';
  metadataJson?: string;
}

export interface ModelMetrics {
  top1Accuracy: number;
  top2Accuracy: number;
  top3Accuracy: number;
  mrr: number; // Mean Reciprocal Rank
  brierScore: number;
  ece: number; // Expected Calibration Error
  mota: number; // Multiple Object Tracking Accuracy
  idf1: number; // Identification F1 score
  hota: number; // Higher Order Tracking Accuracy
  ocrPlateAccuracy: number;
  reidRank1: number;
  reidRank5: number;
  avgInferenceLatencyMs: number;
}

export interface ModelVersion {
  id: string;
  name: string;
  version: string;
  architecture: string;
  trainingDataset: string;
  trainedAt: string;
  deployedAt: string;
  status: 'ACTIVE_PRODUCTION' | 'CANARY_TESTING' | 'ARCHIVED';
  metrics: ModelMetrics;
  calibrationCurve: {
    confidenceBin: number;
    observedAccuracy: number;
  }[];
}

export interface SystemMetrics {
  activeCameras: number;
  totalCameras: number;
  fpsIngested: number;
  activeTracksCount: number;
  gpuUtilizationPercentage: number;
  inferenceLatencyMs: number;
  associationLatencyMs: number;
  predictionLatencyMs: number;
  apiLatencyMs: number;
  queuedFrames: number;
  memoryUsageMb: number;
}
