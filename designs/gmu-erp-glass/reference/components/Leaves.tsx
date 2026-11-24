import { useMemo } from 'react';
import Snowfall from 'react-snowfall';
import { useReducedMotion } from '../hooks';

// Falling leaves (react-snowfall drawing leaf images instead of snowflakes).
// The leaf images are drawn once on small canvases in the theme's maroon and gold tints.

const TINTS = ['rgba(198,162,88,.85)', 'rgba(140,74,78,.55)', 'rgba(214,150,120,.75)', 'rgba(224,186,110,.8)', 'rgba(170,100,90,.6)'];

function leafImage(color: string) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 64;
  const g = c.getContext('2d')!;
  g.translate(32, 32);
  g.rotate(Math.PI / 5);
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(0, -27);
  g.quadraticCurveTo(22, -5, 0, 27);
  g.quadraticCurveTo(-22, -5, 0, -27);
  g.fill();
  g.strokeStyle = 'rgba(255,255,255,.45)';
  g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 24); g.stroke();
  return c;
}

export const LEAVES_KEY = 'gmu-leaves';
export function leavesWanted() {
  try { return localStorage.getItem(LEAVES_KEY) !== 'off'; } catch { return true; }
}

export default function Leaves() {
  const reduce = useReducedMotion();
  const images = useMemo(() => TINTS.map(leafImage), []);
  if (reduce) return null;
  const count = Math.round(Math.min(30, Math.max(12, window.innerWidth / 70)));
  return (
    <Snowfall images={images} snowflakeCount={count} radius={[22, 42]} speed={[0.7, 1.7]} wind={[-0.4, 1.2]}
      rotationSpeed={[-1.2, 1.2]}
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }} />
  );
}
