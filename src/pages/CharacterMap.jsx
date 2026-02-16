import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MapPin, List, Layers, X, MessageCircle, Navigation2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from '@/components/navigation/BottomNav';
import MapMarkerLayer from '@/components/map/MapMarkerLayer';
import MapCharacterList from '@/components/map/MapCharacterList';

const TILE_URLS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  street: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

const STYLE_LABELS = { dark: '🌙 Dark', satellite: '🛰️ Satellit', street: '🗺️ Straße' };

function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 15, { duration: 1 });
  }, [center?.[0], center?.[1], zoom]);
  return null;
}

function MapReady() {
  const map = useMap();
  useEffect(() => {
    // Force resize after mount so tiles fill the container
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 500);
  }, [map]);
  return null;
}

export default function CharacterMap() {
  const [showList, setShowList] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [mapStyle, setMapStyle] = useState('dark');
  const [selectedChar, setSelectedChar] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: locations = [], isLoading } = useQuery({
    queryKey: ['all-character-locations'],
    queryFn: async () => {
      const allLocs = await base44.entities.CharacterLocation.list('-created_date', 200);
      const latest = {};
      for (const loc of allLocs) {
        if (!latest[loc.character_id] && loc.latitude && loc.longitude) {
          latest[loc.character_id] = loc;
        }
      }
      return Object.values(latest);
    }
  });

  const activeChars = useMemo(() => characters.filter(c => !c.is_archived && !c.is_blocked), [characters]);

  const center = useMemo(() => {
    if (locations.length === 0) return [51.1657, 10.4515]; // Center of Germany
    return [
      locations.reduce((s, l) => s + l.latitude, 0) / locations.length,
      locations.reduce((s, l) => s + l.longitude, 0) / locations.length
    ];
  }, [locations]);

  const defaultZoom = locations.length > 1 ? 6 : locations.length === 1 ? 13 : 5;

  const handleFocus = (loc) => {
    setFlyTarget({ center: [loc.latitude, loc.longitude], zoom: 16 });
    setShowList(false);
    const char = activeChars.find(c => c.id === loc.character_id);
    if (char) setSelectedChar({ char, loc });
  };

  const cycleStyle = () => {
    const styles = ['dark', 'satellite', 'street'];
    setMapStyle(styles[(styles.indexOf(mapStyle) + 1) % styles.length]);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Leaflet CSS */}
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      
      <style>{`
        .leaflet-container {
          background: #0a0a0a !important;
          width: 100% !important;
          height: 100% !important;
        }
        .leaflet-tile-pane { opacity: 1; }
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.4) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        .leaflet-control-zoom a {
          background: rgba(26,26,26,0.95) !important;
          color: #a0a0a0 !important;
          border: none !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(40,40,40,0.95) !important;
          color: #10b981 !important;
        }
        .leaflet-control-zoom a:last-child {
          border-bottom: none !important;
        }
        .leaflet-control-attribution { display: none !important; }
        .leaflet-popup-content-wrapper {
          background: #1a1a1a !important;
          border-radius: 16px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06) !important;
          color: white !important;
          padding: 0 !important;
          overflow: hidden;
        }
        .leaflet-popup-content { margin: 0 !important; }
        .leaflet-popup-tip { background: #1a1a1a !important; }
        .leaflet-popup-close-button {
          color: #666 !important;
          font-size: 20px !important;
          top: 8px !important;
          right: 10px !important;
        }
        .leaflet-popup-close-button:hover { color: #fff !important; }
        .custom-marker-wrapper {
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.5));
          transition: transform 0.2s ease;
        }
        .custom-marker-wrapper:hover { transform: scale(1.15); }
      `}</style>

      {/* Header - floating overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="flex items-center justify-between p-3 pointer-events-auto">
          <div className="flex items-center gap-2">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="bg-black/60 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-black/80 rounded-xl h-10 w-10 border border-white/5">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="bg-black/60 backdrop-blur-xl rounded-xl px-3.5 py-2 border border-white/5 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-semibold">Karte</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full font-medium">{locations.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={cycleStyle}
              className="bg-black/60 backdrop-blur-xl text-gray-300 hover:text-white hover:bg-black/80 rounded-xl h-10 w-10 border border-white/5"
            >
              <Layers className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setShowList(!showList); setSelectedChar(null); }}
              className={`bg-black/60 backdrop-blur-xl hover:bg-black/80 rounded-xl h-10 w-10 border border-white/5 ${showList ? 'text-emerald-400' : 'text-gray-300 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Map Style Pill */}
        <div className="flex justify-end px-3 pointer-events-auto">
          <button onClick={cycleStyle} className="bg-black/50 backdrop-blur-sm text-[10px] text-gray-400 px-2.5 py-1 rounded-full border border-white/5 hover:text-white transition-colors">
            {STYLE_LABELS[mapStyle]}
          </button>
        </div>
      </div>

      {/* Full Screen Map */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
              <span className="text-xs text-gray-500">Karte wird geladen...</span>
            </div>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            zoomControl={true}
          >
            <MapReady />
            <TileLayer url={TILE_URLS[mapStyle]} attribution="" />
            {flyTarget && <FlyTo center={flyTarget.center} zoom={flyTarget.zoom} />}
            <MapMarkerLayer locations={locations} characters={activeChars} />
          </MapContainer>
        )}

        {/* Empty State Overlay */}
        {!isLoading && locations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-[500] pointer-events-none">
            <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center max-w-xs pointer-events-auto">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold mb-2">Keine Standorte</h3>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Chatte mit deinen Charakteren – sie teilen automatisch ihren Standort mit dir!
              </p>
              <Link to={createPageUrl('Home')}>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs h-9 px-4">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
                  Zum Chat
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Character chips - scrollable at bottom */}
        {!showList && locations.length > 0 && (
          <div className="absolute bottom-20 left-0 right-0 z-[500] px-3">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {locations.map(loc => {
                const char = activeChars.find(c => c.id === loc.character_id);
                if (!char) return null;
                const avatar = char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`;
                const isActive = selectedChar?.char?.id === char.id;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleFocus(loc)}
                    className={`flex items-center gap-2 backdrop-blur-xl border rounded-full px-3 py-2 shrink-0 transition-all press-effect ${
                      isActive
                        ? 'bg-emerald-600/90 border-emerald-400/30 shadow-lg shadow-emerald-500/20'
                        : 'bg-black/70 border-white/10 hover:bg-black/90 hover:border-white/20'
                    }`}
                  >
                    <img src={avatar} className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/40" />
                    <div className="text-left">
                      <span className="text-xs font-semibold text-white block leading-tight">{char.name}</span>
                      <span className="text-[10px] text-gray-400 block leading-tight">{loc.emoji} {loc.location_name?.slice(0, 18)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom List Panel */}
        <AnimatePresence>
          {showList && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="absolute bottom-0 left-0 right-0 z-[500] bg-[#111]/95 backdrop-blur-2xl rounded-t-3xl border-t border-white/10 max-h-[60%] flex flex-col"
            >
              <div className="flex items-center justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-700 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 pb-3 pt-1">
                <h2 className="text-sm font-bold text-white">Standorte ({locations.length})</h2>
                <Button variant="ghost" size="icon" onClick={() => setShowList(false)} className="text-gray-500 hover:text-white h-8 w-8 rounded-lg">
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 pb-4">
                <MapCharacterList
                  characters={activeChars}
                  locations={locations}
                  onFocus={handleFocus}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNav user={user} />
    </div>
  );
}