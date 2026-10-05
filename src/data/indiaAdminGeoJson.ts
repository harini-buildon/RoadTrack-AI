// GeoJSON FeatureCollection for India Administrative States and Metropolitian Transit Corridors
// Tailored for high-precision regional traffic analytics, density mapping, and jurisdiction surveillance.

export interface IndiaAdminRegionProperties {
  id: string;
  name: string;
  code: string;
  category: 'STATE' | 'UNION_TERRITORY' | 'STRATEGIC_CORRIDOR';
  capitalOrHub: string;
  center: [number, number]; // [lng, lat]
  activeCctvCount: number;
  trafficDensityIndex: number; // 0 - 100
  dailyVehicleFlow: number; // e.g. 1.2M
  congestionLevel: 'LOW' | 'MODERATE' | 'HEAVY' | 'CRITICAL';
  emergencyResponseTimeMin: number;
  smartSignalCount: number;
  totalHighwayKms: number;
  incidentHotspots: number;
  airQualityAqi: number;
}

export interface IndiaAdminGeoJSONFeature {
  type: 'Feature';
  id: string;
  properties: IndiaAdminRegionProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface IndiaAdminGeoJSONCollection {
  type: 'FeatureCollection';
  features: IndiaAdminGeoJSONFeature[];
}

export const INDIA_ADMIN_GEOJSON: IndiaAdminGeoJSONCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'TN',
      properties: {
        id: 'TN',
        name: 'Tamil Nadu (Chennai - Vellore Corridor)',
        code: 'TN',
        category: 'STATE',
        capitalOrHub: 'Chennai',
        center: [80.2707, 13.0827],
        activeCctvCount: 1420,
        trafficDensityIndex: 78,
        dailyVehicleFlow: 2450000,
        congestionLevel: 'MODERATE',
        emergencyResponseTimeMin: 6.4,
        smartSignalCount: 310,
        totalHighwayKms: 6820,
        incidentHotspots: 14,
        airQualityAqi: 82
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [79.80, 13.40],
          [80.35, 13.35],
          [80.32, 12.80],
          [79.90, 12.30],
          [79.10, 12.00],
          [78.50, 11.20],
          [77.60, 9.80],
          [77.30, 8.20],
          [77.80, 8.10],
          [78.80, 9.20],
          [79.80, 10.40],
          [80.00, 11.50],
          [80.25, 12.50],
          [80.35, 13.10],
          [79.80, 13.40]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'KA',
      properties: {
        id: 'KA',
        name: 'Karnataka (Bengaluru Tech Corridor & ORR)',
        code: 'KA',
        category: 'STATE',
        capitalOrHub: 'Bengaluru',
        center: [77.5946, 12.9716],
        activeCctvCount: 1850,
        trafficDensityIndex: 88,
        dailyVehicleFlow: 3100000,
        congestionLevel: 'HEAVY',
        emergencyResponseTimeMin: 8.2,
        smartSignalCount: 420,
        totalHighwayKms: 7450,
        incidentHotspots: 22,
        airQualityAqi: 95
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.50, 15.80],
          [75.50, 17.50],
          [77.20, 18.20],
          [77.70, 16.50],
          [77.60, 14.00],
          [78.30, 13.20],
          [77.80, 12.40],
          [76.80, 11.80],
          [75.50, 12.50],
          [74.40, 14.20],
          [74.50, 15.80]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'MH',
      properties: {
        id: 'MH',
        name: 'Maharashtra (Mumbai - Pune Expressway Corridor)',
        code: 'MH',
        category: 'STATE',
        capitalOrHub: 'Mumbai',
        center: [72.8777, 19.0760],
        activeCctvCount: 2640,
        trafficDensityIndex: 92,
        dailyVehicleFlow: 4200000,
        congestionLevel: 'CRITICAL',
        emergencyResponseTimeMin: 7.1,
        smartSignalCount: 580,
        totalHighwayKms: 18200,
        incidentHotspots: 31,
        airQualityAqi: 135
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [72.60, 20.00],
          [74.00, 21.80],
          [76.50, 21.60],
          [79.20, 21.70],
          [80.60, 21.00],
          [80.20, 18.80],
          [77.80, 18.20],
          [75.80, 17.20],
          [73.80, 15.80],
          [73.20, 16.50],
          [72.80, 18.90],
          [72.60, 20.00]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'DL',
      properties: {
        id: 'DL',
        name: 'Delhi National Capital Region (NCR)',
        code: 'DL',
        category: 'UNION_TERRITORY',
        capitalOrHub: 'New Delhi',
        center: [77.1025, 28.7041],
        activeCctvCount: 3200,
        trafficDensityIndex: 95,
        dailyVehicleFlow: 5100000,
        congestionLevel: 'CRITICAL',
        emergencyResponseTimeMin: 5.5,
        smartSignalCount: 710,
        totalHighwayKms: 1480,
        incidentHotspots: 38,
        airQualityAqi: 185
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [76.80, 28.85],
          [77.35, 28.88],
          [77.40, 28.45],
          [76.85, 28.42],
          [76.80, 28.85]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'TS',
      properties: {
        id: 'TS',
        name: 'Telangana (Hyderabad Hitec City & ORR)',
        code: 'TS',
        category: 'STATE',
        capitalOrHub: 'Hyderabad',
        center: [78.4867, 17.3850],
        activeCctvCount: 1620,
        trafficDensityIndex: 72,
        dailyVehicleFlow: 2150000,
        congestionLevel: 'MODERATE',
        emergencyResponseTimeMin: 6.9,
        smartSignalCount: 290,
        totalHighwayKms: 5400,
        incidentHotspots: 11,
        airQualityAqi: 88
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.30, 18.20],
          [78.50, 19.80],
          [79.90, 19.20],
          [81.00, 18.00],
          [80.20, 16.80],
          [78.80, 16.00],
          [77.50, 16.50],
          [77.30, 18.20]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'GJ',
      properties: {
        id: 'GJ',
        name: 'Gujarat (Ahmedabad - GIFT City Express)',
        code: 'GJ',
        category: 'STATE',
        capitalOrHub: 'Gandhinagar',
        center: [72.5714, 23.0225],
        activeCctvCount: 1350,
        trafficDensityIndex: 65,
        dailyVehicleFlow: 1950000,
        congestionLevel: 'LOW',
        emergencyResponseTimeMin: 7.5,
        smartSignalCount: 240,
        totalHighwayKms: 7800,
        incidentHotspots: 9,
        airQualityAqi: 92
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [69.00, 23.50],
          [71.50, 24.50],
          [73.50, 24.20],
          [74.20, 22.00],
          [73.00, 20.50],
          [71.00, 21.00],
          [69.50, 22.00],
          [69.00, 23.50]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'WB',
      properties: {
        id: 'WB',
        name: 'West Bengal (Kolkata - Durgapur Expressway)',
        code: 'WB',
        category: 'STATE',
        capitalOrHub: 'Kolkata',
        center: [88.3639, 22.5726],
        activeCctvCount: 1180,
        trafficDensityIndex: 82,
        dailyVehicleFlow: 1850000,
        congestionLevel: 'HEAVY',
        emergencyResponseTimeMin: 9.1,
        smartSignalCount: 220,
        totalHighwayKms: 5200,
        incidentHotspots: 18,
        airQualityAqi: 142
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [87.00, 27.20],
          [88.80, 27.10],
          [89.80, 26.30],
          [88.20, 24.50],
          [89.00, 22.50],
          [88.00, 21.50],
          [86.50, 22.80],
          [87.00, 27.20]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'UP',
      properties: {
        id: 'UP',
        name: 'Uttar Pradesh (Yamuna & Purvanchal Expressways)',
        code: 'UP',
        category: 'STATE',
        capitalOrHub: 'Lucknow',
        center: [80.9462, 26.8467],
        activeCctvCount: 2150,
        trafficDensityIndex: 86,
        dailyVehicleFlow: 3800000,
        congestionLevel: 'HEAVY',
        emergencyResponseTimeMin: 8.7,
        smartSignalCount: 380,
        totalHighwayKms: 12200,
        incidentHotspots: 27,
        airQualityAqi: 168
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [77.50, 30.00],
          [80.00, 29.50],
          [82.50, 28.50],
          [84.50, 27.50],
          [83.80, 24.50],
          [81.50, 24.00],
          [78.50, 25.00],
          [77.00, 27.80],
          [77.50, 30.00]
        ]]
      }
    },
    {
      type: 'Feature',
      id: 'KL',
      properties: {
        id: 'KL',
        name: 'Kerala (Kochi - Thiruvananthapuram Highway)',
        code: 'KL',
        category: 'STATE',
        capitalOrHub: 'Thiruvananthapuram',
        center: [76.9366, 8.5241],
        activeCctvCount: 890,
        trafficDensityIndex: 70,
        dailyVehicleFlow: 1450000,
        congestionLevel: 'MODERATE',
        emergencyResponseTimeMin: 6.8,
        smartSignalCount: 160,
        totalHighwayKms: 3200,
        incidentHotspots: 7,
        airQualityAqi: 54
      },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [74.90, 12.80],
          [76.00, 11.90],
          [77.20, 10.20],
          [77.40, 8.30],
          [76.80, 8.80],
          [76.00, 9.80],
          [75.20, 11.40],
          [74.90, 12.80]
        ]]
      }
    }
  ]
};

