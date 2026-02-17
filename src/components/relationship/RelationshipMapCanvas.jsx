import React, { useRef, useEffect, useState, useCallback } from 'react';

const COLORS = {
  bg: '#0a0a0a',
  nodeBg: '#1a1a1a',
  nodeBorder: 'rgba(255,255,255,0.08)',
  userGlow: 'rgba(16,185,129,0.4)',
  text: '#f0f0f0',
  textDim: '#777',
};

const STRENGTH_STYLES = [
  { min: 8, color: [52, 211, 153], width: 3.5, glow: 12, label: 'Sehr stark' },
  { min: 5, color: [16, 185, 129], width: 2.5, glow: 8, label: 'Stark' },
  { min: 3, color: [100, 160, 140], width: 1.8, glow: 4, label: 'Mittel' },
  { min: 0, color: [100, 100, 100], width: 1, glow: 0, label: 'Schwach' },
];

function getStrengthStyle(strength) {
  return STRENGTH_STYLES.find(s => strength >= s.min) || STRENGTH_STYLES[3];
}

function getNodePositions(count, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = [{ x: centerX, y: centerY, isUser: true }];

  if (count === 0) return positions;

  // Use multiple rings for many characters
  const rings = count <= 6 ? [count] : count <= 14 ? [Math.min(6, count), count - Math.min(6, count)] : [7, 7, count - 14];
  const baseRadius = Math.min(width, height) * 0.28;

  let idx = 0;
  rings.forEach((ringCount, ringIdx) => {
    const radius = baseRadius + ringIdx * (baseRadius * 0.55);
    const offset = ringIdx * 0.3; // Stagger rings
    for (let i = 0; i < ringCount; i++) {
      const angle = (2 * Math.PI * i) / ringCount - Math.PI / 2 + offset;
      positions.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        isUser: false,
        ring: ringIdx
      });
      idx++;
    }
  });

  return positions;
}

