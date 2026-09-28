import React, { useRef, useEffect, useCallback } from 'react';
import {
  TILE_GRASS,
  TILE_PATH,
  TILE_FENCE,
  TILE_SHOP_HOTDOG,
  TILE_SHOP_ICECREAM,
  TILE_SHOP_DRINKS,
  TILE_SHOP_BALLOON,
  TILE_TREE_PINE,
  TILE_TREE_CHERRY,
  TILE_WATER,
  TILE_ICE,
  TILE_BAMBOO,
  TILE_SAVANNAH,
  TILE_BENCH,
  TILE_TRASH_BIN,
  TILE_FOUNTAIN,
  TILE_RESTROOM,
  TILE_ENTRANCE,
  Animal,
  Guest,
  Staff,
  Litter,
  FloatingText,
  ToolId,
  ANIMAL_CONFIGS
} from '../types/game';

interface GameCanvasProps {
  grid: number[][];
  cols: number;
  rows: number;
  tileSize: number;
  animals: Animal[];
  visitors: Guest[];
  staff: Staff[];
  litters: Litter[];
  floatingTexts: FloatingText[];
  currentTool: ToolId;
  dayTimeRatio: number; // 0 (morning) -> 0.5 (noon) -> 0.8 (dusk) -> 1 (night)
  weather: 'sunny' | 'breeze' | 'rain';
  onCellClick: (x: number, y: number) => void;
  onSelectEntity: (entity: { type: 'animal' | 'guest' | 'staff' | 'tile'; data: unknown }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  grid,
  cols,
  rows,
  tileSize,
  animals,
  visitors,
  staff,
  litters,
  floatingTexts,
  currentTool,
  dayTimeRatio,
  weather,
  onCellClick,
  onSelectEntity
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const hoverPosRef = useRef<{ x: number; y: number } | null>(null);
  const isMouseDownRef = useRef(false);
  const lastPaintedTileRef = useRef<{ x: number; y: number } | null>(null);
  const tickRef = useRef(0);

  // Helper to check neighbor tile
  const getTile = useCallback((x: number, y: number): number => {
    if (x < 0 || x >= cols || y < 0 || y >= rows) return -1;
    return grid[y]?.[x] ?? -1;
  }, [grid, cols, rows]);

  // Handle interaction coordinates
  const getGridCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;
    const gx = Math.floor(clientX / tileSize);
    const gy = Math.floor(clientY / tileSize);
    return { gx, gy, clientX, clientY };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getGridCoords(e);
    if (!coords) return;
    const { gx, gy, clientX, clientY } = coords;

    // Check if clicked directly on an entity in inspect mode or general click
    if (currentTool === 'inspect') {
      // Check animals first
      const clickedAnimal = animals.find(a => Math.hypot(a.x * tileSize - clientX, a.y * tileSize - clientY) < tileSize * 0.7);
      if (clickedAnimal) {
        onSelectEntity({ type: 'animal', data: clickedAnimal });
        return;
      }
      // Check guests
      const clickedGuest = visitors.find(v => Math.hypot((v.x + 0.5) * tileSize - clientX, (v.y + 0.5) * tileSize - clientY) < tileSize * 0.6);
      if (clickedGuest) {
        onSelectEntity({ type: 'guest', data: clickedGuest });
        return;
      }
      // Check staff
      const clickedStaff = staff.find(s => Math.hypot((s.x + 0.5) * tileSize - clientX, (s.y + 0.5) * tileSize - clientY) < tileSize * 0.6);
      if (clickedStaff) {
        onSelectEntity({ type: 'staff', data: clickedStaff });
        return;
      }
      // Inspect tile
      if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
        onSelectEntity({ type: 'tile', data: { x: gx, y: gy, tileType: grid[gy][gx] } });
        return;
      }
    }

    isMouseDownRef.current = true;
    lastPaintedTileRef.current = { x: gx, y: gy };
    onCellClick(gx, gy);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getGridCoords(e);
    if (!coords) return;
    const { gx, gy } = coords;
    hoverPosRef.current = { x: gx, y: gy };

