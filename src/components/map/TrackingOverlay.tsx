import React from 'react';
import { HistoricalRouteLayer } from './HistoricalRouteLayer';
import { PredictionRouteLayer, PredictedRouteData } from './PredictionRouteLayer';
import { CameraLayer, CameraMarkerData } from './CameraLayer';
import { VehicleLayer, VehicleMarkerData } from './VehicleLayer';
import { AlertLayer, AlertMarkerData } from './AlertLayer';
import { Point2D } from '../../services/map/GeoProjectionService';

interface TrackingOverlayProps {
  historicalRoutePoints: Point2D[];
  predictions: PredictedRouteData[];
  cameras: CameraMarkerData[];
  vehicles: VehicleMarkerData[];
  alerts: AlertMarkerData[];
  onSelectVehicle?: (id: string) => void;
  onSelectCamera?: (id: string) => void;
}

export const TrackingOverlay: React.FC<TrackingOverlayProps> = ({
  historicalRoutePoints,
  predictions,
  cameras,
  vehicles,
  alerts,
  onSelectVehicle,
  onSelectCamera
}) => {
  return (
    <div className="map-overlay absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
      {/* 1. Historical Vehicle Route (Solid Dark Blue Line) */}
      <HistoricalRouteLayer points={historicalRoutePoints} strokeColor="#1E3A8A" strokeWidth={5} />

      {/* 2. AI Predicted Routes (Dashed Lines for Top-3 Predictions) */}
      <PredictionRouteLayer predictions={predictions} />

      {/* 3. Camera Markers */}
      <CameraLayer cameras={cameras} onSelectCamera={onSelectCamera} />

      {/* 4. Alert Markers */}
      <AlertLayer alerts={alerts} />

      {/* 5. Current Vehicle Marker (🚗) */}
      <VehicleLayer vehicles={vehicles} onSelectVehicle={onSelectVehicle} />
    </div>
  );
};
