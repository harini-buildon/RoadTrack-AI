import { RoadNode, RoadEdge } from '../../types';
import { db } from '../db/inMemoryDb';

export class RoadGraphEngine {
  /**
   * Find outgoing connected road segments from a given road edge
   */
  static getOutgoingEdges(currentRoadEdgeId: string): RoadEdge[] {
    const currentEdge = db.roadEdges.find((e) => e.id === currentRoadEdgeId);
    if (!currentEdge) return [];

    // All edges whose startNodeId matches the endNodeId of currentEdge
    return db.roadEdges.filter((e) => e.startNodeId === currentEdge.endNodeId);
  }

  /**
   * Get target intersection (node) for a road edge
   */
  static getNextIntersection(roadEdgeId: string): RoadNode | null {
    const edge = db.roadEdges.find((e) => e.id === roadEdgeId);
    if (!edge) return null;
    return db.roadNodes.find((n) => n.id === edge.endNodeId) || null;
  }

  /**
   * Calculate travel time in seconds considering speed limit, length, and traffic state
   */
  static calculateTravelTimeSeconds(edge: RoadEdge, currentVehicleSpeedKmh: number): number {
    const effectiveSpeedKmh = Math.min(
      edge.speedLimitKmh,
      Math.max(15, (currentVehicleSpeedKmh + edge.currentAvgSpeedKmh) / 2)
    );
    const speedMetersPerSec = (effectiveSpeedKmh * 1000) / 3600;
    const baseTime = edge.lengthMeters / speedMetersPerSec;
    return Math.round(baseTime * edge.trafficWeightMultiplier);
  }
}
