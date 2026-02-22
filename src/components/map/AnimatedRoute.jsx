import React, { useState, useEffect, useMemo } from 'react';
import { Polyline, CircleMarker, Marker } from 'react-leaflet';

// Animated "traveling dot" along a polyline
function TravelingDot({ positions, color }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let running = true;
    let p = 0;
    const tick = () => {
      if (!running) return;
      p += 0.005;
      if (p > 1) p = 0;
      setProgress(p);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { running = false; };
  }, []);

  if (positions.length < 2) return null;

  // Calculate total distance and find point at progress
  const segments = [];
  let totalDist = 0;
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i][0] - positions[i - 1][0];
    const dy = positions[i][1] - positions[i - 1][1];
    const d = Math.sqrt(dx * dx + dy * dy);
    segments.push({ from: positions[i - 1], to: positions[i], dist: d });
    totalDist += d;
  }

  let targetDist = progress * totalDist;
  let dotPos = positions[0];
  for (const seg of segments) {
    if (targetDist <= seg.dist) {
      const t = seg.dist > 0 ? targetDist / seg.dist : 0;
      dotPos = [
        seg.from[0] + (seg.to[0] - seg.from[0]) * t,
        seg.from[1] + (seg.to[1] - seg.from[1]) * t
      ];
      break;
    }
    targetDist -= seg.dist;
  }

  return (
    <CircleMarker
      center={dotPos}
      radius={5}
      pathOptions={{
        color,
        fillColor: color,
        fillOpacity: 1,
        weight: 2,
        opacity: 0.9
      }}
    />
  );
}

// Character colors based on index
const ROUTE_COLORS = [
  '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#22d3ee'
];

export default function AnimatedRoute({ positions, characterIndex, showDot = true }) {
  const color = ROUTE_COLORS[characterIndex % ROUTE_COLORS.length];

  if (!positions || positions.length < 2) return null;

  return (
    <>
      {/* Glow line behind */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: 6,
          opacity: 0.15,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
      {/* Main route line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color,
          weight: 3,
          opacity: 0.6,
          dashArray: '10, 6',
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
      {/* Stop dots */}
      {positions.map((pt, i) => (
        <CircleMarker
          key={`stop-${i}`}
          center={pt}
          radius={i === 0 ? 6 : 4}
          pathOptions={{
            color,
            fillColor: i === 0 ? color : '#111',
            fillOpacity: 0.9,
            weight: 2,
            opacity: 0.5 + (i / positions.length) * 0.5
          }}
        />
      ))}
      {/* Animated traveling dot */}
      {showDot && <TravelingDot positions={positions} color={color} />}
    </>
  );
}

export { ROUTE_COLORS };