    // Support drag-to-paint for paths, fences, water, savannah, etc.
    const dragTools: ToolId[] = ['path', 'fence', 'water', 'ice', 'bamboo', 'savannah', 'demolish'];
    if (isMouseDownRef.current && dragTools.includes(currentTool)) {
      if (
        !lastPaintedTileRef.current ||
        lastPaintedTileRef.current.x !== gx ||
        lastPaintedTileRef.current.y !== gy
      ) {
        lastPaintedTileRef.current = { x: gx, y: gy };
        onCellClick(gx, gy);
      }
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    lastPaintedTileRef.current = null;
  };

  const handleMouseLeave = () => {
    hoverPosRef.current = null;
    isMouseDownRef.current = false;
    lastPaintedTileRef.current = null;
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;

    const render = () => {
      tickRef.current++;
      const tick = tickRef.current;
      const width = cols * tileSize;
      const height = rows * tileSize;

      // Ensure crisp pixel rendering
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Tiles
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * tileSize;
          const py = r * tileSize;
          const t = grid[r][c];

          // Base grass on every cell
          const isEven = (r + c) % 2 === 0;
          ctx.fillStyle = isEven ? '#5da759' : '#549c50';
          ctx.fillRect(px, py, tileSize, tileSize);

          // Subtle grass blades
          ctx.fillStyle = isEven ? '#6bba66' : '#498c45';
          if ((r * 7 + c * 13) % 5 === 0) {
            ctx.fillRect(px + 6, py + 8, 2, 4);
            ctx.fillRect(px + 8, py + 6, 2, 6);
          } else if ((r * 3 + c * 11) % 4 === 0) {
            ctx.fillRect(px + 22, py + 18, 2, 5);
            ctx.fillRect(px + 20, py + 20, 2, 3);
          }

          // Specific Tile Render
          if (t === TILE_PATH) {
            // Cobblestone walkway with connecting texture
            ctx.fillStyle = '#c7b28c';
            ctx.fillRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
            ctx.fillStyle = '#a69068';
            ctx.fillRect(px + 3, py + 4, 10, 8);
            ctx.fillRect(px + 16, py + 4, 14, 8);
            ctx.fillRect(px + 5, py + 16, 12, 12);
            ctx.fillRect(px + 20, py + 16, 11, 12);
            // Highlights & shadow lines
            ctx.fillStyle = '#dfcfb1';
            ctx.fillRect(px + 2, py + 2, tileSize - 4, 2);
            ctx.fillStyle = '#7c6a49';
            ctx.fillRect(px + 2, py + tileSize - 3, tileSize - 4, 2);
          } else if (t === TILE_FENCE) {
            // Intelligent connected wooden fence rendering
            const up = getTile(c, r - 1) === TILE_FENCE;
            const down = getTile(c, r + 1) === TILE_FENCE;
            const left = getTile(c - 1, r) === TILE_FENCE;
            const right = getTile(c + 1, r) === TILE_FENCE;

            // Wood post base
            const cx = px + tileSize / 2;
            const cy = py + tileSize / 2;

            // Rail connections
            ctx.fillStyle = '#8a572a';
            ctx.strokeStyle = '#573311';
            ctx.lineWidth = 2;

            // Horizontal rails
            if (left) {
              ctx.fillRect(px, cy - 5, tileSize / 2, 4);
              ctx.fillRect(px, cy + 2, tileSize / 2, 4);
            }
            if (right) {
              ctx.fillRect(cx, cy - 5, tileSize / 2, 4);
              ctx.fillRect(cx, cy + 2, tileSize / 2, 4);
            }
            // Vertical rails
            if (up) {
              ctx.fillRect(cx - 5, py, 4, tileSize / 2);
              ctx.fillRect(cx + 2, py, 4, tileSize / 2);
            }
            if (down) {
              ctx.fillRect(cx - 5, cy, 4, tileSize / 2);
              ctx.fillRect(cx + 2, cy, 4, tileSize / 2);
            }

            // Central post
            ctx.fillStyle = '#b3763f';
            ctx.fillRect(cx - 6, cy - 8, 12, 16);
            ctx.fillStyle = '#db9c60';
            ctx.fillRect(cx - 4, cy - 6, 4, 12); // highlight
            ctx.fillStyle = '#5c3513';
            ctx.strokeRect(cx - 6, cy - 8, 12, 16);
          } else if (t === TILE_WATER) {
            // Shimmering water pond
            const waveOffset = Math.sin(tick * 0.08 + c + r) * 2;
            ctx.fillStyle = '#3993d3';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.fillStyle = '#2b78b0';
            ctx.fillRect(px + 4, py + 6 + waveOffset, tileSize - 8, 4);
            ctx.fillStyle = '#6bc5ff';
            ctx.fillRect(px + 8, py + 18 - waveOffset, 12, 3);
            ctx.fillRect(px + 22, py + 8 + waveOffset, 8, 2);
          } else if (t === TILE_ICE) {
            // Snowy ice sheet
            ctx.fillStyle = '#d2eefc';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.fillStyle = '#f3faff';
            ctx.fillRect(px + 4, py + 4, tileSize - 8, 6);
            ctx.fillStyle = '#8dc9ec';
            ctx.fillRect(px + 10, py + 16, 14, 4);
            ctx.fillRect(px + 20, py + 24, 8, 4);
          } else if (t === TILE_SAVANNAH) {
            // African savannah dirt / sand
            ctx.fillStyle = '#c99f57';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.fillStyle = '#dfba73';
            ctx.fillRect(px + 6, py + 6, 8, 6);
            ctx.fillRect(px + 20, py + 18, 10, 8);
            ctx.fillStyle = '#9e7531';
            ctx.fillRect(px + 14, py + 12, 3, 3);
            ctx.fillRect(px + 26, py + 8, 3, 3);
          } else if (t === TILE_BAMBOO) {
            // Lush bamboo stalks
            ctx.fillStyle = '#4c8c42';
            ctx.fillRect(px, py, tileSize, tileSize);
            // Bamboo canes
            ctx.fillStyle = '#2e6b24';
            ctx.fillRect(px + 8, py + 4, 4, tileSize - 8);
            ctx.fillRect(px + 20, py + 2, 5, tileSize - 4);
            // Joints
            ctx.fillStyle = '#8ce878';
            ctx.fillRect(px + 6, py + 12, 8, 2);
            ctx.fillRect(px + 18, py + 16, 9, 2);
            // Leaf cluster
            ctx.fillStyle = '#39992b';
            ctx.beginPath();
            ctx.arc(px + 14, py + 8, 6, 0, Math.PI * 2);
            ctx.fill();
          } else if (t === TILE_TREE_PINE) {
            // Pine tree
            ctx.fillStyle = '#6b4423';
            ctx.fillRect(px + 15, py + 22, 6, 12);
            ctx.fillStyle = '#1c4d1d';
            ctx.beginPath();
            ctx.moveTo(px + 18, py + 4);
            ctx.lineTo(px + 6, py + 18);
            ctx.lineTo(px + 30, py + 18);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(px + 18, py + 12);
            ctx.lineTo(px + 4, py + 24);
            ctx.lineTo(px + 32, py + 24);
            ctx.fill();
            // Snow/needle tip highlight
            ctx.fillStyle = '#2c732d';
            ctx.fillRect(px + 16, py + 6, 4, 4);
          } else if (t === TILE_TREE_CHERRY) {
            // Cherry blossom tree
            ctx.fillStyle = '#5c391e';
            ctx.fillRect(px + 16, py + 22, 5, 12);
            ctx.fillStyle = '#f07da1';
            ctx.beginPath();
            ctx.arc(px + 18, py + 15, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbc2d4';
            ctx.beginPath();
            ctx.arc(px + 15, py + 12, 8, 0, Math.PI * 2);
            ctx.fill();
          } else if (t === TILE_SHOP_HOTDOG) {
            // Hot dog stand
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            // White stripes on canopy
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 6, py + 2, 5, 10);
            ctx.fillRect(px + 18, py + 2, 5, 10);
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(px + 4, py + 18, tileSize - 8, 12);
            ctx.fillStyle = '#222';
            ctx.font = '14px monospace';
            ctx.fillText('🌭', px + 9, py + 25);
          } else if (t === TILE_SHOP_ICECREAM) {
            // Ice cream stand
            ctx.fillStyle = '#3498db';
            ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 6, py + 2, 6, 10);
            ctx.fillRect(px + 18, py + 2, 6, 10);
            ctx.fillStyle = '#fce4ec';
            ctx.fillRect(px + 4, py + 18, tileSize - 8, 12);
            ctx.font = '14px monospace';
            ctx.fillText('🍦', px + 9, py + 25);
          } else if (t === TILE_SHOP_DRINKS) {
            // Drinks stand
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(px + 4, py + 4, tileSize - 8, 8);
            ctx.font = '14px monospace';
            ctx.fillText('🥤', px + 9, py + 25);
          } else if (t === TILE_SHOP_BALLOON) {
            // Balloon cart
            ctx.fillStyle = '#8e44ad';
            ctx.fillRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            ctx.font = '14px monospace';
            ctx.fillText('🎈', px + 9, py + 24);
          } else if (t === TILE_BENCH) {
            // Park bench
            ctx.fillStyle = '#8d5524';
            ctx.fillRect(px + 6, py + 10, tileSize - 12, 16);
            ctx.fillStyle = '#c68642';
            ctx.fillRect(px + 8, py + 12, tileSize - 16, 5);
            ctx.fillRect(px + 8, py + 19, tileSize - 16, 5);
            ctx.fillStyle = '#333';
            ctx.fillRect(px + 6, py + 26, 3, 5);
            ctx.fillRect(px + tileSize - 9, py + 26, 3, 5);
          } else if (t === TILE_TRASH_BIN) {
            // Trash bin
            ctx.fillStyle = '#2e7d32';
            ctx.fillRect(px + 10, py + 12, 16, 18);
            ctx.fillStyle = '#1b5e20';
            ctx.fillRect(px + 8, py + 8, 20, 4);
            ctx.fillStyle = '#81c784';
            ctx.fillRect(px + 12, py + 16, 12, 2);
          } else if (t === TILE_FOUNTAIN) {
            // Animated water fountain
            ctx.fillStyle = '#78909c';
            ctx.beginPath();
            ctx.arc(px + 18, py + 18, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#29b6f6';
            ctx.beginPath();
            ctx.arc(px + 18, py + 18, 10, 0, Math.PI * 2);
            ctx.fill();
            // Spray droplet
            const spray = Math.sin(tick * 0.2) * 3;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px + 17, py + 14 + spray, 3, 3);
          } else if (t === TILE_RESTROOM) {
            // Restroom
            ctx.fillStyle = '#5d4037';
            ctx.fillRect(px + 3, py + 3, tileSize - 6, tileSize - 6);
            ctx.fillStyle = '#ffffff';
            ctx.font = '13px monospace';
            ctx.fillText('🚻', px + 9, py + 24);
          } else if (t === TILE_ENTRANCE) {
            // Main Park Entrance Gate
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.fillStyle = '#e67e22';
            ctx.fillRect(px + 2, py + 2, tileSize - 4, 8);
            ctx.fillStyle = '#f1c40f';
            ctx.font = 'bold 10px monospace';
            ctx.fillText('ZOO', px + 8, py + 18);
            ctx.font = '8px monospace';
            ctx.fillText('入口', px + 8, py + 29);
          }
        }
      }

      // 2. Draw Litters on Paths
      litters.forEach(l => {
        const lx = l.x * tileSize + 14;
        const ly = l.y * tileSize + 14;
        ctx.fillStyle = '#ff7043';
        ctx.fillRect(lx, ly, 4, 4);
        ctx.fillStyle = '#fff9c4';
        ctx.fillRect(lx + 2, ly - 2, 4, 4);
      });

      // 3. Draw Animals with cute animations
      animals.forEach(a => {
        const ax = a.x * tileSize;
        const ay = a.y * tileSize;
        const bounce = a.isSleeping ? 0 : Math.sin(tick * 0.15 + parseFloat(a.id.slice(-2) || '0')) * 2;

        ctx.save();
        ctx.translate(ax, ay + bounce);

        // Sleeping Zzz
        if (a.isSleeping) {
          ctx.fillStyle = '#64b5f6';
          ctx.font = '10px monospace';
          const zOffset = (tick % 60) * 0.2;
          ctx.fillText('z', 10, -6 - zOffset);
          ctx.fillText('Z', 15, -12 - zOffset);
        }

        // Animal Sprite Icon
        const cfg = ANIMAL_CONFIGS[a.type];
        ctx.font = '22px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cfg.icon, 0, 0);

        // Hunger / Health Gauge if hungry (< 40%)
        if (a.hunger < 40) {
          ctx.fillStyle = '#000000';
          ctx.fillRect(-12, -18, 24, 5);
          ctx.fillStyle = '#e74c3c';
          ctx.fillRect(-11, -17, Math.max(1, (a.hunger / 100) * 22), 3);
          ctx.font = '9px monospace';
          ctx.fillText('🍖', 14, -16);
        }

        // Animal Speech / Emote bubble
        if (a.emote && a.emote.timer > 0) {
          const textW = Math.max(38, a.emote.text.length * 10 + 10);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
          ctx.beginPath();
          ctx.roundRect(-textW / 2, -28, textW, 16, 4);
          ctx.fill();
          ctx.strokeStyle = '#333';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillStyle = '#111';
          ctx.font = '10px monospace';
          ctx.fillText(a.emote.text, 0, -20);
        }

        ctx.restore();
      });

      // 4. Draw Staff
      staff.forEach(s => {
        const sx = s.x * tileSize + 10;
        const sy = s.y * tileSize + 8;
        const legStep = Math.sin(tick * 0.3) > 0 ? 2 : -2;

        ctx.save();
        if (s.type === 'zookeeper') {
          // Khaki Zookeeper
          ctx.fillStyle = '#c2a649';
          ctx.fillRect(sx + 3, sy - 2, 10, 4); // Hat
          ctx.fillStyle = '#f1c27d';
          ctx.fillRect(sx + 3, sy + 2, 10, 8); // Head
          ctx.fillStyle = '#688a50';
          ctx.fillRect(sx + 1, sy + 10, 14, 10); // Shirt
          ctx.fillStyle = '#3e2723';
          ctx.fillRect(sx + 2, sy + 20, 5, 6 + legStep); // Left leg
          ctx.fillRect(sx + 9, sy + 20, 5, 6 - legStep); // Right leg
          // Food bucket
          ctx.fillStyle = '#90a4ae';
          ctx.fillRect(sx + 16, sy + 12, 6, 6);
        } else if (s.type === 'janitor') {
          // Blue Janitor with broom
          ctx.fillStyle = '#1976d2';
          ctx.fillRect(sx + 2, sy - 1, 12, 3);
          ctx.fillStyle = '#f1c27d';
          ctx.fillRect(sx + 3, sy + 2, 10, 8);
          ctx.fillStyle = '#455a64';
          ctx.fillRect(sx + 1, sy + 10, 14, 10);
          ctx.fillStyle = '#263238';
          ctx.fillRect(sx + 2, sy + 20, 5, 6 + legStep);
          ctx.fillRect(sx + 9, sy + 20, 5, 6 - legStep);
          // Broom handle
          ctx.fillStyle = '#8d6e63';
          ctx.fillRect(sx - 2, sy + 6, 2, 18);
          ctx.fillStyle = '#fbc02d';
          ctx.fillRect(sx - 4, sy + 22, 6, 4);
        } else {
          // Colorful Entertainer
          ctx.fillStyle = '#e91e63';
          ctx.fillRect(sx + 3, sy - 3, 10, 5);
          ctx.fillStyle = '#f1c27d';
          ctx.fillRect(sx + 3, sy + 2, 10, 8);
          ctx.fillStyle = '#9c27b0';
          ctx.fillRect(sx + 1, sy + 10, 14, 10);
          ctx.fillStyle = '#ffeb3b';
          ctx.fillRect(sx + 2, sy + 20, 5, 6 + legStep);
          ctx.fillRect(sx + 9, sy + 20, 5, 6 - legStep);
          // Tiny balloon
          ctx.fillStyle = '#ff4081';
          ctx.beginPath();
          ctx.arc(sx + 18, sy + 2, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 5. Draw Guests (Visitors)
      visitors.forEach(v => {
        const vx = v.x * tileSize + 10;
        const vy = v.y * tileSize + 8;
        const isMoving = Math.abs(v.destX - v.x) > 0.05 || Math.abs(v.destY - v.y) > 0.05;
        const legOffset = isMoving ? (Math.sin(tick * 0.35 + (v.x * 10)) > 0 ? 2 : -2) : 0;

        ctx.save();
        // Hair
        ctx.fillStyle = v.hairColor;
        ctx.fillRect(vx + 2, vy - 2, 12, 4);

        // Head
        ctx.fillStyle = '#f1c27d';
        ctx.fillRect(vx + 3, vy + 2, 10, 7);

        // Torso / Outfit
        ctx.fillStyle = v.color;
        ctx.fillRect(vx + 1, vy + 9, 14, 11);

        // Pants & Legs
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(vx + 2, vy + 20, 5, 6 + legOffset);
        ctx.fillRect(vx + 9, vy + 20, 5, 6 - legOffset);

        // Floating Balloon if owned
        if (v.balloonColor) {
          ctx.strokeStyle = '#888';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(vx + 13, vy + 12);
          ctx.lineTo(vx + 18, vy - 4);
          ctx.stroke();

          ctx.fillStyle = v.balloonColor;
          ctx.beginPath();
          ctx.arc(vx + 18, vy - 7, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Holding food/drink
        if (v.holdingFood) {
          ctx.font = '10px monospace';
          ctx.fillText(v.holdingFood, vx - 4, vy + 15);
        }

        // Occasional thought bubble
        if (v.happiness > 80 && Math.sin(tick * 0.05 + v.x) > 0.85) {
          ctx.font = '10px monospace';
          ctx.fillText('💖', vx + 8, vy - 6);
        } else if (v.happiness < 40 && Math.sin(tick * 0.05 + v.x) > 0.85) {
          ctx.font = '10px monospace';
          ctx.fillText('💢', vx + 8, vy - 6);
        }

        ctx.restore();
      });

      // 6. Floating Text Popups
      floatingTexts.forEach(ft => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, ft.opacity);
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 4;
        ctx.fillText(ft.text, ft.x * tileSize + tileSize / 2, ft.y * tileSize);
        ctx.restore();
      });

      // 7. Day / Night Overlay Filter
      // dayTimeRatio: 0 = day, 0.7 = sunset, 0.85 = night, 0.98 = dawn
      let overlayColor: string | null = null;
      if (dayTimeRatio >= 0.7 && dayTimeRatio < 0.82) {
        // Sunset / Dusk
        overlayColor = 'rgba(255, 120, 30, 0.18)';
      } else if (dayTimeRatio >= 0.82 || dayTimeRatio < 0.1) {
        // Night
        overlayColor = 'rgba(15, 20, 50, 0.42)';
      }

      if (overlayColor) {
        ctx.fillStyle = overlayColor;
        ctx.fillRect(0, 0, width, height);
      }

      // 8. Weather Atmosphere Overlay
      if (weather === 'rain') {
        ctx.strokeStyle = 'rgba(180, 220, 255, 0.4)';
        ctx.lineWidth = 1.5;
        const rainTick = tick % 100;
        for (let i = 0; i < 40; i++) {
          const rx = ((i * 73 + rainTick * 8) % width);
          const ry = ((i * 47 + rainTick * 16) % height);
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + 12);
          ctx.stroke();
        }
      } else if (weather === 'breeze') {
        // Falling petals / leaves
        ctx.fillStyle = 'rgba(255, 192, 203, 0.6)';
        for (let i = 0; i < 15; i++) {
          const px = ((i * 89 + tick * 1.5) % width);
          const py = ((i * 61 + tick * 0.8) % height);
          ctx.fillRect(px, py, 3, 3);
        }
      }

      // 9. Hover Cursor Indicator
      if (hoverPosRef.current) {
        const { x: hx, y: hy } = hoverPosRef.current;
        if (hx >= 0 && hx < cols && hy >= 0 && hy < rows) {
          ctx.strokeStyle = currentTool === 'demolish' ? '#ff3b30' : '#ffe600';
          ctx.lineWidth = 2;
          ctx.strokeRect(hx * tileSize + 1, hy * tileSize + 1, tileSize - 2, tileSize - 2);

          // Subtle inner tint
          ctx.fillStyle = currentTool === 'demolish' ? 'rgba(255, 59, 48, 0.25)' : 'rgba(255, 230, 0, 0.18)';
          ctx.fillRect(hx * tileSize + 1, hy * tileSize + 1, tileSize - 2, tileSize - 2);
        }
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [
    grid,
    cols,
    rows,
    tileSize,
    animals,
    visitors,
    staff,
    litters,
    floatingTexts,
    currentTool,
    dayTimeRatio,
    weather,
    getTile
  ]);

  return (
    <div className="relative border-4 border-[#332c22] rounded-xs shadow-[0_6px_0_rgba(0,0,0,0.5)] overflow-hidden bg-[#529650]">
      <canvas
        ref={canvasRef}
        width={cols * tileSize}
        height={rows * tileSize}
        className="block cursor-crosshair pixelated max-w-full h-auto select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};
