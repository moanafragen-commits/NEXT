import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Marker, Popup, CircleMarker } from 'react-leaflet';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import AnimatedRoute, { ROUTE_COLORS } from './AnimatedRoute';
import HomeMarker from './HomeMarker';
import { base44 } from '@/api/base44Client';

function createCharIcon(avatar, emoji, isMoving, color) {
  if (!window.L) return undefined;
  const borderColor = color || '#10b981';
  return new window.L.DivIcon({
    className: '',
    html: `
      <div class="custom-marker-wrapper" style="position:relative;width:52px;height:62px;">
        <div style="
          width:48px;height:48px;border-radius:50%;
          border:3px solid ${borderColor};
          overflow:hidden;background:#111;
          box-shadow: 0 0 0 3px ${borderColor}26, 0 4px 16px rgba(0,0,0,0.5);
          ${isMoving ? 'animation: marker-bob 1.5s ease-in-out infinite;' : ''}
        ">
          <img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />
        </div>
        <div style="
          position:absolute;bottom:-4px;right:-4px;
          font-size:16px;line-height:1;
          background:#1a1a1a;border-radius:50%;
          width:24px;height:24px;
          display:flex;align-items:center;justify-content:center;
          border:2px solid #333;
          box-shadow:0 2px 8px rgba(0,0,0,0.4);
        ">${emoji || '📍'}</div>
        <div style="
          position:absolute;top:-3px;left:-3px;right:-3px;bottom:-3px;
          border-radius:50%;
          border:2px solid ${borderColor}33;
          animation: pulse-ring 2s ease-out infinite;
          pointer-events:none;
        "></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes marker-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
      </style>
    `,
    iconSize: [52, 62],
    iconAnchor: [26, 62],
    popupAnchor: [0, -66]
  });
}

// Simulate slow drift movement for live-tracking feel
function useLivePosition(baseLat, baseLng) {
  const [pos, setPos] = useState([baseLat, baseLng]);
  const offsetRef = useRef({ lat: 0, lng: 0 });
  const frameRef = useRef(null);

  useEffect(() => {
    setPos([baseLat, baseLng]);
    offsetRef.current = { lat: 0, lng: 0 };
  }, [baseLat, baseLng]);

  useEffect(() => {
    let running = true;
    const drift = () => {
      if (!running) return;
      offsetRef.current.lat += (Math.random() - 0.5) * 0.00008;
      offsetRef.current.lng += (Math.random() - 0.5) * 0.00008;
      offsetRef.current.lat = Math.max(-0.002, Math.min(0.002, offsetRef.current.lat));
      offsetRef.current.lng = Math.max(-0.002, Math.min(0.002, offsetRef.current.lng));
      setPos([baseLat + offsetRef.current.lat, baseLng + offsetRef.current.lng]);
      frameRef.current = setTimeout(drift, 3000 + Math.random() * 4000);
    };
    frameRef.current = setTimeout(drift, 2000 + Math.random() * 3000);
    return () => { running = false; clearTimeout(frameRef.current); };
  }, [baseLat, baseLng]);

  return pos;
}

