import React from 'react';
import { TAMIL_NADU_EMBED_URL } from '../../services/map/MapProvider';

interface GoogleMapEmbedProps {
  embedUrl?: string;
  regionName?: string;
}

export const GoogleMapEmbed: React.FC<GoogleMapEmbedProps> = React.memo(
  ({ embedUrl = TAMIL_NADU_EMBED_URL, regionName = 'Tamil Nadu' }) => {
    return (
      <div className="absolute inset-0 w-full h-full bg-slate-900 overflow-hidden select-none">
        <iframe
          title={`Google Maps Geographic Background - ${regionName}`}
          src={embedUrl}
          className="google-map-background w-full h-full border-0 pointer-events-auto"
          style={{ width: '100%', height: '100%', border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
        
        {/* Subtle Vignette Overlay to maintain contrast for custom overlay items */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20" />
      </div>
    );
  }
);

GoogleMapEmbed.displayName = 'GoogleMapEmbed';
