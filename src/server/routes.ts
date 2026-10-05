import { Router, Request, Response } from 'express';
import { db } from './db/inMemoryDb';
import { VisionPipeline } from './ai/visionPipeline';
import { AssociationEngine } from './ai/associationEngine';
import { PredictionEngine } from './ai/predictionEngine';
import { AlertEngine } from './ai/../services/alertEngine';
import { ModelEvaluationService } from './services/modelEvaluationService';
import { analyzeRouteWithGemini } from './ai/geminiService';

export const apiRouter = Router();

// Middleware: Standard Security & Audit Context Header
const getAuditContext = (req: Request) => {
  return {
    userId: (req.headers['x-user-id'] as string) || 'USR-102',
    userName: (req.headers['x-user-name'] as string) || 'Officer Elena Rostova',
    userRole: (req.headers['x-user-role'] as any) || 'OPERATOR',
    ipAddress: req.ip || '127.0.0.1'
  };
};

// 1. Health & Metrics
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'HEALTHY',
    service: 'AegisTrack-Core-Backend',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    databaseState: 'CONNECTED_POSTGIS_MOCK'
  });
});

apiRouter.get('/metrics', (req: Request, res: Response) => {
  res.json(db.getSystemMetrics());
});

// 2. Authentication Mock
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email) || db.users[1];

  db.addAuditLog({
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'user_login',
    resource: '/api/v1/auth/login',
    queryReason: 'User authenticated with JWT role token',
    ipAddress: req.ip || '127.0.0.1',
    resultStatus: 'SUCCESS'
  });

  res.json({
    token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${user.id}.${user.role}`,
    user
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const ctx = getAuditContext(req);
  const user = db.users.find((u) => u.id === ctx.userId) || db.users[0];
  res.json(user);
});

// 3. Cameras API
apiRouter.get('/cameras', (req: Request, res: Response) => {
  res.json(db.cameras);
});

apiRouter.get('/cameras/:id', (req: Request, res: Response) => {
  const cam = db.cameras.find((c) => c.id === req.params.id);
  if (!cam) return res.status(404).json({ error: 'Camera not found' });
  res.json(cam);
});

apiRouter.put('/cameras/:id/calibration', (req: Request, res: Response) => {
  const cam = db.cameras.find((c) => c.id === req.params.id);
  if (!cam) return res.status(404).json({ error: 'Camera not found' });

  cam.calibration = { ...cam.calibration, ...req.body };
  const ctx = getAuditContext(req);

  db.addAuditLog({
    userId: ctx.userId,
    userName: ctx.userName,
    userRole: ctx.userRole,
    action: 'camera_calibration_update',
    resource: `/api/v1/cameras/${req.params.id}/calibration`,
    queryReason: 'Updated camera homography matrix & FOV parameters',
    ipAddress: ctx.ipAddress,
    resultStatus: 'SUCCESS'
  });

  res.json(cam);
});

// 4. Vehicle Search (Encrypted / Hashed Plate Query)
apiRouter.post('/vehicles/search', (req: Request, res: Response) => {
  const { plateText, vehicleClass, queryReason } = req.body;
  const ctx = getAuditContext(req);

  if (!queryReason || queryReason.trim().length < 5) {
    db.addAuditLog({
      userId: ctx.userId,
      userName: ctx.userName,
      userRole: ctx.userRole,
      action: 'vehicle_search_denied',
      resource: '/api/v1/vehicles/search',
      queryReason: 'Denied - Insufficient query reason provided',
      ipAddress: ctx.ipAddress,
      resultStatus: 'DENIED'
    });
    return res.status(400).json({ error: 'AUDIT_POLICY_VIOLATION: Valid justification/case reason required for sensitive plate search.' });
  }

  let matches = db.tracks;
  if (plateText) {
    const clean = plateText.toUpperCase().replace(/[^A-Z0-9]/g, '');
    matches = matches.filter((t) =>
      (t.anonymousVehicleId && t.anonymousVehicleId.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(clean)) ||
      (t.primaryPlateText && t.primaryPlateText.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(clean))
    );
  }
  if (vehicleClass) {
    matches = matches.filter((t) => t.vehicleClass === vehicleClass);
  }

  db.addAuditLog({
    userId: ctx.userId,
    userName: ctx.userName,
    userRole: ctx.userRole,
    action: 'vehicle_search',
    resource: '/api/v1/vehicles/search',
    queryReason,
    ipAddress: ctx.ipAddress,
    resultStatus: 'SUCCESS',
    metadataJson: JSON.stringify({ searchedPlate: plateText, matchCount: matches.length })
  });

  res.json(matches);
});

// 4.1 Infrastructure POIs API
apiRouter.get('/infrastructure', (req: Request, res: Response) => {
  res.json(db.infrastructure || []);
});

// 5. Tracks API
apiRouter.get('/tracks', (req: Request, res: Response) => {
  res.json(db.tracks);
});

apiRouter.get('/tracks/:id', (req: Request, res: Response) => {
  const track = db.tracks.find((t) => t.globalTrackId === req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });
  res.json(track);
});

apiRouter.get('/tracks/:id/reid-matrix', (req: Request, res: Response) => {
  const track = db.tracks.find((t) => t.globalTrackId === req.params.id);
  if (!track) return res.status(404).json({ error: 'Track not found' });

  // Generate Re-ID similarity breakdown matrix across traversed cameras
  const matrix = track.camerasTraversed.map((camId) => {
    const cam = db.cameras.find((c) => c.id === camId);
    return {
      cameraId: camId,
      cameraName: cam ? cam.name : camId,
      cosineSimilarity: parseFloat((0.92 + Math.random() * 0.07).toFixed(3)),
      plateMatchRatio: 0.98,
      temporalVotingScore: 0.96
    };
  });

  res.json({
    globalTrackId: track.globalTrackId,
    primaryPlate: track.primaryPlateText,
    scoreDecomposition: track.scoreDecomposition,
    reidMatrix: matrix
  });
});

// 6. Road Graph Network API
apiRouter.get('/graph', (req: Request, res: Response) => {
  res.json({
    nodes: db.roadNodes,
    edges: db.roadEdges,
    transitionMatrix: db.transitions
  });
});

// 7. Prediction Engine API
apiRouter.get('/predictions/:trackId', (req: Request, res: Response) => {
  const trackId = req.params.trackId;
  const prediction = PredictionEngine.predictNextLocations(trackId);
  res.json(prediction);
});

// 8. Alerts API
apiRouter.get('/alerts', (req: Request, res: Response) => {
  res.json(db.alerts);
});

apiRouter.post('/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const alert = db.alerts.find((a) => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  const ctx = getAuditContext(req);
  alert.status = 'CONFIRMED';
  alert.reviewedBy = ctx.userName;
  alert.reviewedAt = new Date().toISOString();

  db.addAuditLog({
    userId: ctx.userId,
    userName: ctx.userName,
    userRole: ctx.userRole,
    action: 'alert_acknowledge',
    resource: `/api/v1/alerts/${req.params.id}/acknowledge`,
    queryReason: `Acknowledged security alert ${req.params.id}`,
    ipAddress: ctx.ipAddress,
    resultStatus: 'SUCCESS'
  });

  res.json(alert);
});

// 9. Audit Logs API
apiRouter.get('/audit-logs', (req: Request, res: Response) => {
  const ctx = getAuditContext(req);
  if (ctx.userRole !== 'SUPER_ADMIN' && ctx.userRole !== 'AUDITOR' && ctx.userRole !== 'SECURITY_ADMIN') {
    return res.status(403).json({ error: 'PERMISSIONS_DENIED: Audit logs require AUDITOR or SUPER_ADMIN role.' });
  }
  res.json(db.auditLogs);
});

// 10. AI Models & Benchmarks API
apiRouter.get('/models', (req: Request, res: Response) => {
  res.json(ModelEvaluationService.getActiveModelInfo());
});

apiRouter.post('/models/:id/activate', (req: Request, res: Response) => {
  const ctx = getAuditContext(req);
  if (ctx.userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'PERMISSIONS_DENIED: Model deployment requires SUPER_ADMIN role.' });
  }
  const updated = ModelEvaluationService.setActiveModel(req.params.id, ctx.userId, ctx.userName);
  res.json(updated);
});

// 11. Live Simulation Step Trigger
apiRouter.post('/simulation/tick', (req: Request, res: Response) => {
  // Move vehicles forward along road network
  const plates = ['7XYZ982', '8ABC123', '9LMN456', '5DEF789', '2JKL345'];
  const classes: ('car' | 'suv' | 'truck')[] = ['car', 'suv', 'truck'];
  const randomPlate = plates[Math.floor(Math.random() * plates.length)];
  const randomCam = db.cameras[Math.floor(Math.random() * db.cameras.length)];

  const obs = VisionPipeline.processFrameObservation(
    randomCam.id,
    randomCam.name,
    randomCam.roadSegmentId,
    randomCam.latitude,
    randomCam.longitude,
    randomPlate,
    classes[Math.floor(Math.random() * classes.length)],
    'Obsidian Black',
    Math.floor(40 + Math.random() * 25),
    'NORTH_EAST'
  );

  const { bestTrack, scoreDecomposition } = AssociationEngine.associateObservationToTracks(
    obs,
    db.tracks
  );

  let updatedTrack: typeof db.tracks[0];
  if (bestTrack) {
    bestTrack.lastSeenTimestamp = obs.timestamp;
    bestTrack.currentCameraId = obs.cameraId;
    bestTrack.currentRoadSegmentId = obs.roadSegmentId;
    bestTrack.observationCount += 1;
    bestTrack.currentLocationEstimate = {
      lat: obs.gpsEstimate.lat,
      lng: obs.gpsEstimate.lng,
      roadSegmentName: obs.cameraName,
      speedKmh: obs.estimatedSpeedKmh,
      headingDegrees: 90
    };
    bestTrack.scoreDecomposition = scoreDecomposition;
    bestTrack.recentObservations.unshift({
      observationId: obs.id,
      cameraId: obs.cameraId,
      timestamp: obs.timestamp,
      plateText: obs.plateText,
      confidence: obs.plateConfidence,
      estimatedSpeedKmh: obs.estimatedSpeedKmh
    });
    if (!bestTrack.camerasTraversed.includes(obs.cameraId)) {
      bestTrack.camerasTraversed.push(obs.cameraId);
    }
    updatedTrack = bestTrack;
  } else {
    updatedTrack = {
      globalTrackId: `TRACK_${Math.floor(10000 + Math.random() * 90000)}`,
      anonymousVehicleId: obs.anonymousVehicleId || `V-0${Math.floor(10 + Math.random() * 89)}`,
      firstSeenTimestamp: obs.timestamp,
      lastSeenTimestamp: obs.timestamp,
      status: 'ACTIVE',
      primaryPlateText: obs.anonymousVehicleId || obs.plateText || 'V-042',
      plateHash: 'a7c823f990182813...',
      vehicleClass: obs.vehicleClass,
      vehicleColor: obs.vehicleColor,
      makeModel: 'Tracked Transit Vehicle',
      observationCount: 1,
      camerasTraversed: [obs.cameraId],
      currentCameraId: obs.cameraId,
      currentRoadSegmentId: obs.roadSegmentId,
      currentLocationEstimate: {
        lat: obs.gpsEstimate.lat,
        lng: obs.gpsEstimate.lng,
        roadSegmentName: obs.cameraName,
        speedKmh: obs.estimatedSpeedKmh,
        headingDegrees: 90
      },
      confidenceFusion: {
        appearanceSimilarity: scoreDecomposition.appearanceSimilarity || 0.88,
        colorSimilarity: scoreDecomposition.colorSimilarity || 0.94,
        vehicleTypeSimilarity: scoreDecomposition.vehicleTypeSimilarity || 0.97,
        temporalConsistency: scoreDecomposition.temporalConsistency || 0.91,
        routeConsistency: scoreDecomposition.routeConsistency || 0.86,
        combinedScore: scoreDecomposition.combinedScore || 0.91
      },
      scoreDecomposition: scoreDecomposition,
      recentObservations: [
        {
          observationId: obs.id,
          cameraId: obs.cameraId,
          cameraName: obs.cameraName,
          timestamp: obs.timestamp,
          anonymousVehicleId: obs.anonymousVehicleId,
          plateText: obs.anonymousVehicleId || obs.plateText,
          confidence: obs.plateConfidence || 0.94,
          estimatedSpeedKmh: obs.estimatedSpeedKmh
        }
      ]
    };
    db.tracks.unshift(updatedTrack);
  }

  // Evaluate alerts
  const triggered = AlertEngine.evaluateRulesForObservation(obs, updatedTrack);

  res.json({
    simulationStatus: 'TICK_PROCESSED',
    newObservation: obs,
    associatedTrack: updatedTrack,
    triggeredAlertsCount: triggered.length
  });
});

// 12. Gemini AI Route Analysis Endpoint
apiRouter.post('/gemini/analyze-route', async (req: Request, res: Response) => {
  try {
    const analysis = await analyzeRouteWithGemini(req.body);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Gemini route analysis failed' });
  }
});

