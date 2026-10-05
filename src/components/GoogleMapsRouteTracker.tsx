import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Sparkles,
  Bot,
  ShieldCheck,
  Clock,
  Send,
  RotateCcw,
  Key,
  Layers,
  Info,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Building2,
  Car
} from 'lucide-react';

interface GoogleMapsRouteTrackerProps {
  isEcoTheme?: boolean;
  selectedVehicleId?: string | null;
  onSelectVehicle?: (id: string) => void;
}

// Google Maps Polyline component helper
function CustomGooglePolyline({
  path,
  strokeColor,
  strokeOpacity = 0.9,
  strokeWeight = 5,
  isDashed = false
}: {
  path: { lat: number; lng: number }[];
  strokeColor: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  isDashed?: boolean;
}) {
  const map = useMap();
  const mapsLib = useMapsLibrary('maps');
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || !mapsLib || !path || path.length === 0) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const options: google.maps.PolylineOptions = {
      path,
      strokeColor,
      strokeOpacity,
      strokeWeight,
      geodesic: true
    };

    if (isDashed) {
      options.icons = [
        {
          icon: {
            path: 'M 0,-1 0,1',
            strokeOpacity: 1,
            scale: 3.5,
            strokeColor: strokeColor
          },
          offset: '0',
          repeat: '15px'
        }
      ];
      options.strokeOpacity = 0;
    }

    const polyline = new mapsLib.Polyline(options);
    polyline.setMap(map);
    polylineRef.current = polyline;

    return () => {
      polyline.setMap(null);
    };
  }, [map, mapsLib, path, strokeColor, strokeOpacity, strokeWeight, isDashed]);

  return null;
}

