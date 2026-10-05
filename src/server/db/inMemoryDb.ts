import {
  Camera,
  RoadNode,
  RoadEdge,
  TransitionProbability,
  GlobalVehicleTrack,
  VehicleObservation,
  AlertRule,
  AlertEvent,
  AuditLog,
  ModelVersion,
  SystemMetrics,
  User,
  InfrastructurePOI
} from '../../types';

// Helper to generate normalized 512-dim embedding
function generateEmbedding(seed: number): number[] {
  const vec: number[] = [];
  let norm = 0;
  for (let i = 0; i < 512; i++) {
    const val = Math.sin(seed * (i + 1) * 0.1234) + Math.cos(seed * 0.5);
    vec.push(val);
    norm += val * val;
  }
  norm = Math.sqrt(norm);
  return vec.map((v) => v / norm);
}

// Metro City Center Coordinates (Centered around Downtown Metro Area)
// Lat: 37.7749, Lng: -122.4194
export const INITIAL_USERS: User[] = [
  {
    id: 'USR-101',
    name: 'Command Director Marcus Vance',
    email: 'm.vance@security.metro.gov',
    role: 'SUPER_ADMIN',
    department: 'Metropolitan Traffic & Security Directorate',
    badgeNumber: 'DIR-8840'
  },
  {
    id: 'USR-102',
    name: 'Officer Elena Rostova',
    email: 'e.rostova@security.metro.gov',
    role: 'OPERATOR',
    department: 'Live Operations Center',
    badgeNumber: 'OP-4491'
  },
  {
    id: 'USR-103',
    name: 'Dr. Aris Thorne',
    email: 'a.thorne@ai.metro.gov',
    role: 'ANALYST',
    department: 'AI Systems & Analytics Lab',
    badgeNumber: 'AI-2094'
  },
  {
    id: 'USR-104',
    name: 'Auditor Sarah Jenkins',
    email: 's.jenkins@audit.metro.gov',
    role: 'AUDITOR',
    department: 'Internal Privacy & Compliance Oversight',
    badgeNumber: 'AUD-0012'
  }
];

export const INITIAL_ROAD_NODES: RoadNode[] = [
  { id: 'NODE-01', name: 'Anna Salai & Mount Road Junction', latitude: 13.0827, longitude: 80.2707, intersectionType: '4_WAY' },
  { id: 'NODE-02', name: 'Chennai Central & EVR Periyar Salai', latitude: 13.0836, longitude: 80.2755, intersectionType: '4_WAY' },
  { id: 'NODE-03', name: 'Ripon Building & Poonamallee High Rd', latitude: 13.0818, longitude: 80.2780, intersectionType: 'HIGHWAY_RAMP' },
  { id: 'NODE-04', name: 'Island Grounds & Kamarajar Promenade', latitude: 13.0780, longitude: 80.2790, intersectionType: '4_WAY' },
  { id: 'NODE-05', name: 'Marina Beach Coastal Highway Jct', latitude: 13.0710, longitude: 80.2830, intersectionType: 'T_JUNCTION' },
  { id: 'NODE-06', name: 'Egmore Gandhi Irwin Roundabout', latitude: 13.0790, longitude: 80.2610, intersectionType: 'ROUNDABOUT' },
  { id: 'NODE-07', name: 'Koyambedu Ring Expressway Ramp', latitude: 13.0694, longitude: 80.1948, intersectionType: 'HIGHWAY_RAMP' },
  { id: 'NODE-08', name: 'Kathipara Urban Flyover Gateway Jct', latitude: 13.0067, longitude: 80.2030, intersectionType: '4_WAY' }
];

