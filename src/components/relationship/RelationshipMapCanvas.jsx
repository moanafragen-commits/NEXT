import React, { useRef, useEffect, useState, useCallback } from 'react';

const COLORS = {
  bg: '#111111',
  node: '#1a1a1a',
  nodeBorder: '#333',
  nodeActive: '#10b981',
  text: '#e5e5e5',
  textDim: '#888',
  linkWeak: 'rgba(100,100,100,0.3)',
  linkMedium: 'rgba(16,185,129,0.4)',
  linkStrong: 'rgba(16,185,129,0.7)',
  linkVeryStrong: 'rgba(52,211,153,0.9)',
  userNode: '#10b981',
};

function getNodePositions(nodes, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const positions = [];

  // User node in center
  positions.push({ x: centerX, y: centerY, isUser: true });

  // Character nodes in a circle around center
  const count = nodes.length;
  const radius = Math.min(width, height) * 0.32;
  
  for (let i = 0; i < count; i++) {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    positions.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
      isUser: false
    });
  }

  return positions;
}

function getLinkColor(strength) {
  if (strength >= 8) return COLORS.linkVeryStrong;
  if (strength >= 5) return COLORS.linkStrong;
  if (strength >= 3) return COLORS.linkMedium;
  return COLORS.linkWeak;
}