export const GoogleMapsRouteTracker: React.FC<GoogleMapsRouteTrackerProps> = ({
  isEcoTheme = true,
  selectedVehicleId,
  onSelectVehicle
}) => {
  // API Key detection
  const envKey =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';

  const [customKey, setCustomKey] = useState<string>('');
  const [activeApiKey, setActiveApiKey] = useState<string>(envKey);
  const [showKeyInput, setShowKeyInput] = useState<boolean>(!envKey);

  useEffect(() => {
    if (envKey) {
      setActiveApiKey(envKey);
      setShowKeyInput(false);
    }
  }, [envKey]);

  const hasValidKey = Boolean(activeApiKey) && activeApiKey !== 'YOUR_API_KEY';

  // Map state
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');
  const [trackingMode, setTrackingMode] = useState<'MAN' | 'VEHICLE'>('MAN');

  // Center around Guruvarajapet / Ramdev Hardware (Tamil Nadu)
  const [center, setCenter] = useState({ lat: 13.1328, lng: 79.6101 });
  const [zoom, setZoom] = useState(14);

  // Locations matching user screenshot
  const destination = {
    id: 'DEST_01',
    name: 'Ramdev Hardware, Guruvarajapet',
    tamilName: 'ராమ్‌தேவ் ஹார்ட்வேர், குருவராஜப்பேட்டை',
    lat: 13.1340,
    lng: 79.6125
  };

  // Moving person/vehicle position
  const [manPosition, setManPosition] = useState({ lat: 13.1310, lng: 79.5990 });
  const [isSimulatingMovement, setIsSimulatingMovement] = useState<boolean>(true);

  // Nearby landmarks from screenshot
  const landmarks = [
    { id: 'L1', name: 'Gokula Gaushala', tamilName: 'கோகுல கோசாலா', lat: 13.1315, lng: 79.6010 },
    { id: 'L2', name: 'Gedarikuppam', tamilName: 'கேடரிகுப்பம்', lat: 13.1280, lng: 79.5890 },
    { id: 'L3', name: 'Chinnakadambur', tamilName: 'சின்ன கடம்பூர்', lat: 13.1410, lng: 79.6080 },
    { id: 'L4', name: 'Periakadambur', tamilName: 'பெரியகடம்பூர்', lat: 13.1510, lng: 79.6130 },
    { id: 'L5', name: 'Soganur', tamilName: 'சோகனூர்', lat: 13.1190, lng: 79.6050 },
    { id: 'L6', name: 'Chithambadi', tamilName: 'சித்தம்பாடி', lat: 13.1180, lng: 79.6180 },
    { id: 'L7', name: 'Paravathur', tamilName: 'பரவத்தூர்', lat: 13.1350, lng: 79.5680 },
    { id: 'L8', name: 'Akkachikuppam', tamilName: 'அக்கச்சிக்குப்பம்', lat: 13.1460, lng: 79.5820 }
  ];

  // Route paths
  // Solid dark blue = Route moved (Past)
  const [routeMoved, setRouteMoved] = useState([
    { lat: 13.1350, lng: 79.5680 },
    { lat: 13.1310, lng: 79.5800 },
    { lat: 13.1280, lng: 79.5890 },
    { lat: 13.1315, lng: 79.6010 },
    { lat: 13.1310, lng: 79.5990 }
  ]);

  // Dashed dark blue = Route going to move next (Future)
  const routeToMove = [
    manPosition,
    { lat: 13.1325, lng: 79.6080 },
    { lat: 13.1335, lng: 79.6105 },
    { lat: 13.1340, lng: 79.6125 }
  ];

  // Gemini AI state
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [aiResponseHistory, setAiResponseHistory] = useState<
    { role: 'user' | 'gemini'; text: string; time: string }[]
  >([]);

  // Simulation effect moving man towards destination
  useEffect(() => {
    if (!isSimulatingMovement) return;
    const interval = setInterval(() => {
      setManPosition((prev) => {
        const destLat = destination.lat;
        const destLng = destination.lng;
        const deltaLat = (destLat - prev.lat) * 0.05;
        const deltaLng = (destLng - prev.lng) * 0.05;

        // If very close to target, reset to starting point for continuous demo loop
        if (Math.abs(destLat - prev.lat) < 0.0003 && Math.abs(destLng - prev.lng) < 0.0003) {
          setRouteMoved([
            { lat: 13.1350, lng: 79.5680 },
            { lat: 13.1310, lng: 79.5800 },
            { lat: 13.1280, lng: 79.5890 },
            { lat: 13.1315, lng: 79.6010 }
          ]);
          return { lat: 13.1280, lng: 79.5890 };
        }

        const newPos = { lat: prev.lat + deltaLat, lng: prev.lng + deltaLng };
        setRouteMoved((past) => [...past, newPos]);
        return newPos;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isSimulatingMovement]);

  // Request Gemini AI Analysis
  const handleRunGeminiAnalysis = async (customQuestion?: string) => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/v1/gemini/analyze-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personOrVehicleName: trackingMode === 'MAN' ? 'Person / Man' : 'Vehicle #7XYZ982',
          currentLocationName: 'Near Gokula Gaushala / Gedarikuppam Road',
          destinationName: destination.name,
          distanceTraveledKm: 3.4,
          remainingDistanceKm: 1.2,
          averageSpeedKmh: trackingMode === 'MAN' ? 5 : 35,
          pastPathPoints: routeMoved,
          predictedPathPoints: routeToMove,
          userQuery: customQuestion || userPrompt
        })
      });

      const data = await res.json();
      setAiAnalysis(data);

      if (customQuestion || userPrompt) {
        const qText = customQuestion || userPrompt;
        setAiResponseHistory((prev) => [
          ...prev,
          { role: 'user', text: qText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
          {
            role: 'gemini',
            text: data.summary + (data.bilingualNotice ? `\n(${data.bilingualNotice})` : ''),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setUserPrompt('');
      }
    } catch (err) {
      console.error('Gemini call failed:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Run initial AI analysis on mount
  useEffect(() => {
    handleRunGeminiAnalysis();
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch((err) => {
          console.error('Fullscreen request failed:', err);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err) => {
          console.error('Exit fullscreen failed:', err);
        });
      }
    }
  };

  const handleApplyKey = () => {
    if (customKey.trim()) {
      setActiveApiKey(customKey.trim());
      setShowKeyInput(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full rounded-2xl overflow-hidden border shadow-2xl flex flex-col ${
        isEcoTheme ? 'bg-[#E8F7EF] border-[#DDEBE4] text-[#16322A]' : 'bg-slate-950 border-slate-800 text-slate-100'
      }`}
    >
      {/* Top Banner Control Bar */}
      <div className="px-4 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 z-30 font-mono">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>GOOGLE MAPS ROUTE TRACKER</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Target: <span className="text-red-600 dark:text-red-400 font-extrabold">{destination.name}</span></span>
          </div>
        </div>

        {/* Tracking Mode & Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setTrackingMode('MAN')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                trackingMode === 'MAN'
                  ? 'bg-amber-500 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Man Moving</span>
            </button>
            <button
              onClick={() => setTrackingMode('VEHICLE')}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                trackingMode === 'VEHICLE'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Vehicle Track</span>
            </button>
          </div>

          <button
            onClick={() => setIsSimulatingMovement(!isSimulatingMovement)}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
              isSimulatingMovement
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSimulatingMovement ? 'animate-spin' : ''}`} />
            <span>{isSimulatingMovement ? 'Simulating Live Move' : 'Paused'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 shadow-sm ${
              isFullscreen
                ? 'bg-purple-600 text-white border-purple-500 animate-pulse'
                : 'bg-indigo-600 text-white border-indigo-500 hover:bg-indigo-700'
            }`}
            title="Toggle Browser Fullscreen Mode for Large-Screen Monitoring Deployment"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}</span>
          </button>

          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            className={`px-3 py-1.5 rounded-xl font-bold border text-xs flex items-center gap-1.5 transition-colors ${
              hasValidKey
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasValidKey ? 'GMP API Key Active' : 'Setup Google Maps Key'}</span>
          </button>
        </div>
      </div>

      {/* Optional API Key Config Modal / Banner */}
      {showKeyInput && (
        <div className="px-4 py-3 bg-gradient-to-r from-blue-900/90 to-indigo-950/90 text-white border-b border-blue-700 z-30 font-mono text-xs flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 max-w-xl">
            <Key className="w-5 h-5 text-yellow-400 flex-shrink-0 animate-bounce" />
            <div>
              <div className="font-bold text-amber-300">Google Maps Platform Key Setup</div>
              <div className="text-[11px] text-blue-100">
                To load live Google Maps tiles, enter your key or set <code className="bg-black/40 px-1 py-0.5 rounded text-amber-300">GOOGLE_MAPS_PLATFORM_KEY</code> in Settings &rarr; Secrets.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="Paste Google Maps API Key..."
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-cyan-400 w-64 text-xs"
            />
            <button
              onClick={handleApplyKey}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
            >
              Apply Key
            </button>
            <button
              onClick={() => setShowKeyInput(false)}
              className="px-2 py-1.5 text-slate-300 hover:text-white underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Map Rendering Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[500px]">
        {hasValidKey ? (
          /* Live Google Maps Integration via @vis.gl/react-google-maps */
          <APIProvider apiKey={activeApiKey} version="weekly">
            <Map
              defaultCenter={center}
              defaultZoom={zoom}
              mapTypeId={mapType}
              mapId="DEMO_MAP_ID"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
            >
              {/* Solid Dark Blue Route Line (Route Moved) */}
              <CustomGooglePolyline
                path={routeMoved}
                strokeColor="#1E3A8A" // Dark Blue
                strokeOpacity={0.95}
                strokeWeight={6}
                isDashed={false}
              />

              {/* Dashed Dark Blue Route Line (Route Going To Move Next) */}
              <CustomGooglePolyline
                path={routeToMove}
                strokeColor="#1d4ed8" // Vibrant Dark Blue
                strokeOpacity={1.0}
                strokeWeight={6}
                isDashed={true}
              />

              {/* Red Target Destination Pin (Ramdev Hardware, Guruvarajapet) */}
              <AdvancedMarker position={destination}>
                <div className="flex flex-col items-center group cursor-pointer">
                  {/* Styled Google Maps Red Pin Callout Card */}
                  <div className="px-3 py-1.5 bg-white text-slate-900 font-sans font-bold text-xs rounded-xl shadow-2xl border-2 border-red-600 flex flex-col items-center animate-bounce mb-1">
                    <span className="text-red-600 text-xs font-black flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 fill-red-600 text-white" />
                      {destination.name}
                    </span>
                    <span className="text-[10px] text-slate-600 font-semibold">{destination.tamilName}</span>
                  </div>

                  {/* Red Drop Pin Icon */}
                  <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white shadow-xl flex items-center justify-center text-white font-extrabold">
                    ★
                  </div>
                </div>
              </AdvancedMarker>

              {/* Moving Person / Vehicle Marker */}
              <AdvancedMarker position={manPosition}>
                <div className="flex flex-col items-center cursor-pointer group">
                  <div className="px-2.5 py-1 bg-amber-500 text-slate-950 font-mono font-bold text-[11px] rounded-lg shadow-xl border border-amber-300 flex items-center gap-1 mb-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    <span>{trackingMode === 'MAN' ? 'MAN / PERSON MOVING' : 'VEHICLE #7XYZ982'}</span>
                  </div>

                  <div className="relative w-10 h-10 rounded-full bg-amber-400 border-2 border-white shadow-2xl flex items-center justify-center text-slate-950 font-black animate-pulse">
                    {trackingMode === 'MAN' ? (
                      <Navigation className="w-6 h-6 transform rotate-45 text-slate-900" />
                    ) : (
                      <Car className="w-6 h-6 text-slate-900" />
                    )}
                  </div>
                </div>
              </AdvancedMarker>

              {/* Nearby Tamil Nadu Landmarks from user screenshot */}
              {landmarks.map((lm) => (
                <AdvancedMarker key={lm.id} position={{ lat: lm.lat, lng: lm.lng }}>
                  <div className="px-2 py-0.5 bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-semibold rounded border border-slate-300 dark:border-slate-700 shadow flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-cyan-600" />
                    <span>{lm.name}</span>
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </APIProvider>
        ) : (
          /* High-Fidelity Google Maps Canvas Fallback matching screenshot layout */
          <div className="relative w-full h-full bg-[#e5e3df] overflow-hidden select-none">
            {/* Styled Map Background Grid resembling Google Maps */}
            <svg className="w-full h-full">
              <defs>
                <pattern id="gmap-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#d6d2cb" strokeWidth="1" />
                </pattern>
              </defs>

              <rect width="100%" height="100%" fill="#e5e3df" />
              <rect width="100%" height="100%" fill="url(#gmap-grid)" />

              {/* Green Terrain / Gaushala Area */}
              <polygon points="300,180 480,160 520,320 320,340" fill="#d8e8d8" stroke="#c0d8c0" strokeWidth="1" />
              <text x="360" y="240" fill="#2d6a4f" fontSize="14" fontWeight="bold" fontFamily="sans-serif">
                Gokula Gaushala 🕉
              </text>

              {/* Light Cyan Secondary Roads matching screenshot */}
              <path d="M 50 120 C 150 200, 250 100, 380 180" fill="none" stroke="#70d6ff" strokeWidth="5" />
              <path d="M 120 400 C 220 280, 320 380, 480 320" fill="none" stroke="#70d6ff" strokeWidth="5" />
              <path d="M 480 100 L 520 280 L 680 250 L 750 420" fill="none" stroke="#70d6ff" strokeWidth="5" />

              {/* SOLID DARK BLUE ROUTE LINE: Route Moved (Past Trajectory) */}
              <path
                d="M 120 300 L 220 260 L 320 310 L 450 280 L 510 320"
                fill="none"
                stroke="#1E3A8A" // Dark Blue
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* DASHED DARK BLUE ROUTE LINE: Route Going To Move Next (Future Trajectory) */}
              <path
                d="M 510 320 L 580 310 L 680 290 L 720 280"
                fill="none"
                stroke="#1d4ed8" // Vibrant Dark Blue
                strokeWidth="7"
                strokeDasharray="10,6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-pulse"
              />

              {/* Landmark Text Labels (Matching user screenshot Tamil + English) */}
              <text x="80" y="140" fill="#334155" fontSize="13" fontWeight="bold">Paravathur / பரவத்தூர்</text>
              <text x="180" y="90" fill="#334155" fontSize="13" fontWeight="bold">Akkachikuppam / அக்கச்சிக்குப்பம்</text>
              <text x="240" y="340" fill="#334155" fontSize="13" fontWeight="bold">Gedarikuppam / கேடரிகுப்பம்</text>
              <text x="560" y="110" fill="#334155" fontSize="13" fontWeight="bold">Chinnakadambur / சின்ன கடம்பூர்</text>
              <text x="640" y="60" fill="#334155" fontSize="13" fontWeight="bold">Periakadambur / பெரியகடம்பூர்</text>
              <text x="520" y="420" fill="#334155" fontSize="13" fontWeight="bold">Soganur / சோகனூர்</text>
              <text x="680" y="420" fill="#334155" fontSize="13" fontWeight="bold">Chithambadi / சித்தம்பாடி</text>
            </svg>

            {/* Simulated Moving Man/Vehicle Marker on Canvas */}
            <div
              className="absolute transition-all duration-1000 ease-linear transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
              style={{ top: '320px', left: '510px' }}
            >
              <div className="flex flex-col items-center group">
                <div className="px-2.5 py-1 bg-amber-400 text-slate-950 font-mono font-bold text-[11px] rounded-lg shadow-xl border border-amber-200 flex items-center gap-1 mb-1 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping"></span>
                  <span>{trackingMode === 'MAN' ? 'MAN MOVING' : 'VEHICLE #7XYZ982'}</span>
                </div>

                <div className="relative w-11 h-11 rounded-full bg-amber-400 border-2 border-white shadow-2xl flex items-center justify-center text-slate-900 font-extrabold animate-bounce">
                  <Navigation className="w-6 h-6 transform rotate-45 text-slate-950" />
                </div>
              </div>
            </div>

            {/* Simulated Red Location Pin Target ("Ramdev Hardware, Guruvarajapet") */}
            <div
              className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer z-20"
              style={{ top: '280px', left: '720px' }}
            >
              <div className="flex flex-col items-center group">
                {/* Red Pin Callout Card */}
                <div className="px-3 py-1.5 bg-white text-slate-900 font-sans font-bold text-xs rounded-xl shadow-2xl border-2 border-red-600 flex flex-col items-center mb-1 animate-pulse">
                  <span className="text-red-600 text-xs font-black flex items-center gap-1 whitespace-nowrap">
                    <MapPin className="w-4 h-4 fill-red-600 text-white" />
                    Ramdev Hardware, Guruvarajapet
                  </span>
                  <span className="text-[10px] text-slate-600 font-bold">ராమ్‌தேவ் ஹார்ட்வேர், குருவராஜப்பேட்டை</span>
                </div>

                {/* Big Red Drop Pin Icon */}
                <div className="w-9 h-9 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white font-extrabold text-lg">
                  ★
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FLOATING GEMINI AI ROUTE ASSISTANT PANEL */}
        <div className="absolute left-4 bottom-6 z-30 w-88 sm:w-96 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden font-mono text-xs flex flex-col">
          {/* AI Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              <span className="font-bold text-xs">GEMINI AI ROUTE INTELLIGENCE</span>
            </div>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">LIVE</span>
          </div>

          {/* AI Output Content */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {isAiLoading ? (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 py-4 justify-center">
                <Sparkles className="w-5 h-5 animate-spin" />
                <span className="font-bold">Gemini analyzing dark blue route...</span>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-2.5">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                  <div className="font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Route Summary</span>
                  </div>
                  <div>{aiAnalysis.summary}</div>
                  {aiAnalysis.bilingualNotice && (
                    <div className="mt-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 border-t border-blue-200/50 pt-1">
                      {aiAnalysis.bilingualNotice}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <div>
                      <div className="text-[9px] text-slate-500">ESTIMATED ETA</div>
                      <div className="font-bold text-slate-900 dark:text-white">~{aiAnalysis.etaMinutes} mins</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="text-[9px] text-slate-500">CONFIDENCE</div>
                      <div className="font-bold text-emerald-600">{aiAnalysis.safetyScore}% Safe</div>
                    </div>
                  </div>
                </div>

                {/* Question history */}
                {aiResponseHistory.length > 0 && (
                  <div className="space-y-2 border-t pt-2 border-slate-200 dark:border-slate-800">
                    {aiResponseHistory.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl text-[11px] ${
                          msg.role === 'user'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold ml-4'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mr-2'
                        }`}
                      >
                        <div className="text-[9px] text-slate-400 mb-0.5">{msg.role.toUpperCase()} • {msg.time}</div>
                        <div>{msg.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Interactive AI Prompt Input */}
          <div className="p-2.5 bg-slate-100 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Gemini about this route..."
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunGeminiAnalysis()}
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 text-xs"
            />
            <button
              onClick={() => handleRunGeminiAnalysis()}
              disabled={isAiLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ROUTE LEGEND CARD */}
        <div className="absolute right-4 top-4 z-30 p-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 shadow-xl backdrop-blur-md font-mono text-xs space-y-2">
          <div className="font-bold text-slate-900 dark:text-white text-[11px] flex items-center gap-1.5 border-b pb-1 border-slate-200 dark:border-slate-800">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>ROUTE TRAJECTORY LEGEND</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-6 h-1.5 rounded bg-blue-900"></span>
            <span className="text-[10px] text-slate-700 dark:text-slate-300">Route Moved (Solid Dark Blue)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-6 h-1.5 rounded bg-blue-600 border border-dashed border-white"></span>
            <span className="text-[10px] text-slate-700 dark:text-slate-300">Route to Move Next (Dashed)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 text-white text-[8px] font-bold flex items-center justify-center">★</span>
            <span className="text-[10px] text-red-600 font-bold">Ramdev Hardware, Guruvarajapet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
