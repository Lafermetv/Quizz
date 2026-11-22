import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import type { Palette } from '../lib/theme';

/** Les 10 motifs de fond. Chacun bouge et « respire » sur le temps de la musique. */
export const BACKGROUNDS = ['anneaux', 'rayons', 'vagues', 'losanges', 'damier', 'rayures', 'pois', 'zigzag', 'carres', 'etoiles'] as const;
export type BgStyle = (typeof BACKGROUNDS)[number];

const svg = (s: string) => `url("data:image/svg+xml,${encodeURIComponent(s)}")`;

const pattern = (style: BgStyle, a: string, b: string, t: number): React.CSSProperties => {
  const move = t * 40; // pixels de défilement par seconde
  switch (style) {
    case 'anneaux':
      return { background: `repeating-radial-gradient(circle at 50% 45%, ${a} 0 ${44 + 0}px, ${b} 44px 88px)`, backgroundPosition: '0 0' };
    case 'rayons':
      return { background: `repeating-conic-gradient(from ${t * 12}deg at 50% 45%, ${a} 0 10deg, ${b} 10deg 20deg)` };
    case 'vagues':
      return { backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='240' height='88'><rect width='240' height='88' fill='${a}'/><path d='M0 44 Q60 4 120 44 T240 44 V88 H0Z' fill='${b}'/></svg>`), backgroundSize: '240px 88px', backgroundPosition: `${move * 2}px ${move}px` };
    case 'losanges':
      return { background: `conic-gradient(from 45deg at 50% 50%, ${b} 25%, ${a} 0 50%, ${b} 0 75%, ${a} 0)`, backgroundSize: '120px 120px', backgroundPosition: `${move}px ${move}px` };
    case 'damier':
      return { background: `repeating-conic-gradient(${a} 0 25%, ${b} 0 50%)`, backgroundSize: '176px 176px', backgroundPosition: `${move}px ${-move}px` };
    case 'rayures':
      return { background: `repeating-linear-gradient(45deg, ${a} 0 48px, ${b} 48px 96px)`, backgroundSize: '136px 136px', backgroundPosition: `${move * 2}px 0` };
    case 'pois':
      return { background: `radial-gradient(circle, ${b} 24px, transparent 25px) 0 0 / 104px 104px, ${a}`, backgroundPosition: `${move}px ${move}px, 0 0` };
    case 'zigzag':
      return { backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='150' height='150' fill='${a}'/><path d='M0 0 L75 75 L150 0Z' fill='${b}'/></svg>`), backgroundSize: '150px 150px', backgroundPosition: `${move * 1.5}px ${move}px` };
    case 'carres':
      return { background: `repeating-conic-gradient(from 45deg at 50% 45%, ${a} 0 0)`, backgroundImage: `repeating-linear-gradient(${a} 0 0)` };
    case 'etoiles':
      return { backgroundImage: svg(`<svg xmlns='http://www.w3.org/2000/svg' width='150' height='150'><rect width='150' height='150' fill='${a}'/><path d='M75 30l13 28 30 4-22 21 6 30-27-15-27 15 6-30-22-21 30-4z' fill='${b}'/></svg>`), backgroundSize: '150px 150px', backgroundPosition: `${-move}px ${move}px` };
  }
};

const Squares: React.FC<{ a: string; b: string; t: number }> = ({ a, b, t }) => (
  <AbsoluteFill style={{ background: a, overflow: 'hidden' }}>
    {Array.from({ length: 26 }, (_, i) => {
      const s = ((26 - i) * 96 + (t * 60) % 192);
      return <div key={i} style={{ position: 'absolute', left: 540 - s / 2, top: 864 - s / 2, width: s, height: s, background: i % 2 ? a : b, transform: `rotate(${t * 4}deg)` }} />;
    })}
  </AbsoluteFill>
);

export const Background: React.FC<{ palette: Palette; beatFrames: number; beatOffset?: number; style?: BgStyle }> = ({ palette, beatFrames, beatOffset = 0, style = 'anneaux' }) => {
  const frame = useCurrentFrame();
  const f = frame - beatOffset;
  const t = frame / 30;
  const phase = (((f % beatFrames) + beatFrames) % beatFrames) / beatFrames;
  const pulse = Math.exp(-phase * 5);
  return (
    <AbsoluteFill style={{ background: palette.c1, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: '-20%', transform: `scale(${1 + pulse * 0.025})` }}>
        {style === 'carres' ? <Squares a={palette.c1} b={palette.c2} t={t} /> : <AbsoluteFill style={pattern(style, palette.c1, palette.c2, t)} />}
      </div>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(255,255,255,0) 40%, rgba(0,0,0,.18) 100%)' }} />
    </AbsoluteFill>
  );
};