// Load image with caching
const imageCache = {};
function loadImage(url) {
  if (imageCache[url]) return Promise.resolve(imageCache[url]);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => { imageCache[url] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export default function RelationshipMapCanvas({ characters, memories, messages, sharedMemories, user, onSelectLink, onSelectCharacter }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 500 });
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);
  const positionsRef = useRef([]);
  const nodesRef = useRef([]);
  const linksRef = useRef([]);
  const imagesRef = useRef({});
  const animFrameRef = useRef(0);
  const pulseRef = useRef(0);

  // Build node + link data
  useEffect(() => {
    const nodes = [
      { id: 'user', name: user?.full_name || 'Du', avatar: user?.avatar_url, isUser: true }
    ];
    characters.forEach(c => {
      nodes.push({
        id: c.id,
        name: c.name,
        avatar: c.avatar_url || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${c.name}`,
        trust: c.trust_level || 5,
        relationship: c.initial_relationship || '',
        category: c.category || '',
        mood: c.current_mood || '',
        isUser: false,
        character: c
      });
    });

    const links = [];
    characters.forEach(c => {
      const charMsgs = messages.filter(m => m.character_id === c.id);
      const charMems = memories.filter(m => m.character_id === c.id);
      const trust = c.trust_level || 5;
      const msgCount = charMsgs.length;
      const memCount = charMems.length;
      const bondStrength = Math.min(10, (trust * 0.4) + (Math.min(msgCount, 100) / 100 * 3) + (Math.min(memCount, 20) / 20 * 3));

      const highlights = [];
      charMems.filter(m => m.importance_level === 'hoch').slice(0, 3)
        .forEach(m => highlights.push({ type: 'memory', text: m.memory_text }));
      if (c.relationship_backstory) highlights.push({ type: 'backstory', text: c.relationship_backstory });
      if (c.inside_jokes) highlights.push({ type: 'joke', text: c.inside_jokes });
      if (c.shared_memories) highlights.push({ type: 'shared', text: c.shared_memories });

      links.push({
        from: 'user', to: c.id, strength: bondStrength, trust, msgCount, memCount,
        relationship: c.initial_relationship || 'Unbekannt', dynamic: c.relationship_dynamic || '',
        highlights, character: c
      });
    });

    if (sharedMemories?.length > 0) {
      const pairMap = {};
      sharedMemories.forEach(sm => {
        const key = [sm.source_character_id, sm.target_character_id].sort().join('::');
        if (!pairMap[key]) pairMap[key] = { count: 0, infos: [] };
        pairMap[key].count++;
        pairMap[key].infos.push(sm.content);
      });
      Object.entries(pairMap).forEach(([key, val]) => {
        const [a, b] = key.split('::');
        if (characters.find(c => c.id === a) && characters.find(c => c.id === b)) {
          links.push({
            from: a, to: b, strength: Math.min(6, val.count * 1.5), trust: 0, msgCount: 0, memCount: val.count,
            relationship: 'Klatsch/Info', dynamic: '', highlights: val.infos.slice(0, 3).map(t => ({ type: 'shared_info', text: t })), isCharLink: true
          });
        }
      });
    }

    nodesRef.current = nodes;
    linksRef.current = links;

    // Preload images
    nodes.forEach(n => {
      if (n.avatar) loadImage(n.avatar).then(img => { if (img) imagesRef.current[n.id] = img; });
    });
  }, [characters, memories, messages, sharedMemories, user]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 450) });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Animation + Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let running = true;

    const draw = () => {
      if (!running) return;
      pulseRef.current += 0.015;
      const pulse = Math.sin(pulseRef.current) * 0.5 + 0.5;

      const ctx = canvas.getContext('2d');
      const { width, height } = dimensions;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      const charNodes = nodesRef.current.filter(n => !n.isUser);
      const positions = getNodePositions(charNodes.length, width, height);
      positionsRef.current = positions;

      // Background with subtle radial gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.7);
      bgGrad.addColorStop(0, '#111118');
      bgGrad.addColorStop(0.5, '#0c0c12');
      bgGrad.addColorStop(1, '#080810');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle grid dots
      ctx.fillStyle = 'rgba(255,255,255,0.015)';
      for (let gx = 0; gx < width; gx += 30) {
        for (let gy = 0; gy < height; gy += 30) {
          ctx.fillRect(gx, gy, 1, 1);
        }
      }

      // Draw links with glow
      linksRef.current.forEach((link, li) => {
        const fromIdx = link.from === 'user' ? 0 : charNodes.findIndex(n => n.id === link.from) + 1;
        const toIdx = link.to === 'user' ? 0 : charNodes.findIndex(n => n.id === link.to) + 1;
        if (fromIdx < 0 || toIdx < 0 || !positions[fromIdx] || !positions[toIdx]) return;

        const p1 = positions[fromIdx];
        const p2 = positions[toIdx];
        const isHovered = hoveredLink === li;
        const style = getStrengthStyle(link.strength);
        const [r, g, b] = style.color;
        const alpha = isHovered ? 1 : (0.5 + pulse * 0.2);

        // Glow layer
        if (style.glow > 0 || isHovered) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(${r},${g},${b},${isHovered ? 0.3 : 0.1})`;
          ctx.lineWidth = style.width + (isHovered ? 10 : style.glow);
          ctx.lineCap = 'round';
          if (link.isCharLink) ctx.setLineDash([6, 8]);
          else ctx.setLineDash([]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Main line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = isHovered ? style.width + 1.5 : style.width;
        ctx.lineCap = 'round';
        if (link.isCharLink) ctx.setLineDash([6, 8]);
        else ctx.setLineDash([]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated particles along strong links
        if (link.strength >= 5 && !link.isCharLink) {
          const t = (pulseRef.current * 0.3 + li * 0.7) % 1;
          const px = p1.x + (p2.x - p1.x) * t;
          const py = p1.y + (p2.y - p1.y) * t;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + pulse * 0.4})`;
          ctx.fill();
        }

        // Relationship label at midpoint
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        if (!link.isCharLink && link.relationship) {
          // Background pill
          ctx.font = '9px Inter, sans-serif';
          const tw = ctx.measureText(link.relationship).width;
          ctx.fillStyle = `rgba(${r},${g},${b},${isHovered ? 0.25 : 0.12})`;
          ctx.beginPath();
          ctx.roundRect(mx - tw / 2 - 6, my - 7, tw + 12, 14, 7);
          ctx.fill();
          ctx.fillStyle = `rgba(${r},${g},${b},${isHovered ? 1 : 0.7})`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(link.relationship, mx, my);
          ctx.textBaseline = 'alphabetic';
        }
      });

      // Draw nodes
      const nodeRadius = 26;
      const userRadius = 32;

      positions.forEach((pos, i) => {
        const node = i === 0 ? nodesRef.current[0] : charNodes[i - 1];
        if (!node) return;
        const isHovered = hoveredNode === i;
        const r = node.isUser ? userRadius : nodeRadius;

        // Outer glow ring (animated)
        if (node.isUser || isHovered) {
          const glowR = r + 8 + pulse * 4;
          const glowGrad = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, glowR);
          glowGrad.addColorStop(0, node.isUser ? `rgba(16,185,129,${0.25 + pulse * 0.15})` : 'rgba(16,185,129,0.2)');
          glowGrad.addColorStop(1, 'rgba(16,185,129,0)');
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }

        // Trust ring (arc around avatar)
        if (!node.isUser && node.trust) {
          const trustAngle = (node.trust / 10) * Math.PI * 2;
          const ringR = r + 4;
          // Background ring
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255,255,255,0.05)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
          // Trust arc
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, ringR, -Math.PI / 2, -Math.PI / 2 + trustAngle);
          const trustColor = node.trust >= 7 ? 'rgba(52,211,153,0.8)' : node.trust >= 4 ? 'rgba(251,191,36,0.7)' : 'rgba(239,68,68,0.6)';
          ctx.strokeStyle = trustColor;
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Avatar circle
        ctx.save();
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.clip();

        const img = imagesRef.current[node.id];
        if (img) {
          ctx.drawImage(img, pos.x - r, pos.y - r, r * 2, r * 2);
          // Subtle overlay
          ctx.fillStyle = isHovered ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.1)';
          ctx.fillRect(pos.x - r, pos.y - r, r * 2, r * 2);
        } else {
          // Gradient fallback
          const grad = ctx.createRadialGradient(pos.x - r * 0.3, pos.y - r * 0.3, 0, pos.x, pos.y, r);
          grad.addColorStop(0, node.isUser ? '#1a3a2a' : '#222230');
          grad.addColorStop(1, node.isUser ? '#0d1f15' : '#15151f');
          ctx.fillStyle = grad;
          ctx.fill();
          // Initials
          ctx.fillStyle = node.isUser ? '#34d399' : '#888';
          ctx.font = `bold ${node.isUser ? 18 : 15}px Inter, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), pos.x, pos.y);
        }
        ctx.restore();

        // Border ring
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isHovered ? 'rgba(52,211,153,0.8)' : (node.isUser ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.1)');
        ctx.lineWidth = isHovered ? 2.5 : (node.isUser ? 2 : 1.5);
        ctx.stroke();

        // Name label with bg
        const name = node.name;
        ctx.font = `${isHovered ? '600' : '500'} 11px Inter, sans-serif`;
        const nameW = ctx.measureText(name).width;
        const labelY = pos.y + r + 14;

        // Pill background
        ctx.fillStyle = isHovered ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.roundRect(pos.x - nameW / 2 - 8, labelY - 8, nameW + 16, 16, 8);
        ctx.fill();

        ctx.fillStyle = isHovered ? '#34d399' : COLORS.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, pos.x, labelY);

        // Mood/category tag
        if (!node.isUser && (node.mood || node.category)) {
          const tag = node.mood || node.category;
          ctx.font = '9px Inter, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillText(tag, pos.x, labelY + 14);
        }

        ctx.textBaseline = 'alphabetic';
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { running = false; cancelAnimationFrame(animFrameRef.current); };
  }, [dimensions, hoveredNode, hoveredLink, characters, memories, messages, sharedMemories, user]);

  // Mouse/touch interaction
  const handleInteraction = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const positions = positionsRef.current;
    const charNodes = nodesRef.current.filter(n => !n.isUser);

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const r = i === 0 ? 32 : 26;
      if (Math.hypot(x - pos.x, y - pos.y) < r + 10) {
        setHoveredNode(i);
        setHoveredLink(null);
        return i;
      }
    }

    for (let li = 0; li < linksRef.current.length; li++) {
      const link = linksRef.current[li];
      const fromIdx = link.from === 'user' ? 0 : charNodes.findIndex(n => n.id === link.from) + 1;
      const toIdx = link.to === 'user' ? 0 : charNodes.findIndex(n => n.id === link.to) + 1;
      if (!positions[fromIdx] || !positions[toIdx]) continue;
      const ax = positions[fromIdx].x, ay = positions[fromIdx].y;
      const bx = positions[toIdx].x, by = positions[toIdx].y;
      const len = Math.hypot(bx - ax, by - ay);
      const dot = ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (len * len);
      const t = Math.max(0, Math.min(1, dot));
      const cx = ax + t * (bx - ax), cy = ay + t * (by - ay);
      if (Math.hypot(x - cx, y - cy) < 14) {
        setHoveredLink(li);
        setHoveredNode(null);
        return -(li + 1);
      }
    }

    setHoveredNode(null);
    setHoveredLink(null);
    return null;
  }, []);

  const handleClick = useCallback((e) => {
    const result = handleInteraction(e.clientX, e.clientY);
    if (result === null) return;
    if (result >= 0) {
      const charNodes = nodesRef.current.filter(n => !n.isUser);
      const node = result === 0 ? nodesRef.current[0] : charNodes[result - 1];
      if (node && !node.isUser && onSelectCharacter) onSelectCharacter(node.character);
    } else {
      const linkIdx = -(result + 1);
      const link = linksRef.current[linkIdx];
      if (link && onSelectLink) onSelectLink(link);
    }
  }, [handleInteraction, onSelectLink, onSelectCharacter]);

  const handleMouseMove = useCallback((e) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  const handleTouch = useCallback((e) => {
    const touch = e.touches[0];
    if (touch) handleInteraction(touch.clientX, touch.clientY);
  }, [handleInteraction]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[450px]">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height, cursor: (hoveredNode !== null || hoveredLink !== null) ? 'pointer' : 'default' }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredNode(null); setHoveredLink(null); }}
        onTouchStart={handleTouch}
      />
    </div>
  );
}