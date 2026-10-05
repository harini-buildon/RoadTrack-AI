import { RegionBounds, REGION_BOUNDS } from './MapProvider';

export interface Point2D {
  x: number; // Percentage 0 - 100
  y: number; // Percentage 0 - 100
}

export interface LatLng {
  lat: number;
  lng: number;
}

export class GeoProjectionService {
  private bounds: RegionBounds;

  constructor(region: string = 'Tamil Nadu') {
    this.bounds = REGION_BOUNDS[region] || REGION_BOUNDS['Tamil Nadu'];
  }

  public setRegion(region: string) {
    this.bounds = REGION_BOUNDS[region] || REGION_BOUNDS['Tamil Nadu'];
  }

  /**
   * Projects (lat, lng) to (x%, y%) coordinates within 0-100 screen range
   */
  public project(lat: number, lng: number): Point2D {
    const { north, south, east, west } = this.bounds;

    // Clamp coordinates to bounds
    const clampedLat = Math.max(south, Math.min(north, lat));
    const clampedLng = Math.max(west, Math.min(east, lng));

    // Linear mapping
    const x = ((clampedLng - west) / (east - west)) * 100;
    // Latitude decreases as Y increases on screen
    const y = ((north - clampedLat) / (north - south)) * 100;

    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3))
    };
  }

  /**
   * Static projection to percentage given bounding box
   */
  public static projectToPercent(
    lat: number,
    lng: number,
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
  ): Point2D {
    const clampedLat = Math.max(bounds.minLat, Math.min(bounds.maxLat, lat));
    const clampedLng = Math.max(bounds.minLng, Math.min(bounds.maxLng, lng));

    const x = ((clampedLng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    const y = ((bounds.maxLat - clampedLat) / (bounds.maxLat - bounds.minLat)) * 100;

    return {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3))
    };
  }

  /**
   * Inverse projection from screen percentages back to approximate lat/lng
   */
  public unproject(xPct: number, yPct: number): LatLng {
    const { north, south, east, west } = this.bounds;

    const lng = west + (xPct / 100) * (east - west);
    const lat = north - (yPct / 100) * (north - south);

    return {
      lat: Number(lat.toFixed(5)),
      lng: Number(lng.toFixed(5))
    };
  }
}

export const geoProjection = new GeoProjectionService('Tamil Nadu');