export const INITIAL_ROAD_EDGES: RoadEdge[] = [
  { id: 'ROAD-101', name: 'Anna Salai Eastbound Arterial', startNodeId: 'NODE-01', endNodeId: 'NODE-02', lengthMeters: 400, speedLimitKmh: 50, lanes: 3, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 48, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-102', name: 'Anna Salai Westbound Arterial', startNodeId: 'NODE-02', endNodeId: 'NODE-01', lengthMeters: 400, speedLimitKmh: 50, lanes: 3, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 46, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-103', name: 'EVR Periyar High Road Corridor', startNodeId: 'NODE-02', endNodeId: 'NODE-03', lengthMeters: 450, speedLimitKmh: 60, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'MODERATE', currentAvgSpeedKmh: 42, trafficWeightMultiplier: 1.25 },
  { id: 'ROAD-104', name: 'Kamarajar Promenade Southbound', startNodeId: 'NODE-02', endNodeId: 'NODE-04', lengthMeters: 380, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 44, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-105', name: 'Kamarajar Promenade Northbound', startNodeId: 'NODE-04', endNodeId: 'NODE-02', lengthMeters: 380, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 43, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-106', name: 'Marina Coastal Highway Link', startNodeId: 'NODE-03', endNodeId: 'NODE-05', lengthMeters: 420, speedLimitKmh: 60, lanes: 3, roadType: 'HIGHWAY', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 58, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-107', name: 'Island Grounds Connector East', startNodeId: 'NODE-04', endNodeId: 'NODE-05', lengthMeters: 390, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 42, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-108', name: 'Egmore Link Arterial North', startNodeId: 'NODE-02', endNodeId: 'NODE-06', lengthMeters: 320, speedLimitKmh: 40, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'MODERATE', currentAvgSpeedKmh: 32, trafficWeightMultiplier: 1.3 },
  { id: 'ROAD-109', name: 'Mount Road - Koyambedu Link', startNodeId: 'NODE-01', endNodeId: 'NODE-07', lengthMeters: 460, speedLimitKmh: 50, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 49, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-110', name: 'Egmore - Kathipara Corridor', startNodeId: 'NODE-06', endNodeId: 'NODE-08', lengthMeters: 380, speedLimitKmh: 50, lanes: 3, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 47, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-111', name: 'Kathipara - Marina Bypass Loop', startNodeId: 'NODE-08', endNodeId: 'NODE-03', lengthMeters: 340, speedLimitKmh: 45, lanes: 2, roadType: 'ARTERIAL', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 44, trafficWeightMultiplier: 1.0 },
  { id: 'ROAD-112', name: 'Koyambedu - Island Express Link', startNodeId: 'NODE-07', endNodeId: 'NODE-04', lengthMeters: 410, speedLimitKmh: 65, lanes: 3, roadType: 'HIGHWAY', currentTrafficState: 'FREE_FLOW', currentAvgSpeedKmh: 62, trafficWeightMultiplier: 1.0 }
];

