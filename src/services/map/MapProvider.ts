export interface RegionBounds {
  region: string;
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapProviderConfig {
  id: string;
  name: string;
  embedUrl: string;
  defaultRegion: string;
  bounds: Record<string, RegionBounds>;
}

export interface MapProvider {
  getId(): string;
  getName(): string;
  getEmbedUrl(region?: string): string;
  getBounds(region?: string): RegionBounds;
}

export const TAMIL_NADU_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3814510.862752918!2d75.6474290108739!3d10.809932281385468!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0x559475cc463361f0!2sTamil%20Nadu!5e1!3m2!1sen!2sin!4v1786434044504!5m2!1sen!2sin';

export const REGION_BOUNDS: Record<string, RegionBounds> = {
  'Tamil Nadu': {
    region: 'Tamil Nadu',
    north: 13.6,
    south: 8.0,
    west: 76.0,
    east: 80.4
  },
  'Kerala': {
    region: 'Kerala',
    north: 12.8,
    south: 8.2,
    west: 74.8,
    east: 77.5
  },
  'Delhi': {
    region: 'Delhi',
    north: 28.9,
    south: 28.4,
    west: 76.8,
    east: 77.4
  },
  'Maharashtra': {
    region: 'Maharashtra',
    north: 22.0,
    south: 15.6,
    west: 72.6,
    east: 80.9
  }
};

export class GoogleEmbedMapProvider implements MapProvider {
  private config: MapProviderConfig;

  constructor() {
    this.config = {
      id: 'google-embed-tn',
      name: 'Google Maps Tamil Nadu Geographic Embed',
      embedUrl: TAMIL_NADU_EMBED_URL,
      defaultRegion: 'Tamil Nadu',
      bounds: REGION_BOUNDS
    };
  }

  getId(): string {
    return this.config.id;
  }

  getName(): string {
    return this.config.name;
  }

  getEmbedUrl(region: string = 'Tamil Nadu'): string {
    // Return custom region embed if defined, otherwise Tamil Nadu embed
    if (region === 'Tamil Nadu' || !region) {
      return TAMIL_NADU_EMBED_URL;
    }
    // Fallback embed centered around India/region
    return TAMIL_NADU_EMBED_URL;
  }

  getBounds(region: string = 'Tamil Nadu'): RegionBounds {
    return this.config.bounds[region] || this.config.bounds['Tamil Nadu'];
  }
}

export const defaultMapProvider = new GoogleEmbedMapProvider();