function MapMarker({ character, location, historyLocations, charIndex }) {
  const avatar = character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const timeAgo = location.shared_at
    ? formatDistanceToNow(new Date(location.shared_at), { addSuffix: true, locale: de })
    : '';

  const color = ROUTE_COLORS[charIndex % ROUTE_COLORS.length];
  const livePos = useLivePosition(location.latitude, location.longitude);
  const icon = useMemo(() => createCharIcon(avatar, location.emoji, true, color), [avatar, location.emoji, color]);

  const historyPoints = useMemo(() => {
    if (!historyLocations || historyLocations.length < 2) return null;
    return historyLocations
      .filter(l => l.latitude && l.longitude)
      .reverse() // oldest first
      .map(l => [l.latitude, l.longitude]);
  }, [historyLocations]);

  const [routePoints, setRoutePoints] = useState(null);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!historyPoints) {
        setRoutePoints(null);
        return;
      }
      
      const waypoints = historyPoints.map(p => ({ lat: p[0], lng: p[1] }));
      
      try {
        const response = await base44.functions.invoke('getStreetRoute', { waypoints });
        if (response.data && response.data.polyline) {
          setRoutePoints(response.data.polyline);
        } else {
          setRoutePoints(historyPoints);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
        setRoutePoints(historyPoints);
      }
    };
    
    fetchRoute();
  }, [historyPoints]);

  const isAway = character.travel_status && character.travel_status !== 'zuhause';
  const travelLabels = {
    auf_tour: '🎤 Auf Tour',
    urlaub: '🏖️ Im Urlaub',
    geschäftsreise: '💼 Geschäftsreise',
    umzug: '📦 Umzug',
    unterwegs: '🚶 Unterwegs',
  };

  if (!icon) return null;

  return (
    <>
      {/* Animated route */}
      {routePoints && routePoints.length >= 2 && (
        <AnimatedRoute positions={routePoints} stops={historyPoints} characterIndex={charIndex} showDot={true} />
      )}

      {/* Home marker */}
      <HomeMarker character={character} currentLocation={location} />

      {/* Live marker */}
      <Marker position={livePos} icon={icon}>
        <Popup maxWidth={280} minWidth={220}>
          <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <img src={avatar} style={{
                width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover',
                border: `2px solid ${color}`, boxShadow: `0 0 0 3px ${color}1a`
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '2px' }}>{character.name}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>{location.emoji} {location.location_name}</div>
              </div>
            </div>

            {/* Travel status badge */}
            {isAway && (
              <div style={{
                fontSize: '11px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
                padding: '6px 10px', borderRadius: '8px', marginBottom: '10px',
                border: '1px solid rgba(245,158,11,0.2)'
              }}>
                {travelLabels[character.travel_status] || '🚶 Unterwegs'}
                {character.travel_destination && ` → ${character.travel_destination}`}
              </div>
            )}

            {location.description && (
              <div style={{ fontSize: '12px', color: '#d1d5db', marginBottom: '8px', lineHeight: '1.5' }}>{location.description}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
              {location.address && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>📍 {location.address}</div>
              )}
              {location.city && (
                <div style={{ fontSize: '11px', color: '#6b7280' }}>🏙️ {location.city}</div>
              )}
              {timeAgo && (
                <div style={{ fontSize: '10px', color: '#4b5563' }}>🕐 {timeAgo}</div>
              )}
              {historyLocations && historyLocations.length > 1 && (
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
                  📊 {historyLocations.length} Standorte • <span style={{color}}>{Math.round((historyLocations.length - 1) * 1.2)}km Route</span>
                </div>
              )}
            </div>
            <a
              href={createPageUrl(`Chat?characterId=${character.id}`)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '8px 0', background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                color: 'white', borderRadius: '10px', textDecoration: 'none',
                fontWeight: 600, fontSize: '13px',
                boxShadow: `0 2px 10px ${color}40`
              }}
            >
              💬 Chat öffnen
            </a>
          </div>
        </Popup>
      </Marker>
    </>
  );
}

export default function MapMarkerLayer({ locations, characters, locationHistory }) {
  // Sort characters for consistent color assignment
  const charOrder = useMemo(() => {
    const ids = [...new Set(locations.map(l => l.character_id))];
    return ids;
  }, [locations]);

  return (
    <>
      {locations.map(loc => {
        const char = characters.find(c => c.id === loc.character_id);
        if (!char) return null;
        const history = locationHistory?.[loc.character_id] || [];
        const charIndex = charOrder.indexOf(loc.character_id);
        return <MapMarker key={loc.id} character={char} location={loc} historyLocations={history} charIndex={charIndex} />;
      })}
    </>
  );
}