export const INITIAL_CAMERAS: Camera[] = [
  {
    id: 'CAM-101',
    name: 'CCTV 101 - Anna Salai & Mount Rd',
    locationName: 'Anna Salai Junction (Northbound View)',
    latitude: 13.0827,
    longitude: 80.2707,
    roadSegmentId: 'ROAD-101',
    intersectionId: 'NODE-01',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 90,
      fieldOfViewDegrees: 85,
      mountingHeightMeters: 6.5,
      tiltAngleDegrees: 25,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.101',
    streamUrl: 'rtsp://camera101.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-102',
    name: 'CCTV 102 - Central & EVR Periyar',
    locationName: 'Central Station Junction Point',
    latitude: 13.0836,
    longitude: 80.2755,
    roadSegmentId: 'ROAD-101',
    intersectionId: 'NODE-02',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 90,
      fieldOfViewDegrees: 90,
      mountingHeightMeters: 7.0,
      tiltAngleDegrees: 20,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.102',
    streamUrl: 'rtsp://camera102.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-103',
    name: 'CCTV 103 - Ripon Building Flyover',
    locationName: 'Poonamallee High Rd Flyover (Eastbound)',
    latitude: 13.0818,
    longitude: 80.2780,
    roadSegmentId: 'ROAD-103',
    intersectionId: 'NODE-03',
    status: 'ONLINE',
    fps: 30,
    lanes: 2,
    calibration: {
      orientationDegrees: 80,
      fieldOfViewDegrees: 75,
      mountingHeightMeters: 8.0,
      tiltAngleDegrees: 30,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.103',
    streamUrl: 'rtsp://camera103.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-104',
    name: 'CCTV 104 - Island Grounds Promenade',
    locationName: 'Kamarajar Promenade Intersection',
    latitude: 13.0780,
    longitude: 80.2790,
    roadSegmentId: 'ROAD-104',
    intersectionId: 'NODE-04',
    status: 'ONLINE',
    fps: 30,
    lanes: 2,
    calibration: {
      orientationDegrees: 180,
      fieldOfViewDegrees: 80,
      mountingHeightMeters: 6.0,
      tiltAngleDegrees: 22,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.104',
    streamUrl: 'rtsp://camera104.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-105',
    name: 'CCTV 105 - Marina Beach Coastal',
    locationName: 'Marina Coastal Corridor South',
    latitude: 13.0710,
    longitude: 80.2830,
    roadSegmentId: 'ROAD-106',
    intersectionId: 'NODE-05',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 160,
      fieldOfViewDegrees: 85,
      mountingHeightMeters: 7.5,
      tiltAngleDegrees: 28,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.105',
    streamUrl: 'rtsp://camera105.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-106',
    name: 'CCTV 106 - Egmore Roundabout',
    locationName: 'Gandhi Irwin Circle View East',
    latitude: 13.0790,
    longitude: 80.2610,
    roadSegmentId: 'ROAD-108',
    intersectionId: 'NODE-06',
    status: 'ONLINE',
    fps: 30,
    lanes: 2,
    calibration: {
      orientationDegrees: 0,
      fieldOfViewDegrees: 110,
      mountingHeightMeters: 9.0,
      tiltAngleDegrees: 35,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.106',
    streamUrl: 'rtsp://camera106.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-107',
    name: 'CCTV 107 - Kathipara Flyover Gateway',
    locationName: 'Kathipara Urban Flyover Portal',
    latitude: 13.0067,
    longitude: 80.2030,
    roadSegmentId: 'ROAD-110',
    intersectionId: 'NODE-08',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 45,
      fieldOfViewDegrees: 80,
      mountingHeightMeters: 6.8,
      tiltAngleDegrees: 20,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.107',
    streamUrl: 'rtsp://camera107.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  },
  {
    id: 'CAM-108',
    name: 'CCTV 108 - Koyambedu Express Ramp',
    locationName: 'Koyambedu Expressway Ramp West',
    latitude: 13.0694,
    longitude: 80.1948,
    roadSegmentId: 'ROAD-109',
    intersectionId: 'NODE-07',
    status: 'ONLINE',
    fps: 30,
    lanes: 3,
    calibration: {
      orientationDegrees: 220,
      fieldOfViewDegrees: 85,
      mountingHeightMeters: 7.2,
      tiltAngleDegrees: 25,
      homographyMatrix: [[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]]
    },
    ipAddress: '192.168.10.108',
    streamUrl: 'rtsp://camera108.metro.gov/live/h264',
    lastActive: new Date().toISOString()
  }
];

export const INITIAL_TRANSITION_PROBABILITIES: TransitionProbability[] = [
  { fromCameraId: 'CAM-101', toCameraId: 'CAM-102', probability: 0.68, avgTravelTimeSeconds: 32, stdDevSeconds: 4.5, distanceMeters: 400 },
  { fromCameraId: 'CAM-101', toCameraId: 'CAM-108', probability: 0.24, avgTravelTimeSeconds: 38, stdDevSeconds: 5.0, distanceMeters: 460 },
  { fromCameraId: 'CAM-101', toCameraId: 'CAM-104', probability: 0.08, avgTravelTimeSeconds: 65, stdDevSeconds: 8.0, distanceMeters: 780 },
  
  { fromCameraId: 'CAM-102', toCameraId: 'CAM-103', probability: 0.48, avgTravelTimeSeconds: 36, stdDevSeconds: 4.0, distanceMeters: 450 },
  { fromCameraId: 'CAM-102', toCameraId: 'CAM-104', probability: 0.31, avgTravelTimeSeconds: 31, stdDevSeconds: 3.8, distanceMeters: 380 },
  { fromCameraId: 'CAM-102', toCameraId: 'CAM-106', probability: 0.21, avgTravelTimeSeconds: 29, stdDevSeconds: 3.5, distanceMeters: 320 },

  { fromCameraId: 'CAM-103', toCameraId: 'CAM-105', probability: 0.72, avgTravelTimeSeconds: 34, stdDevSeconds: 4.2, distanceMeters: 420 },
  { fromCameraId: 'CAM-103', toCameraId: 'CAM-107', probability: 0.28, avgTravelTimeSeconds: 28, stdDevSeconds: 3.0, distanceMeters: 340 },

  { fromCameraId: 'CAM-104', toCameraId: 'CAM-105', probability: 0.58, avgTravelTimeSeconds: 33, stdDevSeconds: 4.0, distanceMeters: 390 },
  { fromCameraId: 'CAM-104', toCameraId: 'CAM-108', probability: 0.42, avgTravelTimeSeconds: 35, stdDevSeconds: 4.8, distanceMeters: 410 },

  { fromCameraId: 'CAM-106', toCameraId: 'CAM-107', probability: 0.79, avgTravelTimeSeconds: 30, stdDevSeconds: 3.2, distanceMeters: 380 },
  { fromCameraId: 'CAM-106', toCameraId: 'CAM-102', probability: 0.21, avgTravelTimeSeconds: 32, stdDevSeconds: 4.0, distanceMeters: 320 }
];

export const INITIAL_MODEL_VERSIONS: ModelVersion[] = [
  {
    id: 'MOD-V3.4.1',
    name: 'AegisTrack Spatiotemporal Ensemble Model',
    version: 'v3.4.1-prod',
    architecture: 'XGBoost + Bayesian Transition Graph + Softmax Calibrator',
    trainingDataset: 'Metro-Traffic-Traj-2026-Q2 (2.4M trajectories, 120 camera nodes)',
    trainedAt: '2026-07-15T10:00:00Z',
    deployedAt: '2026-07-20T14:30:00Z',
    status: 'ACTIVE_PRODUCTION',
    metrics: {
      top1Accuracy: 0.714,
      top2Accuracy: 0.892,
      top3Accuracy: 0.965,
      mrr: 0.824,
      brierScore: 0.076,
      ece: 0.018,
      mota: 0.884,
      idf1: 0.891,
      hota: 0.798,
      ocrPlateAccuracy: 0.982,
      reidRank1: 0.924,
      reidRank5: 0.981,
      avgInferenceLatencyMs: 18.5
    },
    calibrationCurve: [
      { confidenceBin: 0.1, observedAccuracy: 0.098 },
      { confidenceBin: 0.3, observedAccuracy: 0.295 },
      { confidenceBin: 0.5, observedAccuracy: 0.504 },
      { confidenceBin: 0.7, observedAccuracy: 0.698 },
      { confidenceBin: 0.9, observedAccuracy: 0.902 }
    ]
  },
  {
    id: 'MOD-V4.0-RC1',
    name: 'Temporal Transformer Graph Net',
    version: 'v4.0.0-canary',
    architecture: 'Spatio-Temporal Graph Neural Network (ST-GNN) + Multi-Head Self-Attention',
    trainingDataset: 'Metro-Traffic-Traj-2026-Full (5.1M trajectories)',
    trainedAt: '2026-08-01T08:00:00Z',
    deployedAt: '2026-08-05T12:00:00Z',
    status: 'CANARY_TESTING',
    metrics: {
      top1Accuracy: 0.742,
      top2Accuracy: 0.915,
      top3Accuracy: 0.978,
      mrr: 0.849,
      brierScore: 0.068,
      ece: 0.015,
      mota: 0.896,
      idf1: 0.908,
      hota: 0.812,
      ocrPlateAccuracy: 0.985,
      reidRank1: 0.938,
      reidRank5: 0.989,
      avgInferenceLatencyMs: 24.2
    },
    calibrationCurve: [
      { confidenceBin: 0.1, observedAccuracy: 0.102 },
      { confidenceBin: 0.3, observedAccuracy: 0.301 },
      { confidenceBin: 0.5, observedAccuracy: 0.498 },
      { confidenceBin: 0.7, observedAccuracy: 0.705 },
      { confidenceBin: 0.9, observedAccuracy: 0.898 }
    ]
  }
];

export const INITIAL_ALERT_RULES: AlertRule[] = [
  {
    id: 'RULE-001',
    name: 'High-Priority Security Watchlist Match',
    description: 'Triggers immediately when a license plate on the active high-level threat watchlist is identified with >85% confidence.',
    ruleType: 'WATCHLIST_PLATE_MATCH',
    severity: 'CRITICAL',
    enabled: true,
    minConfidenceThreshold: 0.85,
    parameters: {
      targetPlates: ['7XYZ982', '8ABC123', '9LMN456', '5DEF789']
    }
  },
  {
    id: 'RULE-002',
    name: 'Port & Government Geofence Boundary Violation',
    description: 'Triggers when an unverified vehicle enters restricted sector boundaries around the government plaza.',
    ruleType: 'GEOFENCE_VIOLATION',
    severity: 'HIGH',
    enabled: true,
    minConfidenceThreshold: 0.80,
    parameters: {
      geofencePolygon: [
        { lat: 37.777, lng: -122.420 },
        { lat: 37.780, lng: -122.420 },
        { lat: 37.780, lng: -122.413 },
        { lat: 37.777, lng: -122.413 }
      ]
    }
  },
  {
    id: 'RULE-003',
    name: 'High-Speed Route Anomaly Detection',
    description: 'Triggers when a vehicle speed exceeds road limit by 35+ km/h across 2 consecutive camera observations.',
    ruleType: 'SPEED_ANOMALY',
    severity: 'MEDIUM',
    enabled: true,
    minConfidenceThreshold: 0.75,
    parameters: {
      maxSpeedKmh: 85
    }
  }
];

const nowISO = new Date().toISOString();
const min5Ago = new Date(Date.now() - 5 * 60 * 1000).toISOString();
const min12Ago = new Date(Date.now() - 12 * 60 * 1000).toISOString();

export const INITIAL_INFRASTRUCTURE_POIS: InfrastructurePOI[] = [
  // Traffic Signals
  { id: 'SIG-01', name: 'Anna Salai & Mount Rd Smart Signal', type: 'traffic_signal', latitude: 13.0827, longitude: 80.2707, status: 'OPTIMIZED', details: 'Adaptive cycle: 65s' },
  { id: 'SIG-02', name: 'Central & EVR Periyar Smart Signal', type: 'traffic_signal', latitude: 13.0836, longitude: 80.2755, status: 'GREEN_WAVE', details: 'Adaptive cycle: 50s' },
  { id: 'SIG-03', name: 'Egmore Roundabout Signal', type: 'traffic_signal', latitude: 13.0790, longitude: 80.2610, status: 'OPTIMIZED', details: 'Dynamic lane metering' },
  { id: 'SIG-04', name: 'Marina Coastal Highway Signal', type: 'traffic_signal', latitude: 13.0710, longitude: 80.2830, status: 'ACTIVE', details: 'Priority transit enabled' },

  // Emergency & Public Safety Infrastructure
  { id: 'POL-01', name: 'Greater Chennai Police Sector 1 HQ', type: 'police_station', latitude: 13.0850, longitude: 80.2720, status: 'OPERATIONAL', details: 'Patrol units active: 6' },
  { id: 'POL-02', name: 'Marina Coastal Traffic Patrol Post', type: 'police_station', latitude: 13.0735, longitude: 80.2825, status: 'OPERATIONAL', details: 'Highway interceptor on stand-by' },
  { id: 'HOS-01', name: 'Rajiv Gandhi Government General Hospital (RGGGH)', type: 'hospital', latitude: 13.0815, longitude: 80.2760, status: 'OPEN_24_7', details: 'Emergency green corridor active' },
  { id: 'HOS-02', name: 'Government Multi Super Speciality Hospital', type: 'hospital', latitude: 13.0760, longitude: 80.2785, status: 'OPEN_24_7', details: 'Ambulance priority access' },
  { id: 'FIR-01', name: 'Tamil Nadu Fire & Rescue Station (Central)', type: 'fire_station', latitude: 13.0840, longitude: 80.2690, status: 'DISPATCH_READY', details: 'Engines available: 4' },
  { id: 'PET-01', name: 'IndianOil EV Green Energy Supercharger', type: 'petrol_station', latitude: 13.0820, longitude: 80.2740, status: 'OPEN', details: '12 DC Fast Chargers + CNG' },
  { id: 'PET-02', name: 'Bharat Petroleum Highway Hub Kathipara', type: 'petrol_station', latitude: 13.0075, longitude: 80.2040, status: 'OPEN', details: 'Commercial diesel + fleet billing' },

  // Key Junctions
  { id: 'JCT-01', name: 'Junction A - Anna Salai Mount Road', type: 'junction', latitude: 13.0827, longitude: 80.2707, status: 'FLOW_NORMAL', details: 'Throughput: 1,420 veh/hr' },
  { id: 'JCT-02', name: 'Junction B - Central Station Jct', type: 'junction', latitude: 13.0836, longitude: 80.2755, status: 'MODERATE_DENSITY', details: 'Throughput: 1,890 veh/hr' },
  { id: 'JCT-03', name: 'Junction C - Ripon Building Flyover', type: 'junction', latitude: 13.0818, longitude: 80.2780, status: 'FLOW_OPTIMAL', details: 'Throughput: 2,100 veh/hr' }
];

export const INITIAL_TRACKS: GlobalVehicleTrack[] = [
  {
    globalTrackId: 'TRACK_V042',
    anonymousVehicleId: 'V-042',
    firstSeenTimestamp: min12Ago,
    lastSeenTimestamp: nowISO,
    status: 'ACTIVE',
    primaryPlateText: 'V-042',
    plateHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    vehicleClass: 'suv',
    vehicleColor: 'Bright White',
    makeModel: 'Toyota Innova Crysta (2024)',
    observationCount: 4,
    camerasTraversed: ['CAM-101', 'CAM-102', 'CAM-103', 'CAM-104'],
    currentCameraId: 'CAM-104',
    currentRoadSegmentId: 'ROAD-103',
    currentLocationEstimate: {
      lat: 13.0818,
      lng: 80.2780,
      roadSegmentName: 'EVR Periyar High Road Corridor',
      speedKmh: 48,
      headingDegrees: 45,
      directionName: 'NE'
    },
    confidenceFusion: {
      appearanceSimilarity: 0.88,
      colorSimilarity: 0.94,
      vehicleTypeSimilarity: 0.97,
      temporalConsistency: 0.91,
      routeConsistency: 0.86,
      combinedScore: 0.91
    },
    scoreDecomposition: {
      plateSimilarity: 0.98,
      appearanceSimilarity: 0.88,
      reidEmbeddingCosine: 0.94,
      colorClassMatch: 0.94,
      colorSimilarity: 0.94,
      vehicleTypeSimilarity: 0.97,
      temporalConsistency: 0.91,
      routeConsistency: 0.86,
      combinedScore: 0.91,
      transitionProbability: 0.72,
      speedTimeFeasibility: 0.95,
      directionCompatibility: 0.92,
      roadConnectivityScore: 0.98,
      finalAssociationScore: 0.94
    },
    recentObservations: [
      { observationId: 'OBS-1001', cameraId: 'CAM-101', cameraName: 'CCTV 101 - Anna Salai', timestamp: min12Ago, timeFormatted: '10:31', anonymousVehicleId: 'V-042', plateText: 'V-042', confidence: 0.96, estimatedSpeedKmh: 47, roadSegmentName: 'Anna Salai West' },
      { observationId: 'OBS-1002', cameraId: 'CAM-102', cameraName: 'CCTV 102 - Central Jct', timestamp: min5Ago, timeFormatted: '10:34', anonymousVehicleId: 'V-042', plateText: 'V-042', confidence: 0.94, estimatedSpeedKmh: 49, roadSegmentName: 'Central Junction' },
      { observationId: 'OBS-1003', cameraId: 'CAM-103', cameraName: 'CCTV 103 - Ripon Flyover', timestamp: nowISO, timeFormatted: '10:37', anonymousVehicleId: 'V-042', plateText: 'V-042', confidence: 0.96, estimatedSpeedKmh: 48, roadSegmentName: 'EVR Periyar Corridor' },
      { observationId: 'OBS-1004', cameraId: 'CAM-104', cameraName: 'CCTV 104 - Island Grounds', timestamp: nowISO, timeFormatted: '10:39', anonymousVehicleId: 'V-042', plateText: 'V-042', confidence: 0.94, estimatedSpeedKmh: 48, roadSegmentName: 'Kamarajar Promenade' }
    ]
  },
  {
    globalTrackId: 'TRACK_V108',
    anonymousVehicleId: 'V-108',
    firstSeenTimestamp: min5Ago,
    lastSeenTimestamp: nowISO,
    status: 'ACTIVE',
    primaryPlateText: 'V-108',
    plateHash: '1f825227e8020625d97f6c367d32573507c800c8f18c504e9089592478f7b76a',
    vehicleClass: 'car',
    vehicleColor: 'Silver Metallic',
    makeModel: 'Hyundai Creta (2023)',
    observationCount: 2,
    camerasTraversed: ['CAM-104', 'CAM-105'],
    currentCameraId: 'CAM-104',
    currentRoadSegmentId: 'ROAD-104',
    currentLocationEstimate: {
      lat: 13.0780,
      lng: 80.2790,
      roadSegmentName: 'Kamarajar Promenade Southbound',
      speedKmh: 44,
      headingDegrees: 180,
      directionName: 'S'
    },
    confidenceFusion: {
      appearanceSimilarity: 0.91,
      colorSimilarity: 0.96,
      vehicleTypeSimilarity: 0.98,
      temporalConsistency: 0.92,
      routeConsistency: 0.89,
      combinedScore: 0.93
    },
    scoreDecomposition: {
      plateSimilarity: 0.95,
      appearanceSimilarity: 0.91,
      reidEmbeddingCosine: 0.92,
      colorClassMatch: 0.96,
      colorSimilarity: 0.96,
      vehicleTypeSimilarity: 0.98,
      temporalConsistency: 0.92,
      routeConsistency: 0.89,
      combinedScore: 0.93,
      transitionProbability: 0.58,
      speedTimeFeasibility: 0.92,
      directionCompatibility: 0.90,
      roadConnectivityScore: 0.95,
      finalAssociationScore: 0.91
    },
    recentObservations: [
      { observationId: 'OBS-2001', cameraId: 'CAM-104', cameraName: 'Camera 04 - Market Corridor', timestamp: nowISO, timeFormatted: '10:36', anonymousVehicleId: 'V-108', plateText: 'V-108', confidence: 0.92, estimatedSpeedKmh: 44, roadSegmentName: 'Market St South' }
    ]
  },
  {
    globalTrackId: 'TRACK_V251',
    anonymousVehicleId: 'V-251',
    firstSeenTimestamp: min12Ago,
    lastSeenTimestamp: nowISO,
    status: 'ACTIVE',
    primaryPlateText: 'V-251',
    plateHash: '6c51880faf2d140e6530687796a5518b2c2865d1d6a66b26802f43be5d8df2e1',
    vehicleClass: 'truck',
    vehicleColor: 'Obsidian Black',
    makeModel: 'Ford F-150 Commercial (2022)',
    observationCount: 3,
    camerasTraversed: ['CAM-102', 'CAM-106', 'CAM-107'],
    currentCameraId: 'CAM-106',
    currentRoadSegmentId: 'ROAD-108',
    currentLocationEstimate: {
      lat: 37.7780,
      lng: -122.4185,
      roadSegmentName: 'Central Plaza Roundabout',
      speedKmh: 32,
      headingDegrees: 0,
      directionName: 'N'
    },
    confidenceFusion: {
      appearanceSimilarity: 0.89,
      colorSimilarity: 0.93,
      vehicleTypeSimilarity: 0.99,
      temporalConsistency: 0.96,
      routeConsistency: 0.94,
      combinedScore: 0.94
    },
    scoreDecomposition: {
      plateSimilarity: 0.97,
      appearanceSimilarity: 0.89,
      reidEmbeddingCosine: 0.91,
      colorClassMatch: 0.93,
      colorSimilarity: 0.93,
      vehicleTypeSimilarity: 0.99,
      temporalConsistency: 0.96,
      routeConsistency: 0.94,
      combinedScore: 0.94,
      transitionProbability: 0.79,
      speedTimeFeasibility: 0.96,
      directionCompatibility: 0.94,
      roadConnectivityScore: 0.99,
      finalAssociationScore: 0.93
    },
    recentObservations: [
      { observationId: 'OBS-3001', cameraId: 'CAM-102', cameraName: 'Camera 02 - Market East', timestamp: min5Ago, timeFormatted: '10:32', anonymousVehicleId: 'V-251', plateText: 'V-251', confidence: 0.91, estimatedSpeedKmh: 35, roadSegmentName: 'Central Arterial' },
      { observationId: 'OBS-3002', cameraId: 'CAM-106', cameraName: 'Camera 06 - Central Plaza', timestamp: nowISO, timeFormatted: '10:38', anonymousVehicleId: 'V-251', plateText: 'V-251', confidence: 0.95, estimatedSpeedKmh: 32, roadSegmentName: 'Plaza Roundabout' }
    ]
  }
];

export const INITIAL_ALERTS: AlertEvent[] = [
  {
    id: 'ALT-9001',
    ruleId: 'RULE-001',
    ruleName: 'High-Priority Security Watchlist Match',
    severity: 'CRITICAL',
    timestamp: nowISO,
    globalTrackId: 'TRACK_00123',
    cameraId: 'CAM-103',
    cameraName: 'CCTV 103 - Grand Flyover East',
    plateText: '7XYZ982',
    locationName: 'Grand Ave Flyover Ramp (Eastbound)',
    confidence: 0.96,
    status: 'NEW',
    reason: 'Vehicle plate 7XYZ982 matches High-Priority Threat Watchlist (Ref #W-8809). Verified across 3 consecutive CCTV cameras.',
    evidenceSummary: 'Multi-camera association confirmed across CAM-101, CAM-102, CAM-103. Re-ID cosine similarity 0.96, plate voting score 0.96.'
  },
  {
    id: 'ALT-9002',
    ruleId: 'RULE-002',
    ruleName: 'Port & Government Geofence Boundary Violation',
    severity: 'HIGH',
    timestamp: min5Ago,
    globalTrackId: 'TRACK_00789',
    cameraId: 'CAM-106',
    cameraName: 'CCTV 106 - Central Plaza Roundabout',
    plateText: '9LMN456',
    locationName: 'Central Plaza Circle View East',
    confidence: 0.91,
    status: 'UNDER_REVIEW',
    reason: 'Commercial truck entered restricted perimeter of Central Plaza Civic Center zone.',
    evidenceSummary: 'Geofence boundary crossover logged at 37.7780, -122.4185. Speed 32 km/h.'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'AUD-5001',
    timestamp: min12Ago,
    userId: 'USR-102',
    userName: 'Officer Elena Rostova',
    userRole: 'OPERATOR',
    action: 'vehicle_search',
    resource: '/api/v1/vehicles/search',
    queryReason: 'Routine active incident patrol tracking for Incident #INC-2026-90',
    ipAddress: '10.240.12.88',
    resultStatus: 'SUCCESS',
    metadataJson: '{"searchedPlateHash":"e3b0c442...","resultsReturned":1}'
  },
  {
    id: 'AUD-5002',
    timestamp: min5Ago,
    userId: 'USR-101',
    userName: 'Command Director Marcus Vance',
    userRole: 'SUPER_ADMIN',
    action: 'alert_acknowledge',
    resource: '/api/v1/alerts/ALT-9001/acknowledge',
    queryReason: 'Dispatching patrol unit to Grand Ave Flyover East',
    ipAddress: '10.240.12.10',
    resultStatus: 'SUCCESS',
    metadataJson: '{"alertId":"ALT-9001","assignedUnit":"UNIT-4"}'
  }
];

// In-memory Database Store
class InMemoryDatabase {
  users = [...INITIAL_USERS];
  cameras = [...INITIAL_CAMERAS];
  roadNodes = [...INITIAL_ROAD_NODES];
  roadEdges = [...INITIAL_ROAD_EDGES];
  transitions = [...INITIAL_TRANSITION_PROBABILITIES];
  modelVersions = [...INITIAL_MODEL_VERSIONS];
  alertRules = [...INITIAL_ALERT_RULES];
  tracks = [...INITIAL_TRACKS];
  infrastructure = [...INITIAL_INFRASTRUCTURE_POIS];
  alerts = [...INITIAL_ALERTS];
  auditLogs = [...INITIAL_AUDIT_LOGS];

  getSystemMetrics(): SystemMetrics {
    return {
      activeCameras: this.cameras.filter((c) => c.status === 'ONLINE').length,
      totalCameras: this.cameras.length,
      fpsIngested: 360, // 12 cameras * 30 fps
      activeTracksCount: this.tracks.filter((t) => t.status === 'ACTIVE').length,
      gpuUtilizationPercentage: 64.2,
      inferenceLatencyMs: 18.5,
      associationLatencyMs: 12.2,
      predictionLatencyMs: 14.8,
      apiLatencyMs: 22.1,
      queuedFrames: 4,
      memoryUsageMb: 1420
    };
  }

  addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }
}

export const db = new InMemoryDatabase();
