import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, MapPin, List, Layers, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import BottomNav from '@/components/navigation/BottomNav';
import CharacterListPanel from '@/components/map/CharacterListPanel';

// Fix for Leaflet default icon in bundlers
const fixLeafletIcon = () => {
  if (typeof window !== 'undefined' && window.L) {
    delete window.L.Icon.Default.prototype._getIconUrl;
    window.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }
};

function FlyToLocation({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 15, { duration: 1.2 });
  }, [center, zoom]);
  return null;
}

function CharacterMarker({ character, location }) {
  const avatar = character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const timeAgo = location.shared_at
    ? formatDistanceToNow(new Date(location.shared_at), { addSuffix: true, locale: de })
    : '';

  const icon = window.L ? new window.L.DivIcon({
    className: '',
    html: `
      <div style="position:relative;width:48px;height:56px;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.4));">
        <div style="width:46px;height:46px;border-radius:50%;border:3px solid #10b981;overflow:hidden;background:#1a1a1a;">
          <img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />
        </div>
        <div style="position:absolute;bottom:-2px;right:-2px;font-size:16px;background:#1a1a1a;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;border:2px solid #333;">${location.emoji || '📍'}</div>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56]
  }) : undefined;

  if (!icon) return null;

  return (
    <Marker position={[location.latitude, location.longitude]} icon={icon}>
      <Popup>
        <div style={{ minWidth: 200, fontFamily: 'Inter, sans-serif', padding: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <img src={avatar} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{character.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{location.emoji} {location.location_name}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#374151', marginBottom: 4 }}>{location.description}</div>
          {location.address && <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>📍 {location.address}</div>}
          {location.city && <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>🏙️ {location.city}</div>}
          {timeAgo && <div style={{ fontSize: 10, color: '#b0b0b0', marginTop: 4 }}>🕐 {timeAgo}</div>}
          <a
            href={createPageUrl(`Chat?characterId=${character.id}`)}
            style={{ display: 'block', marginTop: 10, textAlign: 'center', fontSize: 13, padding: '6px 0', background: '#10b981', color: 'white', borderRadius: 8, textDecoration: 'none', fontWeight: 600 }}
          >
            💬 Chat öffnen
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

export default function CharacterMap() {
  const [showList, setShowList] = useState(false);
  const [flyTarget, setFlyTarget] = useState(null);
  const [mapStyle, setMapStyle] = useState('dark');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: characters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const { data: locations = [] } = useQuery({
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

  const activeChars = characters.filter(c => !c.is_archived && !c.is_blocked);

  // Calculate map center from all locations
  const defaultCenter = [52.52, 13.405]; // Berlin
  const center = locations.length > 0
    ? [
        locations.reduce((s, l) => s + l.latitude, 0) / locations.length,
        locations.reduce((s, l) => s + l.longitude, 0) / locations.length
      ]
    : defaultCenter;

  const tileUrls = {
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  };

  useEffect(() => { fixLeafletIcon(); }, []);

  const handleFocus = (loc) => {
    setFlyTarget({ center: [loc.latitude, loc.longitude], zoom: 16 });
    setShowList(false);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-[1000] bg-[#111]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold">Standortkarte</h1>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">{locations.length} aktiv</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const styles = ['dark', 'satellite', 'street'];
                const idx = styles.indexOf(mapStyle);
                setMapStyle(styles[(idx + 1) % styles.length]);
              }}
              className="text-gray-400 hover:text-white hover:bg-white/10"
              title="Kartenstil wechseln"
            >
              <Layers className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowList(!showList)}
              className={`hover:bg-white/10 ${showList ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Map */}
      <div className="flex-1 relative">
        <style>{`
          .leaflet-container { background: #0a0a0a; }
          .leaflet-popup-content-wrapper { background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
          .leaflet-popup-tip { background: #fff; }
          .leaflet-control-zoom a { background: #1a1a1a !important; color: #fff !important; border-color: #333 !important; }
          .leaflet-control-zoom a:hover { background: #333 !important; }
          .leaflet-control-attribution { display: none !important; }
        `}</style>
        <MapContainer
          center={center}
          zoom={locations.length > 1 ? 6 : 13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url={tileUrls[mapStyle]}
            attribution=""
          />
          {flyTarget && <FlyToLocation center={flyTarget.center} zoom={flyTarget.zoom} />}
          {locations.map(loc => {
            const char = activeChars.find(c => c.id === loc.character_id);
            if (!char) return null;
            return <CharacterMarker key={loc.id} character={char} location={loc} />;
          })}
        </MapContainer>

        {/* Map Style Label */}
        <div className="absolute top-3 right-3 z-[500] bg-black/60 backdrop-blur-sm text-[10px] text-gray-400 px-2 py-1 rounded-full">
          {mapStyle === 'dark' ? '🌙 Dark' : mapStyle === 'satellite' ? '🛰️ Satellit' : '🗺️ Straße'}
        </div>

        {/* Bottom List Panel */}
        <AnimatePresence>
          {showList && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-[500] bg-[#0a0a0a]/95 backdrop-blur-xl rounded-t-2xl border-t border-white/10 max-h-[55%] overflow-y-auto"
            >
              <div className="flex items-center justify-center pt-2 pb-1">
                <div className="w-8 h-1 bg-gray-700 rounded-full" />
              </div>
              <div className="px-4 pb-4 pt-1">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-gray-400">Aktuelle Standorte</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowList(false)} className="text-gray-500 hover:text-white h-6 px-2 text-xs">
                    Schließen
                  </Button>
                </div>
                <CharacterListPanel
                  characters={activeChars}
                  locations={locations}
                  onFocus={handleFocus}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick character chips */}
        {!showList && locations.length > 0 && (
          <div className="absolute bottom-20 left-0 right-0 z-[500] px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {locations.map(loc => {
                const char = activeChars.find(c => c.id === loc.character_id);
                if (!char) return null;
                const avatar = char.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${char.name}`;
                return (
                  <button
                    key={loc.id}
                    onClick={() => handleFocus(loc)}
                    className="flex items-center gap-2 bg-[#1a1a1a]/90 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1.5 shrink-0 hover:bg-white/10 transition-colors press-effect"
                  >
                    <img src={avatar} className="w-6 h-6 rounded-full object-cover border border-emerald-500/50" />
                    <span className="text-xs font-medium text-white whitespace-nowrap">{char.name}</span>
                    <span className="text-xs">{loc.emoji}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav user={user} />
    </div>
  );
}