import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { TEXT_FONT, TITLE_FONT } from '../lib/fonts';
import { inkOn, type Palette } from '../lib/theme';
import { Background } from './Background';
import { Emoji } from './Emoji';
import { Sfx } from './Sfx';
import { DevineWord, fitFont } from './DevineTitle';

/** Accroche d'1,5 s : on annonce le jeu, et le premier film arrive tout de suite. */
export const Intro: React.FC<{ palette: Palette; packName: string; part?: number; count: number; think: number; beatFrames: number; devine: string; pluriel: string }> = ({ palette, packName, part, count, think, beatFrames, devine, pluriel }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame + 5, fps, config: { damping: 9, stiffness: 170, mass: 0.6 } });
  const slam = interpolate(frame, [0, 5], [1.22, 1], { extrapolateRight: 'clamp' });
  const pill = spring({ frame: frame + 2, fps, config: { damping: 11, stiffness: 160 } });
  const shake = frame >= 5 && frame < 13 ? Math.sin(frame * 2.7) * (13 - frame) * 1.6 : 0;
  return (
    <>
      <Background palette={palette} beatFrames={beatFrames} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, paddingBottom: 140, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        <div style={{ transform: `scale(${pop}) rotate(${(1 - pop) * -25 - 6}deg)` }}>
          <Emoji emoji="🍿" size={300} />
        </div>
        <div style={{ font: `${fitFont(devine, 176)}px/0.95 ${TITLE_FONT}`, color: '#fff', textAlign: 'center', textShadow: '0 14px 0 rgba(0,0,0,.25)', transform: `scale(${slam})` }}>
          DEVINE
          <br />
          <DevineWord devine={devine} acc={palette.acc} />
        </div>
        <div style={{ font: `700 60px ${TEXT_FONT}`, color: '#fff' }}>avec seulement des emojis</div>
        <div style={{ transform: `scale(${pill})`, font: `66px ${TITLE_FONT}`, background: palette.acc, color: inkOn(palette.acc), padding: '18px 48px 12px', borderRadius: 70, boxShadow: '0 12px 0 rgba(0,0,0,.22)', marginTop: 10 }}>
          {packName.toUpperCase()}
          {part ? ` · PARTIE ${part}` : ''}
        </div>
        <div style={{ font: `600 46px ${TEXT_FONT}`, color: '#fff', opacity: interpolate(frame, [0, 6], [0.4, 0.95], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>
          {count} {pluriel} · {think} secondes pour répondre
        </div>
      </div>
      <Sfx at={0} name="boum" volume={0.9} />
    </>
  );
};