// Strategic Indian Metro Corridor Focus Configs
export interface MetroCorridorConfig {
  id: string;
  name: string;
  city: string;
  stateCode: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  pitch: number;
  bearing: number;
  highlightedHighway: string;
  description: string;
}

export const STRATEGIC_METRO_CORRIDORS: MetroCorridorConfig[] = [
  {
    id: 'chennai',
    name: 'Chennai Central Arterial & Marina Corridor',
    city: 'Chennai',
    stateCode: 'TN',
    center: [80.2707, 13.0827],
    zoom: 13.2,
    pitch: 45,
    bearing: -15,
    highlightedHighway: 'NH-48 / Anna Salai / EVR Periyar Rd',
    description: 'High-density arterial surveillance linking Mount Road, Central, Ripon and Kathipara grade separators.'
  },
  {
    id: 'vellore_arakkonam',
    name: 'Arakkonam – Ranipet – Vellore Industrial Corridor',
    city: 'Vellore / Arakkonam',
    stateCode: 'TN',
    center: [79.6700, 13.0800],
    zoom: 11.5,
    pitch: 35,
    bearing: 10,
    highlightedHighway: 'NH-48 Industrial Freight Link',
    description: 'Key multi-modal freight highway linking Chennai Port with Ranipet industrial cluster.'
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru Silk Board & Outer Ring Road (ORR)',
    city: 'Bengaluru',
    stateCode: 'KA',
    center: [77.5946, 12.9716],
    zoom: 12.8,
    pitch: 50,
    bearing: 25,
    highlightedHighway: 'NH-44 / Outer Ring Road / Hosur Rd',
    description: 'Major technology corridor with dynamic congestion throttling and transit priority systems.'
  },
  {
    id: 'mumbai',
    name: 'Mumbai Western Express Highway & Coastal Road',
    city: 'Mumbai',
    stateCode: 'MH',
    center: [72.8777, 19.0760],
    zoom: 12.5,
    pitch: 55,
    bearing: -20,
    highlightedHighway: 'WEH / Bandra-Worli Sea Link',
    description: 'Heavy coastal urban corridor with automatic license plate recognition & lane enforcement.'
  },
  {
    id: 'delhi_ncr',
    name: 'Delhi Ring Road & Eastern Peripheral Expressway',
    city: 'New Delhi',
    stateCode: 'DL',
    center: [77.1025, 28.7041],
    zoom: 12.0,
    pitch: 40,
    bearing: 0,
    highlightedHighway: 'Ring Road / DND Flyway / NH-44',
    description: 'National capital transit spine with multi-camera trajectory fusion and air quality correlation.'
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad Hitec City & Nehru Outer Ring Road',
    city: 'Hyderabad',
    stateCode: 'TS',
    center: [78.3800, 17.4400],
    zoom: 13.0,
    pitch: 45,
    bearing: 30,
    highlightedHighway: 'ORR / Gachibowli Elevated Corridor',
    description: 'Expressway grid with automated incident detection and dynamic speed regulation.'
  }
];
