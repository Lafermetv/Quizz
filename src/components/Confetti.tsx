import React from 'react';
import { random, useCurrentFrame, useVideoConfig } from 'remotion';

const COLORS = ['#ffffff', '#c6ff3d', '#ffe03d', '#ff4f9a', '#3be0ff'];

/** Explosion de confettis (déterministe : identique à chaque rendu). */
export const Confetti: React.FC<{ at: number; x: number; y: number; count?: number; seed: string }> = ({ at, x, y, count = 44, seed }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - at) / fps;
  if (t < 0 || t > 1.6) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const a = random(`${seed}-a-${i}`) * Math.PI * 2;
        const v = 700 + random(`${seed}-v-${i}`) * 1100;
        const drag = Math.exp(-t * 2.2);
        const dist = (v * (1 - drag)) / 2.2;
        const px = x + Math.cos(a) * dist;
        const py = y + Math.sin(a) * dist + 900 * t * t;
        const rot = random(`${seed}-r-${i}`) * 720 * t + i * 30;
        const op = t < 1 ? 1 : 1 - (t - 1) / 0.6;
        const w = 22 + random(`${seed}-w-${i}`) * 12;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: px - w / 2,
              top: py - w * 0.75,
              width: w,
              height: w * 1.5,
              borderRadius: 6,
              background: COLORS[i % COLORS.length],
              transform: `rotate(${rot}deg) rotateX(${rot * 1.7}deg)`,
              opacity: op,
            }}
          />
        );
      })}
    </>
  );
};
