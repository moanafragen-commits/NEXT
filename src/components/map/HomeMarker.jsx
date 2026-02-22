import React, { useMemo } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import { createPageUrl } from '@/utils';

function createHomeIcon(avatar) {
  if (!window.L) return undefined;
  return new window.L.DivIcon({
    className: '',
    html: `
      <div style="position:relative;width:40px;height:48px;">
        <div style="
          width:36px;height:36px;border-radius:10px;
          border:2px solid #f59e0b;
          overflow:hidden;background:#111;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.15), 0 4px 12px rgba(0,0,0,0.4);
        ">
          <img src="${avatar}" style="width:100%;height:100%;object-fit:cover;opacity:0.6;" onerror="this.style.display='none'" />
          <div style="
            position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
            font-size:18px;
          ">🏠</div>
        </div>
        <div style="
          position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);
          width:0;height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:6px solid #f59e0b;
        "></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -52]
  });
}

export default function HomeMarker({ character, currentLocation }) {
  const homeLat = character.home_latitude;
  const homeLng = character.home_longitude;

  const avatar = character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const icon = useMemo(() => createHomeIcon(avatar), [avatar]);

  if (!homeLat || !homeLng || !icon) return null;

  const isAway = character.travel_status && character.travel_status !== 'zuhause';
  
  // Line from home to current location
  const showLine = isAway && currentLocation?.latitude && currentLocation?.longitude;

  const travelLabels = {
    auf_tour: '🎤 Auf Tour',
    urlaub: '🏖️ Im Urlaub',
    geschäftsreise: '💼 Geschäftsreise',
    umzug: '📦 Umzug',
    unterwegs: '🚶 Unterwegs',
  };

  return (
    <>
      {/* Dashed line from home to current position */}
      {showLine && (
        <Polyline
          positions={[
            [homeLat, homeLng],
            [currentLocation.latitude, currentLocation.longitude]
          ]}
          pathOptions={{
            color: '#f59e0b',
            weight: 2,
            opacity: 0.3,
            dashArray: '6, 10',
            lineCap: 'round'
          }}
        />
      )}

      <Marker position={[homeLat, homeLng]} icon={icon}>
        <Popup maxWidth={220} minWidth={180}>
          <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img src={avatar} style={{
                width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover',
                border: '2px solid #f59e0b'
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#fff' }}>{character.name}</div>
                <div style={{ fontSize: '11px', color: '#f59e0b' }}>🏠 Zuhause</div>
              </div>
            </div>
            {character.home_address && (
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                📍 {character.home_address}
              </div>
            )}
            {character.home_city && (
              <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
                🏙️ {character.home_city}
              </div>
            )}
            {isAway && (
              <div style={{
                fontSize: '11px', color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
                padding: '6px 8px', borderRadius: '8px', marginBottom: '8px',
                border: '1px solid rgba(245,158,11,0.2)'
              }}>
                {travelLabels[character.travel_status] || '🚶 Unterwegs'}
                {character.travel_destination && ` → ${character.travel_destination}`}
              </div>
            )}
            <a
              href={createPageUrl(`Chat?characterId=${character.id}`)}
              style={{
                display: 'block', textAlign: 'center', padding: '6px 0',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: 'white', borderRadius: '8px', textDecoration: 'none',
                fontWeight: 600, fontSize: '12px'
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