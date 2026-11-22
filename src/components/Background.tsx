import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { Palette } from '../lib/theme';

/** Fond à anneaux qui « respire » sur chaque temps de la musique. */
export const Background: React.FC<{ palette: Palette; beatFrames: number; beatOffset?: number }> = ({ palette, beatFrames, beatOffset = 0 }) => {
  const f = useCurrentFrame() - beatOffset;
  const phase = (((f % beatFrames) + beatFrames) % beatFrames) / beatFrames;
  const pulse = Math.exp(-phase * 5);
  const drift = Math.sin(f / 90) * 3;
  return (
    <AbsoluteFill style={{ background: palette.c1, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          inset: '-40%',
          background: `repeating-radial-gradient(circle at 50% 50%, ${palette.c1} 0 3.2%, ${palette.c2} 3.2% 6.4%)`,
          transform: `scale(${1 + pulse * 0.025}) rotate(${drift}deg)`,
        }}
      />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0) 40%, rgba(0,0,0,.18) 100%)' }} />
    </AbsoluteFill>
  );
};