function getLinkWidth(strength) {
  if (strength >= 8) return 3.5;
  if (strength >= 5) return 2.5;
  if (strength >= 3) return 1.5;
  return 1;
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

    // Build links: user <-> each character
    const links = [];
    characters.forEach(c => {
      const charMsgs = messages.filter(m => m.character_id === c.id);
      const charMems = memories.filter(m => m.character_id === c.id);
      const trust = c.trust_level || 5;
      const msgCount = charMsgs.length;
      const memCount = charMems.length;

      // Bond strength: weighted combination
      const bondStrength = Math.min(10, (trust * 0.4) + (Math.min(msgCount, 100) / 100 * 3) + (Math.min(memCount, 20) / 20 * 3));

      const highlights = [];
      // Key memories as highlights
      charMems
        .filter(m => m.importance_level === 'hoch')
        .slice(0, 3)
        .forEach(m => highlights.push({ type: 'memory', text: m.memory_text }));

      // Relationship events
      if (c.relationship_backstory) highlights.push({ type: 'backstory', text: c.relationship_backstory });
      if (c.inside_jokes) highlights.push({ type: 'joke', text: c.inside_jokes });
      if (c.shared_memories) highlights.push({ type: 'shared', text: c.shared_memories });

      links.push({
        from: 'user',
        to: c.id,
        strength: bondStrength,
        trust,
        msgCount,
        memCount,
        relationship: c.initial_relationship || 'Unbekannt',
        dynamic: c.relationship_dynamic || '',
        highlights,
        character: c
      });
    });

    // Character <-> Character links via SharedMemory
    if (sharedMemories && sharedMemories.length > 0) {
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
            from: a,
            to: b,
            strength: Math.min(6, val.count * 1.5),
            trust: 0,
            msgCount: 0,
            memCount: val.count,
            relationship: 'Klatsch/Info',
            dynamic: '',
            highlights: val.infos.slice(0, 3).map(t => ({ type: 'shared_info', text: t })),
            isCharLink: true
          });
        }
      });
    }

    nodesRef.current = nodes;
    linksRef.current = links;
  }, [characters, memories, messages, sharedMemories, user]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(height, 400) });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const charNodes = nodesRef.current.filter(n => !n.isUser);
    const positions = getNodePositions(charNodes, width, height);
    positionsRef.current = positions;

    // Clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, width, height);

    // Draw links
    linksRef.current.forEach((link, li) => {
      const fromIdx = link.from === 'user' ? 0 : charNodes.findIndex(n => n.id === link.from) + 1;
      const toIdx = link.to === 'user' ? 0 : charNodes.findIndex(n => n.id === link.to) + 1;
      if (fromIdx < 0 || toIdx < 0 || !positions[fromIdx] || !positions[toIdx]) return;

      const isHovered = hoveredLink === li;
      ctx.beginPath();
      ctx.moveTo(positions[fromIdx].x, positions[fromIdx].y);
      ctx.lineTo(positions[toIdx].x, positions[toIdx].y);
      ctx.strokeStyle = isHovered ? COLORS.nodeActive : getLinkColor(link.strength);
      ctx.lineWidth = isHovered ? getLinkWidth(link.strength) + 1.5 : getLinkWidth(link.strength);
      if (link.isCharLink) ctx.setLineDash([4, 4]);
      else ctx.setLineDash([]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Strength label at midpoint
      const mx = (positions[fromIdx].x + positions[toIdx].x) / 2;
      const my = (positions[fromIdx].y + positions[toIdx].y) / 2;
      ctx.fillStyle = isHovered ? '#fff' : '#666';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${link.strength.toFixed(1)}`, mx, my - 6);
      if (!link.isCharLink) {
        ctx.fillText(link.relationship, mx, my + 8);
      }
    });

    // Draw nodes
    positions.forEach((pos, i) => {
      const node = i === 0 ? nodesRef.current[0] : charNodes[i - 1];
      if (!node) return;
      const isHovered = hoveredNode === i;
      const r = node.isUser ? 28 : 24;

      // Glow
      if (isHovered || node.isUser) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 6, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(pos.x, pos.y, r, pos.x, pos.y, r + 8);
        gradient.addColorStop(0, node.isUser ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.2)');
        gradient.addColorStop(1, 'rgba(16,185,129,0)');
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Circle bg
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.node;
      ctx.fill();
      ctx.strokeStyle = isHovered ? COLORS.nodeActive : (node.isUser ? COLORS.userNode : COLORS.nodeBorder);
      ctx.lineWidth = isHovered ? 2.5 : (node.isUser ? 2 : 1.5);
      ctx.stroke();

      // Trust ring for characters
      if (!node.isUser && node.trust) {
        const trustAngle = (node.trust / 10) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, r + 3, -Math.PI / 2, -Math.PI / 2 + trustAngle);
        ctx.strokeStyle = node.trust >= 7 ? 'rgba(52,211,153,0.7)' : node.trust >= 4 ? 'rgba(251,191,36,0.5)' : 'rgba(239,68,68,0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Name
      ctx.fillStyle = isHovered ? '#fff' : COLORS.text;
      ctx.font = `${isHovered ? 'bold ' : ''}12px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(node.name, pos.x, pos.y + r + 16);

      // Category/mood subtitle
      if (!node.isUser) {
        ctx.fillStyle = COLORS.textDim;
        ctx.font = '10px sans-serif';
        ctx.fillText(node.category || '', pos.x, pos.y + r + 28);
      }

      // Initials inside circle
      ctx.fillStyle = node.isUser ? COLORS.userNode : '#aaa';
      ctx.font = `bold ${node.isUser ? 16 : 14}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const initials = node.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      ctx.fillText(initials, pos.x, pos.y);
      ctx.textBaseline = 'alphabetic';
    });
  }, [dimensions, hoveredNode, hoveredLink, characters, memories, messages, sharedMemories, user]);

  // Mouse/touch interaction
  const handleInteraction = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const positions = positionsRef.current;
    const charNodes = nodesRef.current.filter(n => !n.isUser);

    // Check nodes
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const r = i === 0 ? 28 : 24;
      if (Math.hypot(x - pos.x, y - pos.y) < r + 8) {
        setHoveredNode(i);
        setHoveredLink(null);
        return i;
      }
    }

    // Check links
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
      const dist = Math.hypot(x - cx, y - cy);
      if (dist < 12) {
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
    const rect = canvasRef.current.getBoundingClientRect();
    const result = handleInteraction(e.clientX, e.clientY);
    if (result === null) return;

    if (result >= 0) {
      // Clicked a node
      const charNodes = nodesRef.current.filter(n => !n.isUser);
      const node = result === 0 ? nodesRef.current[0] : charNodes[result - 1];
      if (node && !node.isUser && onSelectCharacter) onSelectCharacter(node.character);
    } else {
      // Clicked a link
      const linkIdx = -(result + 1);
      const link = linksRef.current[linkIdx];
      if (link && onSelectLink) onSelectLink(link);
    }
  }, [handleInteraction, onSelectLink, onSelectCharacter]);

  const handleMouseMove = useCallback((e) => {
    handleInteraction(e.clientX, e.clientY);
  }, [handleInteraction]);

  return (
    <div ref={containerRef} className="w-full h-full min-h-[400px]">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height, cursor: (hoveredNode !== null || hoveredLink !== null) ? 'pointer' : 'default' }}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHoveredNode(null); setHoveredLink(null); }}
      />
    </div>
  );
}