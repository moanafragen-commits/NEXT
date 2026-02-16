import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createPageUrl } from '@/utils';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

function createCharIcon(avatar, emoji) {
  if (!window.L) return undefined;
  return new window.L.DivIcon({
    className: '',
    html: `
      <div class="custom-marker-wrapper" style="position:relative;width:52px;height:62px;">
        <div style="
          width:48px;height:48px;border-radius:50%;
          border:3px solid #10b981;
          overflow:hidden;background:#111;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.15), 0 4px 16px rgba(0,0,0,0.5);
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
          border:2px solid rgba(16,185,129,0.2);
          animation: pulse-ring 2s ease-out infinite;
          pointer-events:none;
        "></div>
      </div>
      <style>
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      </style>
    `,
    iconSize: [52, 62],
    iconAnchor: [26, 62],
    popupAnchor: [0, -66]
  });
}

function MapMarker({ character, location }) {
  const avatar = character.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const timeAgo = location.shared_at
    ? formatDistanceToNow(new Date(location.shared_at), { addSuffix: true, locale: de })
    : '';

  const icon = useMemo(() => createCharIcon(avatar, location.emoji), [avatar, location.emoji]);
  if (!icon) return null;

  return (
    <Marker position={[location.latitude, location.longitude]} icon={icon}>
      <Popup maxWidth={260} minWidth={220}>
        <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img src={avatar} style={{
              width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover',
              border: '2px solid #10b981', boxShadow: '0 0 0 3px rgba(16,185,129,0.1)'
            }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', marginBottom: '2px' }}>{character.name}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>{location.emoji} {location.location_name}</div>
            </div>
          </div>
          {location.description && (
            <div style={{ fontSize: '12px', color: '#d1d5db', marginBottom: '8px', lineHeight: '1.5' }}>{location.description}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
            {location.address && (
              <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                📍 {location.address}
              </div>
            )}
            {location.city && (
              <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🏙️ {location.city}
              </div>
            )}
            {timeAgo && (
              <div style={{ fontSize: '10px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '4px' }}>
                🕐 {timeAgo}
              </div>
            )}
          </div>
          <a
            href={createPageUrl(`Chat?characterId=${character.id}`)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              padding: '8px 0', background: 'linear-gradient(135deg, #10b981, #14b8a6)',
              color: 'white', borderRadius: '10px', textDecoration: 'none',
              fontWeight: 600, fontSize: '13px',
              boxShadow: '0 2px 10px rgba(16,185,129,0.25)'
            }}
          >
            💬 Chat öffnen
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapMarkerLayer({ locations, characters }) {
  return (
    <>
      {locations.map(loc => {
        const char = characters.find(c => c.id === loc.character_id);
        if (!char) return null;
        return <MapMarker key={loc.id} character={char} location={loc} />;
      })}
    </>
  );
}