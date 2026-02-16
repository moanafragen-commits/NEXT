import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Marker, Popup } from 'react-leaflet';
import L from 'react-leaflet';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

export default function CharacterMapMarker({ character, location }) {
  const defaultAvatar = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${character.name}`;
  const avatar = character.avatar_url || defaultAvatar;
  const timeAgo = location.shared_at
    ? formatDistanceToNow(new Date(location.shared_at), { addSuffix: true, locale: de })
    : '';

  // Create custom icon with character avatar
  const icon = new window.L.DivIcon({
    className: 'custom-marker',
    html: `
      <div style="position:relative;width:44px;height:52px;">
        <div style="width:44px;height:44px;border-radius:50%;border:3px solid #10b981;overflow:hidden;background:#1a1a1a;box-shadow:0 2px 8px rgba(0,0,0,0.5);">
          <img src="${avatar}" style="width:100%;height:100%;object-fit:cover;" />
        </div>
        <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);font-size:14px;line-height:1;">${location.emoji || '📍'}</div>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 52],
    popupAnchor: [0, -52]
  });

  return (
    <Marker
      position={[location.latitude, location.longitude]}
      icon={icon}
    >
      <Popup className="character-popup">
        <div style={{ minWidth: 180, fontFamily: 'Inter, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <img
              src={avatar}
              style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #10b981' }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{character.name}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{location.emoji} {location.location_name}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#4b5563', marginBottom: 4 }}>{location.description}</div>
          {location.address && <div style={{ fontSize: 11, color: '#9ca3af' }}>📍 {location.address}</div>}
          {timeAgo && <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{timeAgo}</div>}
          <a
            href={createPageUrl(`Chat?characterId=${character.id}`)}
            style={{ display: 'block', marginTop: 8, textAlign: 'center', fontSize: 12, padding: '4px 0', background: '#10b981', color: 'white', borderRadius: 6, textDecoration: 'none', fontWeight: 500 }}
          >
            💬 Chat öffnen
          </a>
        </div>
      </Popup>
    </Marker>
  );
}